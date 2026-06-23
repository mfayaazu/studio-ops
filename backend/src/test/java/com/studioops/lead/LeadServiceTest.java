package com.studioops.lead;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.common.tenant.TenantContext;
import com.studioops.studio.StudioRepository;
import com.studioops.client.ClientRepository;
import com.studioops.client.Client;
import com.studioops.project.ProjectRepository;
import com.studioops.project.Project;
import com.studioops.project.BookingStatus;
import com.studioops.project.PaymentStatus;
import com.studioops.project.ProjectStatus;
import com.studioops.event.Event;
import com.studioops.event.EventRepository;
import com.studioops.event.EventType;
import com.studioops.event.EventStatus;
import com.studioops.lead.dto.LeadCreateRequest;
import com.studioops.lead.dto.LeadResponse;
import com.studioops.lead.dto.LeadUpdateRequest;
import com.studioops.lead.dto.LeadMoveStageRequest;
import com.studioops.lead.dto.LeadConvertToProjectRequest;
import com.studioops.lead.dto.LeadConvertToProjectResponse;
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
    @Mock
    private EventRepository eventRepository;
    @Mock
    private TenantContext tenantContext;
    @Mock
    private com.studioops.project.ProjectService projectService;

    @InjectMocks
    private LeadService leadService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(studioRepository.existsById(any(UUID.class))).thenReturn(true);
        when(tenantContext.getCurrentStudioId()).thenReturn(TenantConstants.DEFAULT_STUDIO_ID);
        when(projectService.getNextProjectCode(any(UUID.class), anyInt())).thenReturn("FAY-2026-0001");
        when(projectRepository.saveAndFlush(any(Project.class))).thenAnswer(invocation -> {
            Project p = invocation.getArgument(0);
            if (p.getId() == null) {
                p.setId(UUID.randomUUID());
            }
            return p;
        });
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
        when(tenantContext.getCurrentStudioId()).thenReturn(nonExistentStudio);
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

    @Test
    void convertLeadToProject_Success_NewClient_NewProject() {
        UUID leadId = UUID.randomUUID();
        Lead lead = new Lead();
        lead.setId(leadId);
        lead.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        lead.setClientName("John Doe");
        lead.setPhone("+1234567890");
        lead.setEmail("john@example.com");
        lead.setEventType("Wedding");
        lead.setEventDate(LocalDate.of(2026, 10, 15));
        lead.setNotes("First lead note");

        LeadConvertToProjectRequest request = new LeadConvertToProjectRequest(
                "CODE123", "Custom Project Title", "Wedding Photography",
                BookingStatus.CONTRACT_SIGNED, PaymentStatus.PARTIALLY_PAID, ProjectStatus.CONFIRMED, "Project note"
        );

        when(leadRepository.findByIdAndStudioId(leadId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(lead));
        when(projectRepository.findByProjectCode("CODE123")).thenReturn(Optional.empty());

        // Mock saved Client
        UUID mockClientId = UUID.randomUUID();
        when(clientRepository.save(any(Client.class))).thenAnswer(invocation -> {
            Client c = invocation.getArgument(0);
            c.setId(mockClientId);
            return c;
        });

        // Mock saved Project
        UUID mockProjectId = UUID.randomUUID();
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project p = invocation.getArgument(0);
            p.setId(mockProjectId);
            return p;
        });

        // Mock saved Lead
        when(leadRepository.save(any(Lead.class))).thenReturn(lead);

        LeadConvertToProjectResponse response = leadService.convertLeadToProject(leadId, request);

        assertNotNull(response);
        assertEquals(leadId, response.getLeadId());
        assertEquals(mockClientId, response.getClientId());
        assertEquals(mockProjectId, response.getProjectId());
        assertEquals(LeadPipelineStage.CONFIRMED, response.getPipelineStage());
        assertNotNull(response.getConvertedAt());
        assertEquals("Project created and added to Event Calendar.", response.getMessage());

        // Verify correct properties mapped on created Client
        verify(clientRepository, times(1)).save(argThat(client -> 
            client.getFullName().equals("John Doe") &&
            client.getPhone().equals("+1234567890") &&
            client.getEmail().equals("john@example.com") &&
            client.getStudioId().equals(TenantConstants.DEFAULT_STUDIO_ID)
        ));

        // Verify correct properties mapped on created Project
        verify(projectRepository, times(1)).save(argThat(project -> 
            project.getClientId().equals(mockClientId) &&
            project.getProjectCode().equals("CODE123") &&
            project.getTitle().equals("Custom Project Title") &&
            project.getProjectType().equals("Wedding Photography") &&
            project.getBookingStatus().equals(BookingStatus.CONTRACT_SIGNED) &&
            project.getPaymentStatus().equals(PaymentStatus.PARTIALLY_PAID) &&
            project.getStatus().equals(ProjectStatus.CONFIRMED) &&
            project.getStartDate().equals(LocalDate.of(2026, 10, 15)) &&
            project.getEndDate().equals(LocalDate.of(2026, 10, 15)) &&
            project.getNotes().equals("Project note")
        ));

        // Verify Event is created
        verify(eventRepository, times(1)).save(argThat(event -> 
            event.getProjectId().equals(mockProjectId) &&
            event.getStudioId().equals(TenantConstants.DEFAULT_STUDIO_ID) &&
            event.getTitle().equals("Custom Project Title") &&
            event.getType().equals(EventType.WEDDING) &&
            event.getEventDate().equals(LocalDate.of(2026, 10, 15)) &&
            event.getStartTime().equals(java.time.LocalTime.of(9, 0)) &&
            event.getEndTime().equals(java.time.LocalTime.of(18, 0)) &&
            event.getVenueName().equals("TBD") &&
            event.getCity().equals("TBD") &&
            event.getAddress().equals("TBD") &&
            event.getStatus().equals(EventStatus.SCHEDULED)
        ));
    }

    @Test
    void convertLeadToProject_Success_ExistingClient_DefaultValues() {
        UUID leadId = UUID.randomUUID();
        UUID existingClientId = UUID.randomUUID();

        Lead lead = new Lead();
        lead.setId(leadId);
        lead.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        lead.setClientId(existingClientId);
        lead.setClientName("Jane Doe");
        lead.setPhone(""); // blank
        lead.setEventType("Portrait");
        lead.setEventDate(LocalDate.of(2026, 11, 20));

        LeadConvertToProjectRequest request = new LeadConvertToProjectRequest(); // empty request

        when(leadRepository.findByIdAndStudioId(leadId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(lead));
        when(clientRepository.findByIdAndStudioId(existingClientId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.of(new Client()));
        when(projectRepository.findByProjectCode(any(String.class))).thenReturn(Optional.empty());

        UUID mockProjectId = UUID.randomUUID();
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project p = invocation.getArgument(0);
            p.setId(mockProjectId);
            return p;
        });
        when(leadRepository.save(any(Lead.class))).thenReturn(lead);

        LeadConvertToProjectResponse response = leadService.convertLeadToProject(leadId, request);

        assertNotNull(response);
        assertEquals(existingClientId, response.getClientId());
        assertEquals(mockProjectId, response.getProjectId());
        assertEquals("Project created and added to Event Calendar.", response.getMessage());

        // Verify default mappings when request parameters are absent
        verify(projectRepository, times(1)).save(argThat(project -> 
            project.getClientId().equals(existingClientId) &&
            project.getProjectCode().startsWith("FAY-") &&
            project.getTitle().equals("Portrait - Jane Doe") &&
            project.getProjectType().equals("Portrait") &&
            project.getBookingStatus().equals(BookingStatus.INQUIRY) &&
            project.getPaymentStatus().equals(PaymentStatus.UNPAID) &&
            project.getStatus().equals(ProjectStatus.LEAD) &&
            project.getStartDate().equals(LocalDate.of(2026, 11, 20))
        ));

        // Verify Event is created
        verify(eventRepository, times(1)).save(argThat(event -> 
            event.getProjectId().equals(mockProjectId) &&
            event.getStudioId().equals(TenantConstants.DEFAULT_STUDIO_ID) &&
            event.getTitle().equals("Portrait - Jane Doe") &&
            event.getType().equals(EventType.OTHER) &&
            event.getEventDate().equals(LocalDate.of(2026, 11, 20)) &&
            event.getStartTime().equals(java.time.LocalTime.of(9, 0)) &&
            event.getEndTime().equals(java.time.LocalTime.of(18, 0)) &&
            event.getVenueName().equals("TBD") &&
            event.getCity().equals("TBD") &&
            event.getAddress().equals("TBD") &&
            event.getStatus().equals(EventStatus.SCHEDULED)
        ));

        // Client Repository save should not be called since client existed
        verify(clientRepository, never()).save(any(Client.class));
    }

    @Test
    void convertLeadToProject_PhoneFallback_Unknown() {
        UUID leadId = UUID.randomUUID();
        Lead lead = new Lead();
        lead.setId(leadId);
        lead.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        lead.setClientName("John Doe");
        lead.setPhone(null); // null phone
        lead.setEventType("Wedding");
        lead.setEventDate(LocalDate.of(2026, 10, 15));

        LeadConvertToProjectRequest request = new LeadConvertToProjectRequest();

        when(leadRepository.findByIdAndStudioId(leadId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(lead));
        when(projectRepository.findByProjectCode(any(String.class))).thenReturn(Optional.empty());

        when(clientRepository.save(any(Client.class))).thenAnswer(invocation -> {
            Client c = invocation.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project p = invocation.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });
        when(leadRepository.save(any(Lead.class))).thenReturn(lead);

        leadService.convertLeadToProject(leadId, request);

        // Verify that because Client.phone is required, fallback "UNKNOWN" is passed
        verify(clientRepository, times(1)).save(argThat(client -> 
            client.getPhone().equals("UNKNOWN")
        ));

        // Verify Event is created
        verify(eventRepository, times(1)).save(any(Event.class));
    }

    @Test
    void convertLeadToProject_AlreadyConverted_ReturnsEarly() {
        UUID leadId = UUID.randomUUID();
        UUID clientId = UUID.randomUUID();
        UUID projectId = UUID.randomUUID();
        Instant convertedAt = Instant.now();

        Lead lead = new Lead();
        lead.setId(leadId);
        lead.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        lead.setClientId(clientId);
        lead.setProjectId(projectId);
        lead.setPipelineStage(LeadPipelineStage.CONFIRMED);
        lead.setConvertedAt(convertedAt);

        LeadConvertToProjectRequest request = new LeadConvertToProjectRequest();

        when(leadRepository.findByIdAndStudioId(leadId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(lead));

        LeadConvertToProjectResponse response = leadService.convertLeadToProject(leadId, request);

        assertNotNull(response);
        assertEquals(leadId, response.getLeadId());
        assertEquals(clientId, response.getClientId());
        assertEquals(projectId, response.getProjectId());
        assertEquals(LeadPipelineStage.CONFIRMED, response.getPipelineStage());
        assertEquals(convertedAt, response.getConvertedAt());
        assertEquals("Lead is already converted", response.getMessage());

        verify(projectRepository, never()).save(any(Project.class));
        verify(clientRepository, never()).save(any(Client.class));
    }

    @Test
    void convertLeadToProject_DuplicateProjectCode_ThrowsException() {
        UUID leadId = UUID.randomUUID();
        Lead lead = new Lead();
        lead.setId(leadId);
        lead.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        lead.setClientName("John Doe");

        LeadConvertToProjectRequest request = new LeadConvertToProjectRequest();
        request.setProjectCode("EXISTS");

        when(leadRepository.findByIdAndStudioId(leadId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(lead));
        when(clientRepository.save(any(Client.class))).thenAnswer(invocation -> {
            Client c = invocation.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });
        when(projectRepository.findByStudioIdAndProjectCode(TenantConstants.DEFAULT_STUDIO_ID, "EXISTS")).thenReturn(Optional.of(new Project()));

        assertThrows(IllegalArgumentException.class, () -> leadService.convertLeadToProject(leadId, request));
    }

    @Test
    void convertLeadToProject_LeadNotFound_ThrowsException() {
        UUID leadId = UUID.randomUUID();
        when(leadRepository.findByIdAndStudioId(leadId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> leadService.convertLeadToProject(leadId, new LeadConvertToProjectRequest()));
    }

    @Test
    void leadTenantIsolationTest() {
        UUID studioA = UUID.randomUUID();
        UUID studioB = UUID.randomUUID();
        UUID leadId = UUID.randomUUID();

        // 1. Authenticate as Studio A
        when(tenantContext.getCurrentStudioId()).thenReturn(studioA);

        Lead leadA = new Lead();
        leadA.setId(leadId);
        leadA.setStudioId(studioA);
        leadA.setClientName("Lead of Studio A");

        // Mock database
        when(leadRepository.findByIdAndStudioId(leadId, studioA)).thenReturn(Optional.of(leadA));
        when(leadRepository.findByIdAndStudioId(leadId, studioB)).thenReturn(Optional.empty());

        // Fetching under Studio A should work
        LeadResponse response = leadService.getLeadById(leadId);
        assertEquals("Lead of Studio A", response.getClientName());
        assertEquals(studioA, response.getStudioId());

        // 2. Switch context to Studio B
        when(tenantContext.getCurrentStudioId()).thenReturn(studioB);

        // Fetching under Studio B should throw ResourceNotFoundException
        assertThrows(ResourceNotFoundException.class, () -> leadService.getLeadById(leadId));

        // Creating lead under Studio B but specifying Studio A ID in payload should fail
        LeadCreateRequest request = new LeadCreateRequest(
                studioA, null, null, "Client Name", "+919876543210", "client@example.com",
                LeadPreferredChannel.EMAIL, "Wedding", LocalDate.of(2026, 9, 12),
                "Hyderabad", BigDecimal.valueOf(10000), LeadSource.WEBSITE, null,
                null, null, null, "Notes"
        );
        assertThrows(IllegalArgumentException.class, () -> leadService.createLead(request));
    }

    @Test
    void convertLeadToProject_NoEventDate_CreatesProjectOnly_WarningMessage() {
        UUID leadId = UUID.randomUUID();
        Lead lead = new Lead();
        lead.setId(leadId);
        lead.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        lead.setClientName("John Doe");
        lead.setPhone("+1234567890");
        lead.setEventDate(null); // No event date

        LeadConvertToProjectRequest request = new LeadConvertToProjectRequest();

        when(leadRepository.findByIdAndStudioId(leadId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(lead));
        when(projectRepository.findByProjectCode(any(String.class))).thenReturn(Optional.empty());

        // Mock saved Client
        UUID mockClientId = UUID.randomUUID();
        when(clientRepository.save(any(Client.class))).thenAnswer(invocation -> {
            Client c = invocation.getArgument(0);
            c.setId(mockClientId);
            return c;
        });

        // Mock saved Project
        UUID mockProjectId = UUID.randomUUID();
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project p = invocation.getArgument(0);
            p.setId(mockProjectId);
            return p;
        });

        when(leadRepository.save(any(Lead.class))).thenReturn(lead);

        LeadConvertToProjectResponse response = leadService.convertLeadToProject(leadId, request);

        assertNotNull(response);
        assertEquals("Project created. Add event date to schedule resources.", response.getMessage());
        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void convertLeadToProject_DuplicateEvent_PreventsCreation() {
        UUID leadId = UUID.randomUUID();
        Lead lead = new Lead();
        lead.setId(leadId);
        lead.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        lead.setClientName("John Doe");
        lead.setPhone("+1234567890");
        lead.setEventDate(LocalDate.of(2026, 10, 15));

        LeadConvertToProjectRequest request = new LeadConvertToProjectRequest();

        when(leadRepository.findByIdAndStudioId(leadId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(lead));
        when(projectRepository.findByProjectCode(any(String.class))).thenReturn(Optional.empty());

        // Mock saved Client
        UUID mockClientId = UUID.randomUUID();
        when(clientRepository.save(any(Client.class))).thenAnswer(invocation -> {
            Client c = invocation.getArgument(0);
            c.setId(mockClientId);
            return c;
        });

        // Mock saved Project
        UUID mockProjectId = UUID.randomUUID();
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project p = invocation.getArgument(0);
            p.setId(mockProjectId);
            return p;
        });

        when(leadRepository.save(any(Lead.class))).thenReturn(lead);
        // Mock existing event
        when(eventRepository.findByProjectIdAndStudioId(mockProjectId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(List.of(new Event()));

        LeadConvertToProjectResponse response = leadService.convertLeadToProject(leadId, request);

        assertNotNull(response);
        assertEquals("Project created and added to Event Calendar.", response.getMessage());
        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void createLead_BetaWhatsappOnlyActive_CoercesToWhatsapp() {
        org.springframework.test.util.ReflectionTestUtils.setField(leadService, "betaWhatsappOnly", true);

        LeadCreateRequest request = new LeadCreateRequest(
                null, null, null, "Priya Reddy", "+919876543210", "priya@example.in",
                LeadPreferredChannel.EMAIL, "Wedding Photography", LocalDate.of(2026, 9, 12),
                "Hyderabad", BigDecimal.valueOf(350000), LeadSource.WEBSITE, null,
                null, null, null, "Requested traditional album"
        );

        Lead lead = new Lead();
        lead.setId(UUID.randomUUID());
        lead.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        lead.setClientName(request.getClientName());
        lead.setPreferredChannel(LeadPreferredChannel.WHATSAPP); // Coerced!
        lead.setLeadSource(request.getLeadSource());
        lead.setPipelineStage(LeadPipelineStage.NEW_LEAD);
        lead.setCreatedAt(Instant.now());
        lead.setUpdatedAt(Instant.now());

        when(leadRepository.save(any(Lead.class))).thenReturn(lead);

        LeadResponse response = leadService.createLead(request);

        assertNotNull(response);
        assertEquals(LeadPreferredChannel.WHATSAPP, response.getPreferredChannel());
        verify(leadRepository, times(1)).save(argThat(savedLead -> 
            savedLead.getPreferredChannel() == LeadPreferredChannel.WHATSAPP
        ));
    }

    @Test
    void updateLead_BetaWhatsappOnlyActive_CoercesToWhatsapp() {
        org.springframework.test.util.ReflectionTestUtils.setField(leadService, "betaWhatsappOnly", true);

        UUID leadId = UUID.randomUUID();
        Lead lead = new Lead();
        lead.setId(leadId);
        lead.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        lead.setClientName("Old Name");
        lead.setPreferredChannel(LeadPreferredChannel.EMAIL);
        lead.setLeadSource(LeadSource.INSTAGRAM);
        lead.setPipelineStage(LeadPipelineStage.NEW_LEAD);

        LeadUpdateRequest request = new LeadUpdateRequest(
                "New Name", "+919876543210", "new@example.com", LeadPreferredChannel.EMAIL,
                "Pre-wedding", LocalDate.of(2026, 8, 20), "Goa", BigDecimal.valueOf(120000),
                LeadSource.REFERRAL, null, null, null, "Updated notes"
        );

        when(leadRepository.findByIdAndStudioId(leadId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(lead));
        when(leadRepository.save(any(Lead.class))).thenReturn(lead);

        leadService.updateLead(leadId, request);

        verify(leadRepository, times(1)).save(argThat(savedLead -> 
            savedLead.getPreferredChannel() == LeadPreferredChannel.WHATSAPP
        ));
    }

    @Test
    void createLead_BetaWhatsappOnlyActive_MissingPhone_ThrowsException() {
        org.springframework.test.util.ReflectionTestUtils.setField(leadService, "betaWhatsappOnly", true);

        LeadCreateRequest request = new LeadCreateRequest(
                null, null, null, "Priya Reddy", null, "priya@example.in",
                LeadPreferredChannel.EMAIL, "Wedding Photography", LocalDate.of(2026, 9, 12),
                "Hyderabad", BigDecimal.valueOf(350000), LeadSource.WEBSITE, null,
                null, null, null, "Requested traditional album"
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> leadService.createLead(request));
        assertEquals("WhatsApp beta requires a valid phone number with country code.", ex.getMessage());
    }

    @Test
    void createLead_BetaWhatsappOnlyActive_InvalidPhone_ThrowsException() {
        org.springframework.test.util.ReflectionTestUtils.setField(leadService, "betaWhatsappOnly", true);

        LeadCreateRequest request = new LeadCreateRequest(
                null, null, null, "Priya Reddy", "1234567", "priya@example.in",
                LeadPreferredChannel.EMAIL, "Wedding Photography", LocalDate.of(2026, 9, 12),
                "Hyderabad", BigDecimal.valueOf(350000), LeadSource.WEBSITE, null,
                null, null, null, "Requested traditional album"
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> leadService.createLead(request));
        assertEquals("WhatsApp beta requires a valid phone number with country code.", ex.getMessage());
    }
}

