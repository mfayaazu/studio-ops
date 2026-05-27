package com.studioops.followup.task;

import com.studioops.common.tenant.TenantContext;
import com.studioops.common.tenant.TenantConstants;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.studio.StudioRepository;
import com.studioops.project.ProjectRepository;
import com.studioops.project.Project;
import com.studioops.client.ClientRepository;
import com.studioops.client.Client;
import com.studioops.followup.sequence.FollowUpSequenceRepository;
import com.studioops.followup.sequence.FollowUpSequence;
import com.studioops.followup.sequence.FollowUpStepRepository;
import com.studioops.followup.sequence.FollowUpStep;
import com.studioops.followup.template.MessageTemplateRepository;
import com.studioops.followup.template.MessageTemplate;
import com.studioops.followup.template.CommunicationChannel;
import com.studioops.followup.log.CommunicationLogService;
import com.studioops.followup.log.dto.CommunicationLogCreateRequest;
import com.studioops.followup.task.dto.FollowUpTaskCreateRequest;
import com.studioops.followup.task.dto.FollowUpTaskResponse;
import com.studioops.followup.task.dto.FollowUpTaskUpdateRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class FollowUpTaskServiceTest {
    @Mock
    private TenantContext tenantContext;


    @Mock
    private FollowUpTaskRepository followUpTaskRepository;
    @Mock
    private StudioRepository studioRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private ClientRepository clientRepository;
    @Mock
    private FollowUpSequenceRepository followUpSequenceRepository;
    @Mock
    private FollowUpStepRepository followUpStepRepository;
    @Mock
    private MessageTemplateRepository messageTemplateRepository;
    @Mock
    private CommunicationLogService communicationLogService;

    @InjectMocks
    private FollowUpTaskService followUpTaskService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(tenantContext.getCurrentStudioId()).thenReturn(TenantConstants.DEFAULT_STUDIO_ID);
        when(studioRepository.existsById(any(UUID.class))).thenReturn(true);
    }

    @Test
    void createTask_Success() {
        UUID projectId = UUID.randomUUID();
        UUID clientId = UUID.randomUUID();
        UUID sequenceId = UUID.randomUUID();
        UUID stepId = UUID.randomUUID();
        UUID templateId = UUID.randomUUID();

        FollowUpTaskCreateRequest request = new FollowUpTaskCreateRequest(
                TenantConstants.DEFAULT_STUDIO_ID, projectId, clientId, sequenceId, stepId, templateId,
                CommunicationChannel.EMAIL, Instant.now(), FollowUpTaskStatus.PENDING_APPROVAL,
                "client@example.com", "Follow Up", "Body text"
        );

        Project project = new Project();
        project.setId(projectId);
        project.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        Client client = new Client();
        client.setId(clientId);
        client.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        FollowUpSequence seq = new FollowUpSequence();
        seq.setId(sequenceId);
        seq.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        FollowUpStep step = new FollowUpStep();
        step.setId(stepId);
        step.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        MessageTemplate template = new MessageTemplate();
        template.setId(templateId);
        template.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(project));
        when(clientRepository.findByIdAndStudioId(clientId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(client));
        when(followUpSequenceRepository.findByIdAndStudioId(sequenceId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(seq));
        when(followUpStepRepository.findByIdAndStudioId(stepId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(step));
        when(messageTemplateRepository.findByIdAndStudioId(templateId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(template));

        FollowUpTask task = new FollowUpTask();
        task.setId(UUID.randomUUID());
        task.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        task.setProjectId(projectId);
        task.setClientId(clientId);
        task.setSequenceId(sequenceId);
        task.setStepId(stepId);
        task.setTemplateId(templateId);
        task.setChannel(CommunicationChannel.EMAIL);
        task.setScheduledAt(request.getScheduledAt());
        task.setStatus(FollowUpTaskStatus.PENDING_APPROVAL);
        task.setRecipient(request.getRecipient());
        task.setSubject(request.getSubject());
        task.setMessageBody(request.getMessageBody());

        when(followUpTaskRepository.save(any(FollowUpTask.class))).thenReturn(task);

        FollowUpTaskResponse response = followUpTaskService.createTask(request);

        assertNotNull(response);
        assertEquals(task.getId(), response.getId());
        assertEquals(FollowUpTaskStatus.PENDING_APPROVAL, response.getStatus());
        verify(followUpTaskRepository, times(1)).save(any(FollowUpTask.class));
    }

    @Test
    void createTask_RelationStudioMismatch_ThrowsException() {
        UUID projectId = UUID.randomUUID();
        FollowUpTaskCreateRequest request = new FollowUpTaskCreateRequest(
                TenantConstants.DEFAULT_STUDIO_ID, projectId, null, null, null, null,
                CommunicationChannel.EMAIL, Instant.now(), FollowUpTaskStatus.PENDING_APPROVAL,
                "client@example.com", "Follow Up", "Body text"
        );

        // Project belongs to different studio
        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> followUpTaskService.createTask(request));
        verify(followUpTaskRepository, never()).save(any());
    }

    @Test
    void listTasks_Success() {
        FollowUpTask t1 = new FollowUpTask();
        t1.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        t1.setStatus(FollowUpTaskStatus.PENDING_APPROVAL);

        when(followUpTaskRepository.findByStudioIdAndStatus(TenantConstants.DEFAULT_STUDIO_ID, FollowUpTaskStatus.PENDING_APPROVAL))
                .thenReturn(List.of(t1));

        List<FollowUpTaskResponse> list = followUpTaskService.listTasks(FollowUpTaskStatus.PENDING_APPROVAL, null, null);
        assertEquals(1, list.size());
    }

    @Test
    void getDueTasks_Success() {
        FollowUpTask t1 = new FollowUpTask();
        t1.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        t1.setStatus(FollowUpTaskStatus.PENDING_APPROVAL);
        t1.setScheduledAt(Instant.now().minusSeconds(10));

        when(followUpTaskRepository.findByStudioIdAndScheduledAtLessThanEqualAndStatus(any(), any(), any()))
                .thenReturn(List.of(t1));

        List<FollowUpTaskResponse> list = followUpTaskService.getDueTasks();
        assertEquals(1, list.size());
    }

    @Test
    void updateTask_Success() {
        UUID taskId = UUID.randomUUID();
        FollowUpTask task = new FollowUpTask();
        task.setId(taskId);
        task.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        task.setStatus(FollowUpTaskStatus.PENDING_APPROVAL);
        task.setChannel(CommunicationChannel.EMAIL);
        task.setScheduledAt(Instant.now());
        task.setMessageBody("Old Body");

        FollowUpTaskUpdateRequest request = new FollowUpTaskUpdateRequest(
                Instant.now().plusSeconds(60), "new@example.com", "New Subject", "New Body"
        );

        when(followUpTaskRepository.findByIdAndStudioId(taskId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(task));
        when(followUpTaskRepository.save(any(FollowUpTask.class))).thenReturn(task);

        FollowUpTaskResponse response = followUpTaskService.updateTask(taskId, request);
        assertNotNull(response);
        assertEquals("New Body", response.getMessageBody());
    }

    @Test
    void updateTask_AlreadySent_ThrowsException() {
        UUID taskId = UUID.randomUUID();
        FollowUpTask task = new FollowUpTask();
        task.setId(taskId);
        task.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        task.setStatus(FollowUpTaskStatus.SENT);

        FollowUpTaskUpdateRequest request = new FollowUpTaskUpdateRequest(
                Instant.now(), "new@example.com", "New Subject", "New Body"
        );

        when(followUpTaskRepository.findByIdAndStudioId(taskId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(task));

        assertThrows(IllegalArgumentException.class, () -> followUpTaskService.updateTask(taskId, request));
    }

    @Test
    void approveTask_Success() {
        UUID taskId = UUID.randomUUID();
        FollowUpTask task = new FollowUpTask();
        task.setId(taskId);
        task.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        task.setStatus(FollowUpTaskStatus.PENDING_APPROVAL);
        task.setChannel(CommunicationChannel.EMAIL);
        task.setRecipient("recipient@example.com");
        task.setSubject("Approve Test");
        task.setMessageBody("Approved body");

        when(followUpTaskRepository.findByIdAndStudioId(taskId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(task));
        when(followUpTaskRepository.save(any(FollowUpTask.class))).thenReturn(task);

        FollowUpTaskResponse response = followUpTaskService.approveTask(taskId);
        assertEquals(FollowUpTaskStatus.SENT, response.getStatus());
        assertNotNull(response.getSentAt());

        verify(communicationLogService, times(1)).createLog(argThat(logReq -> 
            logReq.getProvider() == com.studioops.followup.log.CommunicationProvider.MANUAL_DEMO
        ));
    }

    @Test
    void approveTask_Whatsapp_Success() {
        UUID taskId = UUID.randomUUID();
        FollowUpTask task = new FollowUpTask();
        task.setId(taskId);
        task.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        task.setStatus(FollowUpTaskStatus.PENDING_APPROVAL);
        task.setChannel(CommunicationChannel.WHATSAPP);
        task.setRecipient("1234567890");
        task.setSubject("Approve WhatsApp Test");
        task.setMessageBody("Approved body");

        when(followUpTaskRepository.findByIdAndStudioId(taskId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(task));
        when(followUpTaskRepository.save(any(FollowUpTask.class))).thenReturn(task);

        FollowUpTaskResponse response = followUpTaskService.approveTask(taskId);
        assertEquals(FollowUpTaskStatus.SENT, response.getStatus());
        assertNotNull(response.getSentAt());

        verify(communicationLogService, times(1)).createLog(argThat(logReq -> 
            logReq.getProvider() == com.studioops.followup.log.CommunicationProvider.MANUAL_WHATSAPP
        ));
    }

    @Test
    void skipTask_Success() {
        UUID taskId = UUID.randomUUID();
        FollowUpTask task = new FollowUpTask();
        task.setId(taskId);
        task.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        task.setStatus(FollowUpTaskStatus.PENDING_APPROVAL);
        task.setChannel(CommunicationChannel.EMAIL);
        task.setRecipient("recipient@example.com");
        task.setSubject("Skip Test");
        task.setMessageBody("Skipped body");

        when(followUpTaskRepository.findByIdAndStudioId(taskId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(task));
        when(followUpTaskRepository.save(any(FollowUpTask.class))).thenReturn(task);

        FollowUpTaskResponse response = followUpTaskService.skipTask(taskId);
        assertEquals(FollowUpTaskStatus.SKIPPED, response.getStatus());
        assertNotNull(response.getSkippedAt());

        verify(communicationLogService, times(1)).createLog(any(CommunicationLogCreateRequest.class));
    }

    @Test
    void cancelTask_Success() {
        UUID taskId = UUID.randomUUID();
        FollowUpTask task = new FollowUpTask();
        task.setId(taskId);
        task.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        task.setStatus(FollowUpTaskStatus.PENDING_APPROVAL);

        when(followUpTaskRepository.findByIdAndStudioId(taskId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(task));
        when(followUpTaskRepository.save(any(FollowUpTask.class))).thenReturn(task);

        FollowUpTaskResponse response = followUpTaskService.cancelTask(taskId);
        assertEquals(FollowUpTaskStatus.CANCELLED, response.getStatus());
        verify(communicationLogService, never()).createLog(any());
    }
}
