package com.studioops.followup.log;

import com.studioops.common.tenant.TenantContext;
import com.studioops.common.tenant.TenantConstants;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.studio.StudioRepository;
import com.studioops.project.ProjectRepository;
import com.studioops.project.Project;
import com.studioops.client.ClientRepository;
import com.studioops.client.Client;
import com.studioops.followup.task.FollowUpTaskRepository;
import com.studioops.followup.task.FollowUpTask;
import com.studioops.followup.template.CommunicationChannel;
import com.studioops.followup.log.dto.CommunicationLogCreateRequest;
import com.studioops.followup.log.dto.CommunicationLogResponse;
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

class CommunicationLogServiceTest {
    @Mock
    private TenantContext tenantContext;


    @Mock
    private CommunicationLogRepository communicationLogRepository;
    @Mock
    private StudioRepository studioRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private ClientRepository clientRepository;
    @Mock
    private FollowUpTaskRepository followUpTaskRepository;

    @InjectMocks
    private CommunicationLogService communicationLogService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(tenantContext.getCurrentStudioId()).thenReturn(TenantConstants.DEFAULT_STUDIO_ID);
        when(studioRepository.existsById(any(UUID.class))).thenReturn(true);
    }

    @Test
    void createLog_Success() {
        UUID projectId = UUID.randomUUID();
        UUID clientId = UUID.randomUUID();
        UUID taskId = UUID.randomUUID();

        CommunicationLogCreateRequest request = new CommunicationLogCreateRequest(
                TenantConstants.DEFAULT_STUDIO_ID, projectId, clientId, taskId,
                CommunicationChannel.EMAIL, CommunicationDirection.OUTBOUND,
                "client@example.com", "Test Subject", "Test Body",
                CommunicationProvider.MANUAL_DEMO, "msg-123", CommunicationLogStatus.SENT,
                Instant.now(), Instant.now(), Instant.now(), null
        );

        Project project = new Project();
        project.setId(projectId);
        project.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        Client client = new Client();
        client.setId(clientId);
        client.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        FollowUpTask task = new FollowUpTask();
        task.setId(taskId);
        task.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(project));
        when(clientRepository.findByIdAndStudioId(clientId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(client));
        when(followUpTaskRepository.findByIdAndStudioId(taskId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(task));

        CommunicationLog log = new CommunicationLog();
        log.setId(UUID.randomUUID());
        log.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        log.setProjectId(projectId);
        log.setClientId(clientId);
        log.setFollowUpTaskId(taskId);
        log.setChannel(CommunicationChannel.EMAIL);
        log.setDirection(CommunicationDirection.OUTBOUND);
        log.setRecipient(request.getRecipient());
        log.setSubject(request.getSubject());
        log.setMessageBody(request.getMessageBody());
        log.setProvider(CommunicationProvider.MANUAL_DEMO);
        log.setProviderMessageId(request.getProviderMessageId());
        log.setStatus(CommunicationLogStatus.SENT);
        log.setSentAt(request.getSentAt());

        when(communicationLogRepository.save(any(CommunicationLog.class))).thenReturn(log);

        CommunicationLogResponse response = communicationLogService.createLog(request);

        assertNotNull(response);
        assertEquals(log.getId(), response.getId());
        assertEquals(CommunicationLogStatus.SENT, response.getStatus());
        verify(communicationLogRepository, times(1)).save(any(CommunicationLog.class));
    }

    @Test
    void createLog_RelationStudioMismatch_ThrowsException() {
        UUID projectId = UUID.randomUUID();
        CommunicationLogCreateRequest request = new CommunicationLogCreateRequest(
                TenantConstants.DEFAULT_STUDIO_ID, projectId, null, null,
                CommunicationChannel.EMAIL, CommunicationDirection.OUTBOUND,
                "client@example.com", "Test Subject", "Test Body",
                CommunicationProvider.MANUAL_DEMO, "msg-123", CommunicationLogStatus.SENT,
                Instant.now(), Instant.now(), Instant.now(), null
        );

        // Project belongs to different studio (or is not found in studio)
        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> communicationLogService.createLog(request));
        verify(communicationLogRepository, never()).save(any());
    }

    @Test
    void listLogs_Success() {
        CommunicationLog log = new CommunicationLog();
        log.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(communicationLogRepository.findAllByStudioId(TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(List.of(log));

        List<CommunicationLogResponse> responses = communicationLogService.listLogs();
        assertEquals(1, responses.size());
    }

    @Test
    void getLogById_NotFound_ThrowsException() {
        UUID logId = UUID.randomUUID();
        when(communicationLogRepository.findByIdAndStudioId(logId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> communicationLogService.getLogById(logId));
    }

    @Test
    void listLogsByProjectId_Success() {
        UUID projectId = UUID.randomUUID();
        Project project = new Project();
        project.setId(projectId);
        project.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(project));
        when(communicationLogRepository.findByProjectIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(List.of(new CommunicationLog()));

        List<CommunicationLogResponse> list = communicationLogService.listLogsByProjectId(projectId);
        assertEquals(1, list.size());
    }
}
