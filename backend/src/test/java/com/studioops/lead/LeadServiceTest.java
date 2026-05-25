package com.studioops.lead;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.studio.StudioRepository;
import com.studioops.client.ClientRepository;
import com.studioops.client.Client;
import com.studioops.project.ProjectRepository;
import com.studioops.project.Project;
import com.studioops.lead.dto.LeadCreateRequest;
import com.studioops.lead.dto.LeadResponse;
import com.studioops.lead.dto.LeadUpdateRequest;
import com.studioops.lead.dto.LeadMoveStageRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class LeadServiceTest {

    @Mock
    private LeadRepository leadRepository;
    @Mock
    private StudioRepository studioRepository;
    @Mock
    private ClientRepository clientRepository;
    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private LeadService leadService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(studioRepository.existsById(any(UUID.class))).thenReturn(true);
    }

    @Test
    void createLead_Success_DefaultsToDefaultStudioIdAndNewLead() {
        LeadCreateRequest request = new LeadCreateRequest(
                null, null, null, "Priya Reddy", "+919876543210", "priya@example.in",
                LeadPreferredChannel.WHATSAPP, "Wedding Photography", LocalDate.of(2026, 9, 12),
                "Hyderabad", BigDecimal.valueOf(350000), LeadSource.WEBSITE, null,
                null, null, null, "Requested traditional album"
        );

        Lead lead = new Lead();
        lead.setId(UUID.randomUUID());
        lead.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        lead.setClientName(request.getClientName());
        lead.setPreferredChannel(request.getPreferredChannel());
        lead.setLeadSource(request.getLeadSource());
        lead.setPipelineStage(LeadPipelineStage.NEW_LEAD);
        lead.setCreatedAt(Instant.now());
        lead.setUpdatedAt(Instant.now());

        when(leadRepository.save(any(Lead.class))).thenReturn(lead);

        LeadResponse response = leadService.createLead(request);

        assertNotNull(response);
        assertEquals(lead.getId(), response.getId());
        assertEquals(TenantConstants.DEFAULT_STUDIO_ID, response.getStudioId());
        assertEquals(LeadPipelineStage.NEW_LEAD, response.getPipelineStage());
        verify(leadRepository, times(1)).save(any(Lead.class));
    }

    @Test
    void createLead_StudioNotFound_ThrowsException() {
        UUID nonExistentStudio = UUID.randomUUID();
        LeadCreateRequest request = new LeadCreateRequest(
                nonExistentStudio, null, null, "Priya", null, null,
                LeadPreferredChannel.EMAIL, null, null, null, null,
                LeadSource.MANUAL, null, null, null, null, null
        );

        when(studioRepository.existsById(nonExistentStudio)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> leadService.createLead(request));
        verify(leadRepository, never()).save(any(Lead.class));
    }

    @Test
    void createLead_ClientStudioMismatch_ThrowsException() {
        UUID clientId = UUID.randomUUID();
        LeadCreateRequest request = new LeadCreateRequest(
                TenantConstants.DEFAULT_STUDIO_ID, clientId, null, "Priya", null, null,
                LeadPreferredChannel.EMAIL, null, null, null, null,
                LeadSource.MANUAL, null, null, null, null, null
        );

        when(clientRepository.findByIdAndStudioId(clientId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> leadService.createLead(request));
    }

    @Test
    void createLead_ProjectStudioMismatch_ThrowsException() {
        UUID projectId = UUID.randomUUID();
        LeadCreateRequest request = new LeadCreateRequest(
                TenantConstants.DEFAULT_STUDIO_ID, null, projectId, "Priya", null, null,
                LeadPreferredChannel.EMAIL, null, null, null, null,
                LeadSource.MANUAL, null, null, null, null, null
        );

        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> leadService.createLead(request));
    }

    @Test
    void listLeads_NoFilters_ReturnsAll() {
        Lead l1 = new Lead();
        l1.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        l1.setClientName("Priya");
        l1.setLeadSource(LeadSource.WEBSITE);
        l1.setPreferredChannel(LeadPreferredChannel.EMAIL);
        l1.setPipelineStage(LeadPipelineStage.NEW_LEAD);

        when(leadRepository.findAllByStudioId(TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(List.of(l1));

        List<LeadResponse> list = leadService.listLeads(null, null, null);
        assertEquals(1, list.size());
        verify(leadRepository, times(1)).findAllByStudioId(TenantConstants.DEFAULT_STUDIO_ID);
    }

    @Test
    void updateLead_Success() {
        UUID leadId = UUID.randomUUID();
        Lead lead = new Lead();
        lead.setId(leadId);
        lead.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        lead.setClientName("Old Name");
        lead.setPreferredChannel(LeadPreferredChannel.EMAIL);
        lead.setLeadSource(LeadSource.INSTAGRAM);
        lead.setPipelineStage(LeadPipelineStage.NEW_LEAD);

        LeadUpdateRequest request = new LeadUpdateRequest(
                "New Name", "98765", "new@example.com", LeadPreferredChannel.WHATSAPP,
                "Pre-wedding", LocalDate.of(2026, 8, 20), "Goa", BigDecimal.valueOf(120000),
                LeadSource.REFERRAL, null, null, null, "Updated notes"
        );

        when(leadRepository.findByIdAndStudioId(leadId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(lead));
        when(leadRepository.save(any(Lead.class))).thenReturn(lead);

        LeadResponse response = leadService.updateLead(leadId, request);

        assertNotNull(response);
        assertEquals("New Name", response.getClientName());
        assertEquals(LeadPreferredChannel.WHATSAPP, response.getPreferredChannel());
        assertEquals("Goa", response.getCity());
    }

    @Test
    void moveStage_ToLost_StoresLostReason() {
        UUID leadId = UUID.randomUUID();
        Lead lead = new Lead();
        lead.setId(leadId);
        lead.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        lead.setPipelineStage(LeadPipelineStage.NEW_LEAD);

        LeadMoveStageRequest request = new LeadMoveStageRequest(
                LeadPipelineStage.LOST, LeadLostReason.PRICE_TOO_HIGH, "Notes about price"
        );

        when(leadRepository.findByIdAndStudioId(leadId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(lead));
        when(leadRepository.save(any(Lead.class))).thenReturn(lead);

        LeadResponse response = leadService.moveStage(leadId, request);

        assertNotNull(response);
        assertEquals(LeadPipelineStage.LOST, response.getPipelineStage());
        assertEquals(LeadLostReason.PRICE_TOO_HIGH, response.getLostReason());
    }

    @Test
    void moveStage_AwayFromLost_ClearsLostReason() {
        UUID leadId = UUID.randomUUID();
        Lead lead = new Lead();
        lead.setId(leadId);
        lead.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        lead.setPipelineStage(LeadPipelineStage.LOST);
        lead.setLostReason(LeadLostReason.PRICE_TOO_HIGH);

        LeadMoveStageRequest request = new LeadMoveStageRequest(
                LeadPipelineStage.CONFIRMED, null, "Deposit paid"
        );

        when(leadRepository.findByIdAndStudioId(leadId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(lead));
        when(leadRepository.save(any(Lead.class))).thenReturn(lead);

        LeadResponse response = leadService.moveStage(leadId, request);

        assertNotNull(response);
        assertEquals(LeadPipelineStage.CONFIRMED, response.getPipelineStage());
        assertNull(response.getLostReason());
    }
}
