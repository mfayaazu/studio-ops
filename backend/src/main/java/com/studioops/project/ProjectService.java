package com.studioops.project;

import com.studioops.client.ClientRepository;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantContext;
import com.studioops.studio.StudioRepository;
import com.studioops.studio.Studio;
import com.studioops.event.Event;
import com.studioops.event.EventRepository;
import com.studioops.event.EventStatus;
import com.studioops.event.EventType;
import com.studioops.deliverable.Deliverable;
import com.studioops.deliverable.DeliverableType;
import com.studioops.deliverable.DeliverableStatus;
import com.studioops.deliverable.DeliverablePriority;
import com.studioops.deliverable.DeliverableRepository;
import com.studioops.project.dto.ProjectCreateRequest;
import com.studioops.project.dto.ProjectResponse;
import com.studioops.project.dto.ProjectUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
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
    private final DeliverableRepository deliverableRepository;
    private final TenantContext tenantContext;
    private final com.studioops.user.PermissionService permissionService;

    public ProjectService(
            ProjectRepository projectRepository,
            ClientRepository clientRepository,
            StudioRepository studioRepository,
            EventRepository eventRepository,
            DeliverableRepository deliverableRepository,
            TenantContext tenantContext,
            com.studioops.user.PermissionService permissionService) {
        this.projectRepository = projectRepository;
        this.clientRepository = clientRepository;
        this.studioRepository = studioRepository;
        this.eventRepository = eventRepository;
        this.deliverableRepository = deliverableRepository;
        this.tenantContext = tenantContext;
        this.permissionService = permissionService;
    }

    public ProjectResponse createProject(ProjectCreateRequest request) {
        permissionService.checkPermission(com.studioops.user.PageKey.PROJECTS, com.studioops.user.AccessLevel.EDIT);
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

        // Validate date range
        if (request.getStartDate() != null && request.getEndDate() != null 
                && request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        Project project = new Project();
        project.setStudioId(studioId);
        project.setClientId(request.getClientId());
        project.setAssignedProjectManagerId(request.getAssignedProjectManagerId());
        project.setTitle(request.getTitle().trim());
        project.setProjectType(request.getProjectType().trim());

        project.setBookingStatus(request.getBookingStatus() != null ? request.getBookingStatus() : BookingStatus.INQUIRY);
        project.setPaymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : PaymentStatus.UNPAID);
        project.setStatus(request.getStatus() != null ? request.getStatus() : ProjectStatus.LEAD);

        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        // Map new fields
        project.setProjectSubtype(request.getProjectSubtype() != null ? request.getProjectSubtype().trim() : null);
        project.setProjectEvents(request.getProjectEvents() != null ? request.getProjectEvents().trim() : null);
        project.setProjectBudget(request.getProjectBudget());
        project.setAmountPaid(request.getAmountPaid());
        project.setShootLocation(request.getShootLocation() != null ? request.getShootLocation().trim() : null);
        project.setGoogleMapsLink(request.getGoogleMapsLink() != null ? request.getGoogleMapsLink().trim() : null);
        project.setShootDate(request.getShootDate());
        project.setShootStartTime(request.getShootStartTime());
        project.setShootEndTime(request.getShootEndTime());
        project.setPriority(request.getPriority() != null ? request.getPriority() : ProjectPriority.MEDIUM);
        project.setLeadSource(request.getLeadSource() != null ? request.getLeadSource().trim() : null);

        String trimmedCode = request.getProjectCode() != null ? request.getProjectCode().trim() : "";
        boolean isExplicit = !trimmedCode.isEmpty();
        if (trimmedCode.isEmpty()) {
            int year = request.getStartDate() != null ? request.getStartDate().getYear() : LocalDate.now().getYear();
            trimmedCode = getNextProjectCode(studioId, year);
        } else {
            if (projectRepository.findByStudioIdAndProjectCode(studioId, trimmedCode).isPresent()) {
                throw new IllegalArgumentException("Project code already exists: " + trimmedCode);
            }
        }

        int retries = 3;
        String currentCode = trimmedCode;
        Project saved = null;
        while (retries > 0) {
            if (!isExplicit || retries < 3) {
                if (projectRepository.findByStudioIdAndProjectCode(studioId, currentCode).isPresent()) {
                    int year = request.getStartDate() != null ? request.getStartDate().getYear() : LocalDate.now().getYear();
                    currentCode = getNextProjectCode(studioId, year);
                    continue;
                }
            }
            project.setProjectCode(currentCode);
            try {
                saved = projectRepository.saveAndFlush(project);
                break;
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                if (isExplicit) {
                    throw new IllegalArgumentException("Project code already exists: " + currentCode);
                }
                retries--;
                if (retries == 0) {
                    throw e;
                }
                int year = request.getStartDate() != null ? request.getStartDate().getYear() : LocalDate.now().getYear();
                currentCode = getNextProjectCode(studioId, year);
            }
        }

        // Auto-create default deliverables if requested
        if (saved != null && request.getDefaultDeliverables() != null && !request.getDefaultDeliverables().isEmpty()) {
            for (String delivTypeStr : request.getDefaultDeliverables()) {
                try {
                    DeliverableType type = DeliverableType.valueOf(delivTypeStr.toUpperCase().trim());
                    boolean exists = deliverableRepository.existsByProjectIdAndDeliverableType(saved.getId(), type);
                    if (!exists) {
                        Deliverable d = new Deliverable();
                        d.setProjectId(saved.getId());
                        d.setStudioId(studioId);
                        d.setDeliverableType(type);
                        d.setStatus(DeliverableStatus.NOT_STARTED);
                        d.setPriority(DeliverablePriority.MEDIUM);
                        
                        String name = type.name().replace("_", " ");
                        name = name.substring(0, 1).toUpperCase() + name.substring(1).toLowerCase();
                        if (type == DeliverableType.HARD_DISK) {
                            name = "Hard Disk";
                        } else if (type == DeliverableType.FULL_VIDEO) {
                            name = "Full Video";
                        } else if (type == DeliverableType.ALBUM_SELECTION) {
                            name = "Album Selection";
                        } else if (type == DeliverableType.ALBUM_DESIGN) {
                            name = "Album Design";
                        } else if (type == DeliverableType.ALBUM_PRINT) {
                            name = "Album Print";
                        }
                        d.setName(name);
                        deliverableRepository.save(d);
                    }
                } catch (IllegalArgumentException e) {
                    // ignore
                }
            }
        }

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
        permissionService.checkPermission(com.studioops.user.PageKey.PROJECTS, com.studioops.user.AccessLevel.EDIT);
        Project project = projectRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        // Validate client belongs to the same studio
        if (request.getClientId() == null || clientRepository.findByIdAndStudioId(request.getClientId(), project.getStudioId()).isEmpty()) {
            throw new IllegalArgumentException("Client not found with id: " + request.getClientId());
        }

        // Validate unique projectCode
        String trimmedCode = request.getProjectCode().trim();
        Optional<Project> existingWithCode = projectRepository.findByStudioIdAndProjectCode(project.getStudioId(), trimmedCode);
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

        // Map new fields
        project.setProjectSubtype(request.getProjectSubtype() != null ? request.getProjectSubtype().trim() : null);
        project.setProjectEvents(request.getProjectEvents() != null ? request.getProjectEvents().trim() : null);
        project.setProjectBudget(request.getProjectBudget());
        project.setAmountPaid(request.getAmountPaid());
        project.setShootLocation(request.getShootLocation() != null ? request.getShootLocation().trim() : null);
        project.setGoogleMapsLink(request.getGoogleMapsLink() != null ? request.getGoogleMapsLink().trim() : null);
        project.setShootDate(request.getShootDate());
        project.setShootStartTime(request.getShootStartTime());
        project.setShootEndTime(request.getShootEndTime());
        project.setPriority(request.getPriority() != null ? request.getPriority() : ProjectPriority.MEDIUM);
        project.setLeadSource(request.getLeadSource() != null ? request.getLeadSource().trim() : null);

        Project updated = projectRepository.save(project);
        return ProjectMapper.toResponse(updated);
    }

    public void deleteProject(UUID id) {
        permissionService.checkPermission(com.studioops.user.PageKey.PROJECTS, com.studioops.user.AccessLevel.EDIT);
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
        permissionService.checkPermission(com.studioops.user.PageKey.PROJECTS, com.studioops.user.AccessLevel.EDIT);
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

    @Transactional(readOnly = true)
    public String getNextProjectCode(int year) {
        return getNextProjectCode(tenantContext.getCurrentStudioId(), year);
    }

    @Transactional(readOnly = true)
    public String getNextProjectCode(UUID studioId, int year) {
        Studio studio = studioRepository.findById(studioId)
                .orElseThrow(() -> new ResourceNotFoundException("Studio not found with id: " + studioId));
        String prefix = studio.getShortCode();
        if (prefix == null || prefix.trim().isEmpty()) {
            String raw = studio.getName().replaceAll("[^A-Za-z0-9]", "").toUpperCase();
            if (raw.length() >= 6) {
                prefix = raw.substring(0, 6);
            } else if (raw.length() >= 3) {
                prefix = raw;
            } else {
                prefix = (raw + "STUDIO").substring(0, 6);
            }
        } else {
            prefix = prefix.trim().toUpperCase();
        }

        String pattern = prefix + "-" + year + "-%";
        List<String> existingCodes = projectRepository.findProjectCodesByStudioAndPattern(studioId, pattern);
        
        int maxSeq = 0;
        for (String code : existingCodes) {
            try {
                String[] parts = code.split("-");
                if (parts.length >= 3) {
                    int seq = Integer.parseInt(parts[parts.length - 1]);
                    if (seq > maxSeq) {
                        maxSeq = seq;
                    }
                }
            } catch (NumberFormatException e) {
                // ignore
            }
        }
        
        int nextSeq = maxSeq + 1;
        return String.format("%s-%d-%04d", prefix, year, nextSeq);
    }
}
