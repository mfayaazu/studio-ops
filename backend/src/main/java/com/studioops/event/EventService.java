package com.studioops.event;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
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

    public EventService(EventRepository eventRepository, ProjectRepository projectRepository, StudioRepository studioRepository) {
        this.eventRepository = eventRepository;
        this.projectRepository = projectRepository;
        this.studioRepository = studioRepository;
    }

    public EventResponse createEvent(EventCreateRequest request) {
        UUID studioId = request.getStudioId() != null ? request.getStudioId() : TenantConstants.DEFAULT_STUDIO_ID;

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
        if (fromDate != null && toDate != null) {
            events = eventRepository.searchEventsWithDateRangeByStudio(TenantConstants.DEFAULT_STUDIO_ID, trimmedSearch, fromDate, toDate);
        } else if (fromDate != null) {
            events = eventRepository.searchEventsWithFromDateByStudio(TenantConstants.DEFAULT_STUDIO_ID, trimmedSearch, fromDate);
        } else if (toDate != null) {
            events = eventRepository.searchEventsWithToDateByStudio(TenantConstants.DEFAULT_STUDIO_ID, trimmedSearch, toDate);
        } else {
            events = eventRepository.searchEventsWithoutDatesByStudio(TenantConstants.DEFAULT_STUDIO_ID, trimmedSearch);
        }
        return events.stream()
                .map(EventMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public EventResponse getEventById(UUID id) {
        Event event = eventRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        return EventMapper.toResponse(event);
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getEventsByProjectId(UUID projectId) {
        if (projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID).isEmpty()) {
            throw new ResourceNotFoundException("Project not found with id: " + projectId);
        }
        List<Event> events = eventRepository.findByProjectIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID);
        return events.stream()
                .map(EventMapper::toResponse)
                .toList();
    }

    public EventResponse updateEvent(UUID id, EventUpdateRequest request) {
        Event event = eventRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)
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
        Event event = eventRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        eventRepository.delete(event);
    }
}
