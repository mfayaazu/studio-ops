package com.studioops.followup.task;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantContext;
import com.studioops.studio.StudioRepository;
import com.studioops.project.ProjectRepository;
import com.studioops.client.ClientRepository;
import com.studioops.followup.sequence.FollowUpSequenceRepository;
import com.studioops.followup.sequence.FollowUpStepRepository;
import com.studioops.followup.template.MessageTemplateRepository;
import com.studioops.followup.log.CommunicationLogService;
import com.studioops.followup.log.dto.CommunicationLogCreateRequest;
import com.studioops.followup.log.CommunicationDirection;
import com.studioops.followup.log.CommunicationProvider;
import com.studioops.followup.log.CommunicationLogStatus;
import com.studioops.followup.template.CommunicationChannel;
import com.studioops.followup.task.dto.FollowUpTaskCreateRequest;
import com.studioops.followup.task.dto.FollowUpTaskResponse;
import com.studioops.followup.task.dto.FollowUpTaskUpdateRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class FollowUpTaskService {

    @Value("${studioops.beta.whatsapp-only:true}")
    private boolean betaWhatsappOnly;

    private final FollowUpTaskRepository followUpTaskRepository;
    private final StudioRepository studioRepository;
    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final FollowUpSequenceRepository followUpSequenceRepository;
    private final FollowUpStepRepository followUpStepRepository;
    private final MessageTemplateRepository messageTemplateRepository;
    private final CommunicationLogService communicationLogService;
    private final TenantContext tenantContext;

    public FollowUpTaskService(
            FollowUpTaskRepository followUpTaskRepository,
            StudioRepository studioRepository,
            ProjectRepository projectRepository,
            ClientRepository clientRepository,
            FollowUpSequenceRepository followUpSequenceRepository,
            FollowUpStepRepository followUpStepRepository,
            MessageTemplateRepository messageTemplateRepository,
            CommunicationLogService communicationLogService,
            TenantContext tenantContext) {
        this.followUpTaskRepository = followUpTaskRepository;
        this.studioRepository = studioRepository;
        this.projectRepository = projectRepository;
        this.clientRepository = clientRepository;
        this.followUpSequenceRepository = followUpSequenceRepository;
        this.followUpStepRepository = followUpStepRepository;
        this.messageTemplateRepository = messageTemplateRepository;
        this.communicationLogService = communicationLogService;
        this.tenantContext = tenantContext;
    }

    public FollowUpTaskResponse createTask(FollowUpTaskCreateRequest request) {
        UUID currentStudioId = tenantContext.getCurrentStudioId();
        if (request.getStudioId() != null && !request.getStudioId().equals(currentStudioId)) {
            throw new IllegalArgumentException("Mismatched studio ID provided");
        }
        UUID studioId = currentStudioId;

        if (!studioRepository.existsById(studioId)) {
            throw new IllegalArgumentException("Studio not found with id: " + studioId);
        }

        if (request.getProjectId() != null) {
            projectRepository.findByIdAndStudioId(request.getProjectId(), studioId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + request.getProjectId() + " for studio: " + studioId));
        }

        if (request.getClientId() != null) {
            clientRepository.findByIdAndStudioId(request.getClientId(), studioId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found with id: " + request.getClientId() + " for studio: " + studioId));
        }

        if (request.getSequenceId() != null) {
            followUpSequenceRepository.findByIdAndStudioId(request.getSequenceId(), studioId)
                .orElseThrow(() -> new IllegalArgumentException("Sequence not found with id: " + request.getSequenceId() + " for studio: " + studioId));
        }

        if (request.getStepId() != null) {
            followUpStepRepository.findByIdAndStudioId(request.getStepId(), studioId)
                .orElseThrow(() -> new IllegalArgumentException("Step not found with id: " + request.getStepId() + " for studio: " + studioId));
        }

        if (request.getTemplateId() != null) {
            messageTemplateRepository.findByIdAndStudioId(request.getTemplateId(), studioId)
                .orElseThrow(() -> new IllegalArgumentException("Template not found with id: " + request.getTemplateId() + " for studio: " + studioId));
        }

        FollowUpTask task = new FollowUpTask();
        task.setStudioId(studioId);
        task.setProjectId(request.getProjectId());
        task.setClientId(request.getClientId());
        task.setSequenceId(request.getSequenceId());
        task.setStepId(request.getStepId());
        task.setTemplateId(request.getTemplateId());
        
        // Coerce to WHATSAPP if beta flag is active
        // TODO: Replace configurable beta flag with dynamic environment configuration before production.
        if (betaWhatsappOnly) {
            task.setChannel(CommunicationChannel.WHATSAPP);
        } else {
            task.setChannel(request.getChannel());
        }

        task.setScheduledAt(request.getScheduledAt());
        task.setStatus(request.getStatus() != null ? request.getStatus() : FollowUpTaskStatus.PENDING_APPROVAL);
        task.setRecipient(request.getRecipient() != null ? request.getRecipient().trim() : null);
        task.setSubject(request.getSubject() != null ? request.getSubject().trim() : null);
        task.setMessageBody(request.getMessageBody().trim());

        FollowUpTask saved = followUpTaskRepository.save(task);
        return FollowUpTaskMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<FollowUpTaskResponse> listTasks(FollowUpTaskStatus status, UUID projectId, UUID clientId) {
        List<FollowUpTask> tasks;
        UUID studioId = tenantContext.getCurrentStudioId();
        if (status != null) {
            tasks = followUpTaskRepository.findByStudioIdAndStatus(studioId, status);
        } else if (projectId != null) {
            tasks = followUpTaskRepository.findByProjectIdAndStudioId(projectId, studioId);
        } else if (clientId != null) {
            tasks = followUpTaskRepository.findByClientIdAndStudioId(clientId, studioId);
        } else {
            tasks = followUpTaskRepository.findAllByStudioId(studioId);
        }
        return tasks.stream()
                .map(FollowUpTaskMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FollowUpTaskResponse> getDueTasks() {
        return followUpTaskRepository.findByStudioIdAndScheduledAtLessThanEqualAndStatus(
                tenantContext.getCurrentStudioId(),
                Instant.now(),
                FollowUpTaskStatus.PENDING_APPROVAL
        ).stream()
                .map(FollowUpTaskMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public FollowUpTaskResponse getTaskById(UUID id) {
        FollowUpTask task = followUpTaskRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up task not found with id: " + id));
        return FollowUpTaskMapper.toResponse(task);
    }

    public FollowUpTaskResponse updateTask(UUID id, FollowUpTaskUpdateRequest request) {
        FollowUpTask task = followUpTaskRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up task not found with id: " + id));

        if (task.getStatus() == FollowUpTaskStatus.SENT || task.getStatus() == FollowUpTaskStatus.SKIPPED || task.getStatus() == FollowUpTaskStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot update follow-up task with status: " + task.getStatus());
        }

        task.setScheduledAt(request.getScheduledAt());
        task.setRecipient(request.getRecipient() != null ? request.getRecipient().trim() : null);
        task.setSubject(request.getSubject() != null ? request.getSubject().trim() : null);
        task.setMessageBody(request.getMessageBody().trim());

        FollowUpTask updated = followUpTaskRepository.save(task);
        return FollowUpTaskMapper.toResponse(updated);
    }

    public void deleteTask(UUID id) {
        FollowUpTask task = followUpTaskRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up task not found with id: " + id));
        followUpTaskRepository.delete(task);
    }

    public FollowUpTaskResponse approveTask(UUID id) {
        FollowUpTask task = followUpTaskRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up task not found with id: " + id));

        if (task.getStatus() == FollowUpTaskStatus.SENT) {
            throw new IllegalArgumentException("Task has already been sent");
        }
        if (task.getStatus() == FollowUpTaskStatus.SKIPPED || task.getStatus() == FollowUpTaskStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot approve a task that is " + task.getStatus());
        }

        task.setStatus(FollowUpTaskStatus.SENT);
        task.setSentAt(Instant.now());
        FollowUpTask saved = followUpTaskRepository.save(task);

        // Create outbound communication log for sent/approved task
        CommunicationLogCreateRequest logRequest = new CommunicationLogCreateRequest();
        logRequest.setStudioId(saved.getStudioId());
        logRequest.setProjectId(saved.getProjectId());
        logRequest.setClientId(saved.getClientId());
        logRequest.setFollowUpTaskId(saved.getId());
        logRequest.setChannel(saved.getChannel());
        logRequest.setDirection(CommunicationDirection.OUTBOUND);
        logRequest.setRecipient(saved.getRecipient());
        logRequest.setSubject(saved.getSubject());
        logRequest.setMessageBody(saved.getMessageBody());
        if (saved.getChannel() == CommunicationChannel.WHATSAPP) {
            logRequest.setProvider(CommunicationProvider.MANUAL_WHATSAPP);
        } else {
            logRequest.setProvider(CommunicationProvider.MANUAL_DEMO);
        }
        logRequest.setStatus(CommunicationLogStatus.SENT);
        logRequest.setSentAt(saved.getSentAt());

        communicationLogService.createLog(logRequest);

        return FollowUpTaskMapper.toResponse(saved);
    }

    public FollowUpTaskResponse skipTask(UUID id) {
        FollowUpTask task = followUpTaskRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up task not found with id: " + id));

        if (task.getStatus() == FollowUpTaskStatus.SENT || task.getStatus() == FollowUpTaskStatus.SKIPPED || task.getStatus() == FollowUpTaskStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot skip a task that is already " + task.getStatus());
        }

        task.setStatus(FollowUpTaskStatus.SKIPPED);
        task.setSkippedAt(Instant.now());
        FollowUpTask saved = followUpTaskRepository.save(task);

        // Create outbound communication log for skipped task
        CommunicationLogCreateRequest logRequest = new CommunicationLogCreateRequest();
        logRequest.setStudioId(saved.getStudioId());
        logRequest.setProjectId(saved.getProjectId());
        logRequest.setClientId(saved.getClientId());
        logRequest.setFollowUpTaskId(saved.getId());
        logRequest.setChannel(saved.getChannel());
        logRequest.setDirection(CommunicationDirection.OUTBOUND);
        logRequest.setRecipient(saved.getRecipient());
        logRequest.setSubject(saved.getSubject());
        logRequest.setMessageBody(saved.getMessageBody());
        logRequest.setProvider(CommunicationProvider.MANUAL_DEMO);
        logRequest.setStatus(CommunicationLogStatus.SKIPPED);
        logRequest.setSentAt(saved.getSkippedAt());

        communicationLogService.createLog(logRequest);

        return FollowUpTaskMapper.toResponse(saved);
    }

    public FollowUpTaskResponse cancelTask(UUID id) {
        FollowUpTask task = followUpTaskRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up task not found with id: " + id));

        if (task.getStatus() == FollowUpTaskStatus.SENT || task.getStatus() == FollowUpTaskStatus.SKIPPED || task.getStatus() == FollowUpTaskStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot cancel a task that is already " + task.getStatus());
        }

        task.setStatus(FollowUpTaskStatus.CANCELLED);
        FollowUpTask saved = followUpTaskRepository.save(task);
        return FollowUpTaskMapper.toResponse(saved);
    }
}
