package com.studioops.lead;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantContext;
import com.studioops.studio.StudioRepository;
import com.studioops.client.Client;
import com.studioops.client.ClientRepository;
import com.studioops.project.Project;
import com.studioops.project.ProjectRepository;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class LeadService {

    private final LeadRepository leadRepository;
    private final StudioRepository studioRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final EventRepository eventRepository;
    private final TenantContext tenantContext;

    public LeadService(
            LeadRepository leadRepository,
            StudioRepository studioRepository,
            ClientRepository clientRepository,
            ProjectRepository projectRepository,
            EventRepository eventRepository,
            TenantContext tenantContext) {
        this.leadRepository = leadRepository;
        this.studioRepository = studioRepository;
        this.clientRepository = clientRepository;
        this.projectRepository = projectRepository;
        this.eventRepository = eventRepository;
        this.tenantContext = tenantContext;
    }

    public LeadResponse createLead(LeadCreateRequest request) {
        UUID currentStudioId = tenantContext.getCurrentStudioId();
        if (request.getStudioId() != null && !request.getStudioId().equals(currentStudioId)) {
            throw new IllegalArgumentException("Mismatched studio ID provided");
        }
        UUID studioId = currentStudioId;

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
        UUID studioId = tenantContext.getCurrentStudioId();
        if (search != null && !search.trim().isEmpty()) {
            leads = leadRepository.searchByStudioId(studioId, search.trim());
        } else if (pipelineStage != null) {
            leads = leadRepository.findByStudioIdAndPipelineStage(studioId, pipelineStage);
        } else if (leadSource != null) {
            leads = leadRepository.findByStudioIdAndLeadSource(studioId, leadSource);
        } else {
            leads = leadRepository.findAllByStudioId(studioId);
        }
        return leads.stream()
                .map(LeadMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public LeadResponse getLeadById(UUID id) {
        Lead lead = leadRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));
        return LeadMapper.toResponse(lead);
    }

    public LeadResponse updateLead(UUID id, LeadUpdateRequest request) {
        Lead lead = leadRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
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
        Lead lead = leadRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
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
        Lead lead = leadRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));
        leadRepository.delete(lead);
    }

    public LeadConvertToProjectResponse convertLeadToProject(UUID id, LeadConvertToProjectRequest request) {
        Lead lead = leadRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));

        // If the lead is already converted, return immediately
        if (lead.getProjectId() != null) {
            return new LeadConvertToProjectResponse(
                    lead.getId(),
                    lead.getClientId(),
                    lead.getProjectId(),
                    lead.getPipelineStage(),
                    lead.getConvertedAt(),
                    "Lead is already converted"
            );
        }

        // 1. Resolve or Create Client
        UUID resolvedClientId;
        if (lead.getClientId() != null) {
            clientRepository.findByIdAndStudioId(lead.getClientId(), lead.getStudioId())
                    .orElseThrow(() -> new IllegalArgumentException("Client not found with id: " + lead.getClientId() + " for studio: " + lead.getStudioId()));
            resolvedClientId = lead.getClientId();
        } else {
            Client client = new Client();
            client.setStudioId(lead.getStudioId());
            client.setFullName(lead.getClientName());
            // Since Client.phone is required, we use "UNKNOWN" as a temporary fallback if lead.phone is null/empty.
            String resolvedPhone = (lead.getPhone() != null && !lead.getPhone().trim().isEmpty())
                    ? lead.getPhone().trim()
                    : "UNKNOWN";
            client.setPhone(resolvedPhone);
            client.setEmail(lead.getEmail() != null ? lead.getEmail().trim() : null);
            client.setNotes("Created from lead conversion");
            Client savedClient = clientRepository.save(client);
            resolvedClientId = savedClient.getId();
        }

        // 2. Create Project
        Project project = new Project();
        project.setStudioId(lead.getStudioId());
        project.setClientId(resolvedClientId);

        // Resolve Project Code
        String projectCode;
        if (request.getProjectCode() != null && !request.getProjectCode().trim().isEmpty()) {
            projectCode = request.getProjectCode().trim();
        } else {
            projectCode = "PRJ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
        if (projectRepository.findByProjectCode(projectCode).isPresent()) {
            throw new IllegalArgumentException("Project code already exists: " + projectCode);
        }
        project.setProjectCode(projectCode);

        // Resolve Title
        String title;
        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            title = request.getTitle().trim();
        } else if (lead.getEventType() != null && !lead.getEventType().trim().isEmpty()) {
            title = lead.getEventType().trim() + " - " + lead.getClientName();
        } else {
            title = "Event - " + lead.getClientName();
        }
        project.setTitle(title);

        // Resolve Project Type
        String projectType;
        if (request.getProjectType() != null && !request.getProjectType().trim().isEmpty()) {
            projectType = request.getProjectType().trim();
        } else if (lead.getEventType() != null && !lead.getEventType().trim().isEmpty()) {
            projectType = lead.getEventType().trim();
        } else {
            projectType = "General";
        }
        project.setProjectType(projectType);

        // Resolve Enums
        project.setBookingStatus(request.getBookingStatus() != null ? request.getBookingStatus() : BookingStatus.INQUIRY);
        project.setPaymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : PaymentStatus.UNPAID);
        project.setStatus(request.getStatus() != null ? request.getStatus() : ProjectStatus.LEAD);

        project.setStartDate(lead.getEventDate());
        project.setEndDate(lead.getEventDate());
        
        project.setNotes(request.getNotes() != null && !request.getNotes().trim().isEmpty() 
                ? request.getNotes().trim() 
                : lead.getNotes());

        Project savedProject = projectRepository.save(project);

        // 3. Create Event automatically if eventDate is present and no event already exists
        if (lead.getEventDate() != null) {
            List<Event> existingEvents = eventRepository.findByProjectIdAndStudioId(savedProject.getId(), lead.getStudioId());
            if (existingEvents.isEmpty()) {
                Event event = new Event();
                event.setProjectId(savedProject.getId());
                event.setStudioId(lead.getStudioId());
                event.setTitle(savedProject.getTitle());
                event.setType(parseEventType(lead.getEventType()));
                event.setEventDate(lead.getEventDate());
                event.setStartTime(java.time.LocalTime.of(9, 0));
                event.setEndTime(java.time.LocalTime.of(18, 0));
                event.setVenueName("TBD");
                event.setCity(lead.getCity() != null && !lead.getCity().trim().isEmpty() ? lead.getCity().trim() : "TBD");
                event.setAddress("TBD");
                event.setStatus(EventStatus.SCHEDULED);
                event.setNotes("Created automatically from Lead conversion");
                eventRepository.save(event);
            }
        }

        // 4. Update Lead
        lead.setClientId(resolvedClientId);
        lead.setProjectId(savedProject.getId());
        lead.setPipelineStage(LeadPipelineStage.CONFIRMED);
        lead.setLostReason(null);
        lead.setConvertedAt(Instant.now());
        Lead savedLead = leadRepository.save(lead);

        // TODO: Cancel active follow-up tasks linked to lead once task-lead linkage is implemented.
        // Currently, FollowUpTask doesn't have a leadId/projectId column and we avoid broad cancellation by clientId.

        String responseMessage = lead.getEventDate() != null 
                ? "Project created and added to Event Calendar."
                : "Project created. Add event date to schedule resources.";

        return new LeadConvertToProjectResponse(
                savedLead.getId(),
                resolvedClientId,
                savedProject.getId(),
                savedLead.getPipelineStage(),
                savedLead.getConvertedAt(),
                responseMessage
        );
    }

    private EventType parseEventType(String value) {
        if (value == null) {
            return EventType.OTHER;
        }
        try {
            return EventType.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            return EventType.OTHER;
        }
    }
}
