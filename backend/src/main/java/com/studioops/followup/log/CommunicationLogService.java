package com.studioops.followup.log;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantContext;
import com.studioops.studio.StudioRepository;
import com.studioops.project.ProjectRepository;
import com.studioops.client.ClientRepository;
import com.studioops.followup.task.FollowUpTaskRepository;
import com.studioops.followup.log.dto.CommunicationLogCreateRequest;
import com.studioops.followup.log.dto.CommunicationLogResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CommunicationLogService {

    private final CommunicationLogRepository communicationLogRepository;
    private final StudioRepository studioRepository;
    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final FollowUpTaskRepository followUpTaskRepository;
    private final TenantContext tenantContext;

    public CommunicationLogService(
            CommunicationLogRepository communicationLogRepository,
            StudioRepository studioRepository,
            ProjectRepository projectRepository,
            ClientRepository clientRepository,
            FollowUpTaskRepository followUpTaskRepository,
            TenantContext tenantContext) {
        this.communicationLogRepository = communicationLogRepository;
        this.studioRepository = studioRepository;
        this.projectRepository = projectRepository;
        this.clientRepository = clientRepository;
        this.followUpTaskRepository = followUpTaskRepository;
        this.tenantContext = tenantContext;
    }

    public CommunicationLogResponse createLog(CommunicationLogCreateRequest request) {
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

        if (request.getFollowUpTaskId() != null) {
            followUpTaskRepository.findByIdAndStudioId(request.getFollowUpTaskId(), studioId)
                .orElseThrow(() -> new IllegalArgumentException("Follow-up task not found with id: " + request.getFollowUpTaskId() + " for studio: " + studioId));
        }

        CommunicationLog log = new CommunicationLog();
        log.setStudioId(studioId);
        log.setProjectId(request.getProjectId());
        log.setClientId(request.getClientId());
        log.setFollowUpTaskId(request.getFollowUpTaskId());
        log.setChannel(request.getChannel());
        log.setDirection(request.getDirection());
        log.setRecipient(request.getRecipient() != null ? request.getRecipient().trim() : null);
        log.setSubject(request.getSubject() != null ? request.getSubject().trim() : null);
        log.setMessageBody(request.getMessageBody() != null ? request.getMessageBody().trim() : null);
        log.setProvider(request.getProvider());
        log.setProviderMessageId(request.getProviderMessageId() != null ? request.getProviderMessageId().trim() : null);
        log.setStatus(request.getStatus());
        log.setSentAt(request.getSentAt());
        log.setDeliveredAt(request.getDeliveredAt());
        log.setReadAt(request.getReadAt());
        log.setErrorMessage(request.getErrorMessage() != null ? request.getErrorMessage().trim() : null);

        CommunicationLog saved = communicationLogRepository.save(log);
        return CommunicationLogMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CommunicationLogResponse> listLogs() {
        return listLogsForStudio(tenantContext.getCurrentStudioId());
    }

    @Transactional(readOnly = true)
    public List<CommunicationLogResponse> listLogsForStudio(UUID studioId) {
        return communicationLogRepository.findAllByStudioId(studioId).stream()
                .map(CommunicationLogMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CommunicationLogResponse getLogById(UUID id) {
        CommunicationLog log = communicationLogRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Communication log not found with id: " + id));
        return CommunicationLogMapper.toResponse(log);
    }

    @Transactional(readOnly = true)
    public List<CommunicationLogResponse> listLogsByProjectId(UUID projectId) {
        UUID studioId = tenantContext.getCurrentStudioId();
        projectRepository.findByIdAndStudioId(projectId, studioId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        return communicationLogRepository.findByProjectIdAndStudioId(projectId, studioId).stream()
                .map(CommunicationLogMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CommunicationLogResponse> listLogsByClientId(UUID clientId) {
        UUID studioId = tenantContext.getCurrentStudioId();
        clientRepository.findByIdAndStudioId(clientId, studioId)
            .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + clientId));
        return communicationLogRepository.findByClientIdAndStudioId(clientId, studioId).stream()
                .map(CommunicationLogMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CommunicationLogResponse> listLogsByTaskId(UUID taskId) {
        UUID studioId = tenantContext.getCurrentStudioId();
        followUpTaskRepository.findByIdAndStudioId(taskId, studioId)
            .orElseThrow(() -> new ResourceNotFoundException("Follow-up task not found with id: " + taskId));
        return communicationLogRepository.findByFollowUpTaskIdAndStudioId(taskId, studioId).stream()
                .map(CommunicationLogMapper::toResponse)
                .toList();
    }
}
