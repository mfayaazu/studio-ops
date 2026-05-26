package com.studioops.quotation;

import com.studioops.common.tenant.TenantContext;
import com.studioops.common.tenant.TenantConstants;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.studio.StudioRepository;
import com.studioops.client.ClientRepository;
import com.studioops.client.Client;
import com.studioops.project.ProjectRepository;
import com.studioops.project.Project;
import com.studioops.lead.LeadRepository;
import com.studioops.lead.Lead;
import com.studioops.quotation.dto.QuotationCreateRequest;
import com.studioops.quotation.dto.QuotationResponse;
import com.studioops.quotation.dto.QuotationUpdateRequest;
import com.studioops.quotation.dto.QuotationStatusUpdateRequest;
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

class QuotationServiceTest {
    @Mock
    private TenantContext tenantContext;


    @Mock
    private QuotationRepository quotationRepository;
    @Mock
    private StudioRepository studioRepository;
    @Mock
    private ClientRepository clientRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private LeadRepository leadRepository;

    @InjectMocks
    private QuotationService quotationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(tenantContext.getCurrentStudioId()).thenReturn(TenantConstants.DEFAULT_STUDIO_ID);
        when(studioRepository.existsById(any(UUID.class))).thenReturn(true);
    }

    @Test
    void createQuotation_Success_DefaultsAndGeneratesNumber() {
        QuotationCreateRequest request = new QuotationCreateRequest();
        request.setTitle("Pre-wedding shoot");
        request.setSubtotal(BigDecimal.valueOf(10000));
        request.setDiscountAmount(BigDecimal.valueOf(1000));
        request.setTaxAmount(BigDecimal.valueOf(1800));

        when(quotationRepository.existsByStudioIdAndQuotationNumber(any(), any())).thenReturn(false);

        Quotation quotation = new Quotation();
        quotation.setId(UUID.randomUUID());
        quotation.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        quotation.setTitle(request.getTitle());
        quotation.setSubtotal(request.getSubtotal());
        quotation.setDiscountAmount(request.getDiscountAmount());
        quotation.setTaxAmount(request.getTaxAmount());
        quotation.setTotalAmount(BigDecimal.valueOf(10800)); // 10000 - 1000 + 1800
        quotation.setQuotationNumber("QTN-20260526-ABCD");
        quotation.setCurrency("INR");
        quotation.setStatus(QuotationStatus.DRAFT);

        when(quotationRepository.save(any(Quotation.class))).thenReturn(quotation);

        QuotationResponse response = quotationService.createQuotation(request);

        assertNotNull(response);
        assertEquals(quotation.getId(), response.getId());
        assertEquals("INR", response.getCurrency());
        assertEquals(QuotationStatus.DRAFT, response.getStatus());
        assertEquals(BigDecimal.valueOf(10800), response.getTotalAmount());
        verify(quotationRepository, times(1)).save(any(Quotation.class));
    }

    @Test
    void createQuotation_StudioNotFound_ThrowsException() {
        UUID nonExistentStudio = UUID.randomUUID();
        when(tenantContext.getCurrentStudioId()).thenReturn(nonExistentStudio);
        QuotationCreateRequest request = new QuotationCreateRequest();
        request.setStudioId(nonExistentStudio);
        request.setTitle("Fail");

        when(studioRepository.existsById(nonExistentStudio)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> quotationService.createQuotation(request));
    }

    @Test
    void createQuotation_LeadNotFound_ThrowsException() {
        UUID leadId = UUID.randomUUID();
        QuotationCreateRequest request = new QuotationCreateRequest();
        request.setTitle("Fail");
        request.setLeadId(leadId);

        when(leadRepository.findByIdAndStudioId(leadId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> quotationService.createQuotation(request));
    }

    @Test
    void createQuotation_ProjectNotFound_ThrowsException() {
        UUID projectId = UUID.randomUUID();
        QuotationCreateRequest request = new QuotationCreateRequest();
        request.setTitle("Fail");
        request.setProjectId(projectId);

        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> quotationService.createQuotation(request));
    }

    @Test
    void createQuotation_ClientNotFound_ThrowsException() {
        UUID clientId = UUID.randomUUID();
        QuotationCreateRequest request = new QuotationCreateRequest();
        request.setTitle("Fail");
        request.setClientId(clientId);

        when(clientRepository.findByIdAndStudioId(clientId, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> quotationService.createQuotation(request));
    }

    @Test
    void createQuotation_DuplicateNumber_ThrowsException() {
        QuotationCreateRequest request = new QuotationCreateRequest();
        request.setTitle("Pre-wedding");
        request.setQuotationNumber("QTN-EXISTING");

        when(quotationRepository.existsByStudioIdAndQuotationNumber(TenantConstants.DEFAULT_STUDIO_ID, "QTN-EXISTING")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> quotationService.createQuotation(request));
    }

    @Test
    void listQuotations_NoFilters_ReturnsAll() {
        Quotation q = new Quotation();
        q.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        q.setTitle("Quotation Title");
        q.setStatus(QuotationStatus.DRAFT);

        when(quotationRepository.findAllByStudioId(TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(List.of(q));

        List<QuotationResponse> list = quotationService.listQuotations(null);
        assertEquals(1, list.size());
        verify(quotationRepository, times(1)).findAllByStudioId(TenantConstants.DEFAULT_STUDIO_ID);
    }

    @Test
    void listQuotations_WithStatus_ReturnsFiltered() {
        Quotation q = new Quotation();
        q.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        q.setTitle("Quotation Title");
        q.setStatus(QuotationStatus.SENT);

        when(quotationRepository.findByStudioIdAndStatus(TenantConstants.DEFAULT_STUDIO_ID, QuotationStatus.SENT)).thenReturn(List.of(q));

        List<QuotationResponse> list = quotationService.listQuotations(QuotationStatus.SENT);
        assertEquals(1, list.size());
        verify(quotationRepository, times(1)).findByStudioIdAndStatus(TenantConstants.DEFAULT_STUDIO_ID, QuotationStatus.SENT);
    }

    @Test
    void getQuotationById_Success() {
        UUID id = UUID.randomUUID();
        Quotation q = new Quotation();
        q.setId(id);
        q.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        q.setTitle("Quotation Title");

        when(quotationRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(q));

        QuotationResponse response = quotationService.getQuotationById(id);
        assertNotNull(response);
        assertEquals(id, response.getId());
    }

    @Test
    void getQuotationById_NotFound_ThrowsException() {
        UUID id = UUID.randomUUID();
        when(quotationRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> quotationService.getQuotationById(id));
    }

    @Test
    void updateQuotation_Success_RecalculatesTotalAndUpdatesStatus() {
        UUID id = UUID.randomUUID();
        Quotation q = new Quotation();
        q.setId(id);
        q.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        q.setStatus(QuotationStatus.DRAFT);

        QuotationUpdateRequest request = new QuotationUpdateRequest();
        request.setTitle("Updated Title");
        request.setSubtotal(BigDecimal.valueOf(15000));
        request.setDiscountAmount(BigDecimal.valueOf(2000));
        request.setTaxAmount(BigDecimal.valueOf(2700));
        request.setStatus(QuotationStatus.SENT);

        when(quotationRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(q));
        when(quotationRepository.save(any(Quotation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        QuotationResponse response = quotationService.updateQuotation(id, request);

        assertNotNull(response);
        assertEquals("Updated Title", response.getTitle());
        assertEquals(BigDecimal.valueOf(15700), response.getTotalAmount()); // 15000 - 2000 + 2700
        assertEquals(QuotationStatus.SENT, response.getStatus());
        assertNotNull(response.getSentAt());
    }

    @Test
    void updateStatus_Success_SetsTimestamp() {
        UUID id = UUID.randomUUID();
        Quotation q = new Quotation();
        q.setId(id);
        q.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        q.setStatus(QuotationStatus.DRAFT);

        QuotationStatusUpdateRequest request = new QuotationStatusUpdateRequest(QuotationStatus.ACCEPTED);

        when(quotationRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(q));
        when(quotationRepository.save(any(Quotation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        QuotationResponse response = quotationService.updateStatus(id, request);

        assertNotNull(response);
        assertEquals(QuotationStatus.ACCEPTED, response.getStatus());
        assertNotNull(response.getAcceptedAt());
        assertNull(response.getRejectedAt());
        assertNull(response.getSentAt());
    }

    @Test
    void deleteQuotation_Success() {
        UUID id = UUID.randomUUID();
        Quotation q = new Quotation();
        q.setId(id);
        q.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(quotationRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(q));
        doNothing().when(quotationRepository).delete(q);

        assertDoesNotThrow(() -> quotationService.deleteQuotation(id));
        verify(quotationRepository, times(1)).delete(q);
    }

    @Test
    void quotationTenantIsolationTest() {
        UUID studioA = UUID.randomUUID();
        UUID studioB = UUID.randomUUID();
        UUID quotationId = UUID.randomUUID();

        // 1. Authenticate as Studio A
        when(tenantContext.getCurrentStudioId()).thenReturn(studioA);

        Quotation quotationA = new Quotation();
        quotationA.setId(quotationId);
        quotationA.setStudioId(studioA);
        quotationA.setTitle("Quotation of Studio A");

        // Mock database
        when(quotationRepository.findByIdAndStudioId(quotationId, studioA)).thenReturn(Optional.of(quotationA));
        when(quotationRepository.findByIdAndStudioId(quotationId, studioB)).thenReturn(Optional.empty());

        // Fetching under Studio A should work
        QuotationResponse response = quotationService.getQuotationById(quotationId);
        assertEquals("Quotation of Studio A", response.getTitle());
        assertEquals(studioA, response.getStudioId());

        // 2. Switch context to Studio B
        when(tenantContext.getCurrentStudioId()).thenReturn(studioB);

        // Fetching under Studio B should throw ResourceNotFoundException
        assertThrows(ResourceNotFoundException.class, () -> quotationService.getQuotationById(quotationId));

        // Creating quotation under Studio B but specifying Studio A ID in payload should fail
        QuotationCreateRequest request = new QuotationCreateRequest();
        request.setStudioId(studioA);
        request.setTitle("Title");
        assertThrows(IllegalArgumentException.class, () -> quotationService.createQuotation(request));
    }
}

