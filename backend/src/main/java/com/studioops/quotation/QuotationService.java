package com.studioops.quotation;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantContext;
import com.studioops.studio.StudioRepository;
import com.studioops.client.ClientRepository;
import com.studioops.project.ProjectRepository;
import com.studioops.lead.LeadRepository;
import com.studioops.quotation.dto.QuotationCreateRequest;
import com.studioops.quotation.dto.QuotationResponse;
import com.studioops.quotation.dto.QuotationUpdateRequest;
import com.studioops.quotation.dto.QuotationStatusUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final StudioRepository studioRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final LeadRepository leadRepository;
    private final TenantContext tenantContext;

    public QuotationService(
            QuotationRepository quotationRepository,
            StudioRepository studioRepository,
            ClientRepository clientRepository,
            ProjectRepository projectRepository,
            LeadRepository leadRepository,
            TenantContext tenantContext) {
        this.quotationRepository = quotationRepository;
        this.studioRepository = studioRepository;
        this.clientRepository = clientRepository;
        this.projectRepository = projectRepository;
        this.leadRepository = leadRepository;
        this.tenantContext = tenantContext;
    }

    public QuotationResponse createQuotation(QuotationCreateRequest request) {
        UUID currentStudioId = tenantContext.getCurrentStudioId();
        if (request.getStudioId() != null && !request.getStudioId().equals(currentStudioId)) {
            throw new IllegalArgumentException("Mismatched studio ID provided");
        }
        UUID studioId = currentStudioId;

        if (!studioRepository.existsById(studioId)) {
            throw new IllegalArgumentException("Studio not found with id: " + studioId);
        }

        validateRelatedEntities(studioId, request.getLeadId(), request.getProjectId(), request.getClientId());

        Quotation quotation = new Quotation();
        quotation.setStudioId(studioId);
        quotation.setLeadId(request.getLeadId());
        quotation.setProjectId(request.getProjectId());
        quotation.setClientId(request.getClientId());

        // Handle quotation number
        String qtnNumber = request.getQuotationNumber();
        if (qtnNumber == null || qtnNumber.trim().isEmpty()) {
            qtnNumber = generateQuotationNumber(studioId);
        } else {
            if (quotationRepository.existsByStudioIdAndQuotationNumber(studioId, qtnNumber)) {
                throw new IllegalArgumentException("Quotation number already exists: " + qtnNumber);
            }
        }
        quotation.setQuotationNumber(qtnNumber);

        quotation.setTitle(request.getTitle());
        quotation.setDescription(request.getDescription());
        quotation.setStatus(request.getStatus() != null ? request.getStatus() : QuotationStatus.DRAFT);
        quotation.setCurrency(request.getCurrency() != null ? request.getCurrency() : "INR");
        quotation.setValidUntil(request.getValidUntil());
        quotation.setNotes(request.getNotes());

        // Amounts
        BigDecimal subtotal = request.getSubtotal() != null ? request.getSubtotal() : BigDecimal.ZERO;
        BigDecimal discountAmount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal taxAmount = request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO;
        quotation.setSubtotal(subtotal);
        quotation.setDiscountAmount(discountAmount);
        quotation.setTaxAmount(taxAmount);
        quotation.setTotalAmount(subtotal.subtract(discountAmount).add(taxAmount));

        // Timestamps on status
        handleStatusTimestamps(quotation, quotation.getStatus());

        Quotation saved = quotationRepository.save(quotation);
        return QuotationMapper.toResponse(saved);
    }

    public List<QuotationResponse> listQuotations(QuotationStatus status) {
        UUID studioId = tenantContext.getCurrentStudioId();
        List<Quotation> quotations;
        if (status != null) {
            quotations = quotationRepository.findByStudioIdAndStatus(studioId, status);
        } else {
            quotations = quotationRepository.findAllByStudioId(studioId);
        }
        return quotations.stream()
                .map(QuotationMapper::toResponse)
                .collect(Collectors.toList());
    }

    public QuotationResponse getQuotationById(UUID id) {
        UUID studioId = tenantContext.getCurrentStudioId();
        Quotation quotation = quotationRepository.findByIdAndStudioId(id, studioId)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation not found with id: " + id));
        return QuotationMapper.toResponse(quotation);
    }

    public QuotationResponse updateQuotation(UUID id, QuotationUpdateRequest request) {
        UUID studioId = tenantContext.getCurrentStudioId();
        Quotation quotation = quotationRepository.findByIdAndStudioId(id, studioId)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation not found with id: " + id));

        validateRelatedEntities(studioId, request.getLeadId(), request.getProjectId(), request.getClientId());

        quotation.setLeadId(request.getLeadId());
        quotation.setProjectId(request.getProjectId());
        quotation.setClientId(request.getClientId());
        quotation.setTitle(request.getTitle());
        quotation.setDescription(request.getDescription());
        if (request.getCurrency() != null) {
            quotation.setCurrency(request.getCurrency());
        }
        quotation.setValidUntil(request.getValidUntil());
        quotation.setNotes(request.getNotes());

        // Amounts
        BigDecimal subtotal = request.getSubtotal() != null ? request.getSubtotal() : BigDecimal.ZERO;
        BigDecimal discountAmount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal taxAmount = request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO;
        quotation.setSubtotal(subtotal);
        quotation.setDiscountAmount(discountAmount);
        quotation.setTaxAmount(taxAmount);
        quotation.setTotalAmount(subtotal.subtract(discountAmount).add(taxAmount));

        // If status changed
        if (request.getStatus() != null && request.getStatus() != quotation.getStatus()) {
            quotation.setStatus(request.getStatus());
            handleStatusTimestamps(quotation, request.getStatus());
        }

        Quotation saved = quotationRepository.save(quotation);
        return QuotationMapper.toResponse(saved);
    }

    public QuotationResponse updateStatus(UUID id, QuotationStatusUpdateRequest request) {
        UUID studioId = tenantContext.getCurrentStudioId();
        Quotation quotation = quotationRepository.findByIdAndStudioId(id, studioId)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation not found with id: " + id));

        if (request.getStatus() != quotation.getStatus()) {
            quotation.setStatus(request.getStatus());
            handleStatusTimestamps(quotation, request.getStatus());
        }

        Quotation saved = quotationRepository.save(quotation);
        return QuotationMapper.toResponse(saved);
    }

    public void deleteQuotation(UUID id) {
        UUID studioId = tenantContext.getCurrentStudioId();
        Quotation quotation = quotationRepository.findByIdAndStudioId(id, studioId)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation not found with id: " + id));
        quotationRepository.delete(quotation);
    }

    private void validateRelatedEntities(UUID studioId, UUID leadId, UUID projectId, UUID clientId) {
        if (leadId != null) {
            leadRepository.findByIdAndStudioId(leadId, studioId)
                    .orElseThrow(() -> new IllegalArgumentException("Lead not found with id: " + leadId + " for studio: " + studioId));
        }
        if (projectId != null) {
            projectRepository.findByIdAndStudioId(projectId, studioId)
                    .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projectId + " for studio: " + studioId));
        }
        if (clientId != null) {
            clientRepository.findByIdAndStudioId(clientId, studioId)
                    .orElseThrow(() -> new IllegalArgumentException("Client not found with id: " + clientId + " for studio: " + studioId));
        }
    }

    private String generateQuotationNumber(UUID studioId) {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "QTN-" + dateStr + "-";
        for (int i = 0; i < 10; i++) {
            String suffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
            String candidate = prefix + suffix;
            if (!quotationRepository.existsByStudioIdAndQuotationNumber(studioId, candidate)) {
                return candidate;
            }
        }
        return prefix + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private void handleStatusTimestamps(Quotation quotation, QuotationStatus newStatus) {
        if (newStatus == QuotationStatus.SENT && quotation.getSentAt() == null) {
            quotation.setSentAt(Instant.now());
        } else if (newStatus == QuotationStatus.ACCEPTED && quotation.getAcceptedAt() == null) {
            quotation.setAcceptedAt(Instant.now());
        } else if (newStatus == QuotationStatus.REJECTED && quotation.getRejectedAt() == null) {
            quotation.setRejectedAt(Instant.now());
        }
    }
}
