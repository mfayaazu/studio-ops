package com.studioops.lead;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.studio.StudioRepository;
import com.studioops.client.ClientRepository;
import com.studioops.project.ProjectRepository;
import com.studioops.lead.dto.LeadCreateRequest;
import com.studioops.lead.dto.LeadResponse;
import com.studioops.lead.dto.LeadUpdateRequest;
import com.studioops.lead.dto.LeadMoveStageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class LeadService {

    private final LeadRepository leadRepository;
    private final StudioRepository studioRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;

    public LeadService(
            LeadRepository leadRepository,
            StudioRepository studioRepository,
            ClientRepository clientRepository,
            ProjectRepository projectRepository) {
        this.leadRepository = leadRepository;
        this.studioRepository = studioRepository;
        this.clientRepository = clientRepository;
        this.projectRepository = projectRepository;
    }

    public LeadResponse createLead(LeadCreateRequest request) {
        UUID studioId = request.getStudioId() != null ? request.getStudioId() : TenantConstants.DEFAULT_STUDIO_ID;
        if (!studioRepository.existsById(studioId)) {
            throw new IllegalArgumentException("Studio not found with id: " + studioId);
        }

        if (request.getClientId() != null) {
            clientRepository.findByIdAndStudioId(request.getClientId(), studioId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found with id: " + request.getClientId() + " for studio: " + studioId));
        }

        if (request.getProjectId() != null) {
            projectRepository.findByIdAndStudioId(request.getProjectId(), studioId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + request.getProjectId() + " for studio: " + studioId));
        }

        Lead lead = new Lead();
        lead.setStudioId(studioId);
        lead.setClientId(request.getClientId());
        lead.setProjectId(request.getProjectId());
        lead.setClientName(request.getClientName().trim());
        lead.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        lead.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        lead.setPreferredChannel(request.getPreferredChannel());
        lead.setEventType(request.getEventType() != null ? request.getEventType().trim() : null);
        lead.setEventDate(request.getEventDate());
        lead.setCity(request.getCity() != null ? request.getCity().trim() : null);
        lead.setEstimatedValue(request.getEstimatedValue());
        lead.setLeadSource(request.getLeadSource());
        lead.setPipelineStage(request.getPipelineStage() != null ? request.getPipelineStage() : LeadPipelineStage.NEW_LEAD);
        lead.setAssignedUserId(request.getAssignedUserId());
        lead.setLastContactedAt(request.getLastContactedAt());
        lead.setNextFollowUpAt(request.getNextFollowUpAt());
        lead.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);
        lead.setLostReason(null); // Creation lostReason defaults to null

        Lead saved = leadRepository.save(lead);
        return LeadMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<LeadResponse> listLeads(String search, LeadPipelineStage pipelineStage, LeadSource leadSource) {
        List<Lead> leads;
        if (search != null && !search.trim().isEmpty()) {
            leads = leadRepository.searchByStudioId(TenantConstants.DEFAULT_STUDIO_ID, search.trim());
        } else if (pipelineStage != null) {
            leads = leadRepository.findByStudioIdAndPipelineStage(TenantConstants.DEFAULT_STUDIO_ID, pipelineStage);
        } else if (leadSource != null) {
            leads = leadRepository.findByStudioIdAndLeadSource(TenantConstants.DEFAULT_STUDIO_ID, leadSource);
        } else {
            leads = leadRepository.findAllByStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        }
        return leads.stream()
                .map(LeadMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public LeadResponse getLeadById(UUID id) {
        Lead lead = leadRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));
        return LeadMapper.toResponse(lead);
    }

    public LeadResponse updateLead(UUID id, LeadUpdateRequest request) {
        Lead lead = leadRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));

        lead.setClientName(request.getClientName().trim());
        lead.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        lead.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        lead.setPreferredChannel(request.getPreferredChannel());
        lead.setEventType(request.getEventType() != null ? request.getEventType().trim() : null);
        lead.setEventDate(request.getEventDate());
        lead.setCity(request.getCity() != null ? request.getCity().trim() : null);
        lead.setEstimatedValue(request.getEstimatedValue());
        lead.setLeadSource(request.getLeadSource());
        lead.setAssignedUserId(request.getAssignedUserId());
        lead.setLastContactedAt(request.getLastContactedAt());
        lead.setNextFollowUpAt(request.getNextFollowUpAt());
        lead.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        Lead updated = leadRepository.save(lead);
        return LeadMapper.toResponse(updated);
    }

    public LeadResponse moveStage(UUID id, LeadMoveStageRequest request) {
        Lead lead = leadRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));

        lead.setPipelineStage(request.getPipelineStage());

        if (request.getPipelineStage() == LeadPipelineStage.LOST) {
            lead.setLostReason(request.getLostReason());
        } else {
            lead.setLostReason(null);
        }

        if (request.getNotes() != null) {
            lead.setNotes(request.getNotes().trim());
        }

        Lead updated = leadRepository.save(lead);
        return LeadMapper.toResponse(updated);
    }

    public void deleteLead(UUID id) {
        Lead lead = leadRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));
        leadRepository.delete(lead);
    }
}
