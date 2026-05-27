package com.studioops.project;

import com.studioops.client.ClientRepository;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantContext;
import com.studioops.studio.StudioRepository;
import com.studioops.event.Event;
import com.studioops.event.EventRepository;
import com.studioops.event.EventStatus;
import com.studioops.event.EventType;
import com.studioops.project.dto.ProjectCreateRequest;
import com.studioops.project.dto.ProjectResponse;
import com.studioops.project.dto.ProjectUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final StudioRepository studioRepository;
    private final EventRepository eventRepository;
    private final TenantContext tenantContext;

    public ProjectService(ProjectRepository projectRepository, ClientRepository clientRepository, StudioRepository studioRepository, EventRepository eventRepository, TenantContext tenantContext) {
        this.projectRepository = projectRepository;
        this.clientRepository = clientRepository;
        this.studioRepository = studioRepository;
        this.eventRepository = eventRepository;
        this.tenantContext = tenantContext;
    }

    public ProjectResponse createProject(ProjectCreateRequest request) {
        UUID currentStudioId = tenantContext.getCurrentStudioId();
        if (request.getStudioId() != null && !request.getStudioId().equals(currentStudioId)) {
            throw new IllegalArgumentException("Mismatched studio ID provided");
        }
        UUID studioId = currentStudioId;

        if (!studioRepository.existsById(studioId)) {
            throw new IllegalArgumentException("Studio not found with id: " + studioId);
        }

        // Validate client belongs to the same studio
        if (request.getClientId() == null || clientRepository.findByIdAndStudioId(request.getClientId(), studioId).isEmpty()) {
            throw new IllegalArgumentException("Client not found with id: " + request.getClientId());
        }

        // Validate unique projectCode
        String trimmedCode = request.getProjectCode().trim();
        if (projectRepository.findByProjectCode(trimmedCode).isPresent()) {
            throw new IllegalArgumentException("Project code already exists: " + trimmedCode);
        }

        // Validate date range
        if (request.getStartDate() != null && request.getEndDate() != null 
                && request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        Project project = new Project();
        project.setStudioId(studioId);
        project.setClientId(request.getClientId());
        project.setAssignedProjectManagerId(request.getAssignedProjectManagerId());
        project.setProjectCode(trimmedCode);
        project.setTitle(request.getTitle().trim());
        project.setProjectType(request.getProjectType().trim());

        project.setBookingStatus(request.getBookingStatus() != null ? request.getBookingStatus() : BookingStatus.INQUIRY);
        project.setPaymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : PaymentStatus.UNPAID);
        project.setStatus(request.getStatus() != null ? request.getStatus() : ProjectStatus.LEAD);

        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        Project saved = projectRepository.save(project);
        return ProjectMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> listProjects(String search) {
        return listProjectsForStudio(tenantContext.getCurrentStudioId(), search);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> listProjectsForStudio(UUID studioId, String search) {
        List<Project> projects;
        if (search == null || search.trim().isEmpty()) {
            projects = projectRepository.findAllByStudioId(studioId);
        } else {
            projects = projectRepository.searchProjectsByStudio(studioId, search.trim());
        }
        return projects.stream()
                .map(ProjectMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(UUID id) {
        Project project = projectRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        return ProjectMapper.toResponse(project);
    }

    public ProjectResponse updateProject(UUID id, ProjectUpdateRequest request) {
        Project project = projectRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        // Validate client belongs to the same studio
        if (request.getClientId() == null || clientRepository.findByIdAndStudioId(request.getClientId(), project.getStudioId()).isEmpty()) {
            throw new IllegalArgumentException("Client not found with id: " + request.getClientId());
        }

        // Validate unique projectCode
        String trimmedCode = request.getProjectCode().trim();
        Optional<Project> existingWithCode = projectRepository.findByProjectCode(trimmedCode);
        if (existingWithCode.isPresent() && !existingWithCode.get().getId().equals(id)) {
            throw new IllegalArgumentException("Project code already exists: " + trimmedCode);
        }

        // Validate date range
        if (request.getStartDate() != null && request.getEndDate() != null 
                && request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        project.setClientId(request.getClientId());
        project.setAssignedProjectManagerId(request.getAssignedProjectManagerId());
        project.setProjectCode(trimmedCode);
        project.setTitle(request.getTitle().trim());
        project.setProjectType(request.getProjectType().trim());

        project.setBookingStatus(request.getBookingStatus() != null ? request.getBookingStatus() : BookingStatus.INQUIRY);
        project.setPaymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : PaymentStatus.UNPAID);
        project.setStatus(request.getStatus() != null ? request.getStatus() : ProjectStatus.LEAD);

        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        Project updated = projectRepository.save(project);
        return ProjectMapper.toResponse(updated);
    }

    public void deleteProject(UUID id) {
        Project project = projectRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        projectRepository.delete(project);
    }

    /**
     * Idempotent repair action: creates a linked Event for a project that already exists
     * but was converted before automatic event creation was in place.
     * Safe to call multiple times — skips if event already exists.
     * Returns a message describing what happened.
     */
    public String scheduleEventForProject(UUID id) {
        UUID studioId = tenantContext.getCurrentStudioId();
        Project project = projectRepository.findByIdAndStudioId(id, studioId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        if (project.getStartDate() == null) {
            return "Project has no event date set. Update the project start date first.";
        }

        // Idempotency check: skip if event already exists for this project
        if (!eventRepository.findByProjectIdAndStudioId(id, studioId).isEmpty()) {
            return "Event already exists for this project.";
        }

        Event event = new Event();
        event.setProjectId(project.getId());
        event.setStudioId(studioId);
        event.setTitle(project.getTitle());
        event.setType(parseEventType(project.getProjectType()));
        event.setEventDate(project.getStartDate());
        event.setStartTime(java.time.LocalTime.of(9, 0));
        event.setEndTime(java.time.LocalTime.of(18, 0));
        event.setVenueName("TBD");
        event.setCity("TBD");
        event.setAddress("TBD");
        event.setStatus(EventStatus.SCHEDULED);
        event.setNotes("Scheduled from project repair action");
        eventRepository.save(event);
        return "Event scheduled successfully for project: " + project.getTitle();
    }

    private EventType parseEventType(String value) {
        if (value == null) return EventType.OTHER;
        try {
            return EventType.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            return EventType.OTHER;
        }
    }
}
