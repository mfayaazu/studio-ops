package com.studioops.event;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantContext;
import com.studioops.project.ProjectRepository;
import com.studioops.studio.StudioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import com.studioops.event.dto.EventCreateRequest;
import com.studioops.event.dto.EventResponse;
import com.studioops.event.dto.EventUpdateRequest;

@Service
@Transactional
public class EventService {

    private final EventRepository eventRepository;
    private final ProjectRepository projectRepository;
    private final StudioRepository studioRepository;
    private final TenantContext tenantContext;

    public EventService(EventRepository eventRepository, ProjectRepository projectRepository, StudioRepository studioRepository, TenantContext tenantContext) {
        this.eventRepository = eventRepository;
        this.projectRepository = projectRepository;
        this.studioRepository = studioRepository;
        this.tenantContext = tenantContext;
    }

    public EventResponse createEvent(EventCreateRequest request) {
        UUID currentStudioId = tenantContext.getCurrentStudioId();
        if (request.getStudioId() != null && !request.getStudioId().equals(currentStudioId)) {
            throw new IllegalArgumentException("Mismatched studio ID provided");
        }
        UUID studioId = currentStudioId;

        // Validate studio exists
        if (!studioRepository.existsById(studioId)) {
            throw new IllegalArgumentException("Studio not found with id: " + studioId);
        }

        // Validate project exists and belongs to the same studio
        if (projectRepository.findByIdAndStudioId(request.getProjectId(), studioId).isEmpty()) {
            throw new IllegalArgumentException("Project not found with id: " + request.getProjectId());
        }

        // Validate time range
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        Event event = new Event();
        event.setProjectId(request.getProjectId());
        event.setStudioId(studioId);
        event.setTitle(request.getTitle().trim());
        event.setType(request.getType());
        event.setEventDate(request.getEventDate());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setVenueName(request.getVenueName().trim());
        event.setCity(request.getCity().trim());
        event.setAddress(request.getAddress().trim());
        event.setStatus(request.getStatus() != null ? request.getStatus() : EventStatus.SCHEDULED);
        event.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        Event saved = eventRepository.save(event);
        return EventMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<EventResponse> listEvents(String search, LocalDate fromDate, LocalDate toDate) {
        String trimmedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        List<Event> events;
        UUID studioId = tenantContext.getCurrentStudioId();
        if (fromDate != null && toDate != null) {
            events = eventRepository.searchEventsWithDateRangeByStudio(studioId, trimmedSearch, fromDate, toDate);
        } else if (fromDate != null) {
            events = eventRepository.searchEventsWithFromDateByStudio(studioId, trimmedSearch, fromDate);
        } else if (toDate != null) {
            events = eventRepository.searchEventsWithToDateByStudio(studioId, trimmedSearch, toDate);
        } else {
            events = eventRepository.searchEventsWithoutDatesByStudio(studioId, trimmedSearch);
        }
        return events.stream()
                .map(EventMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public EventResponse getEventById(UUID id) {
        Event event = eventRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        return EventMapper.toResponse(event);
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getEventsByProjectId(UUID projectId) {
        UUID studioId = tenantContext.getCurrentStudioId();
        if (projectRepository.findByIdAndStudioId(projectId, studioId).isEmpty()) {
            throw new ResourceNotFoundException("Project not found with id: " + projectId);
        }
        List<Event> events = eventRepository.findByProjectIdAndStudioId(projectId, studioId);
        return events.stream()
                .map(EventMapper::toResponse)
                .toList();
    }

    public EventResponse updateEvent(UUID id, EventUpdateRequest request) {
        Event event = eventRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        // Validate project exists and belongs to the same studio as the event
        if (projectRepository.findByIdAndStudioId(request.getProjectId(), event.getStudioId()).isEmpty()) {
            throw new IllegalArgumentException("Project not found with id: " + request.getProjectId());
        }

        // Validate time range
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        event.setProjectId(request.getProjectId());
        event.setTitle(request.getTitle().trim());
        event.setType(request.getType());
        event.setEventDate(request.getEventDate());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setVenueName(request.getVenueName().trim());
        event.setCity(request.getCity().trim());
        event.setAddress(request.getAddress().trim());
        event.setStatus(request.getStatus());
        event.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        Event updated = eventRepository.save(event);
        return EventMapper.toResponse(updated);
    }

    public void deleteEvent(UUID id) {
        Event event = eventRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        eventRepository.delete(event);
    }
}
