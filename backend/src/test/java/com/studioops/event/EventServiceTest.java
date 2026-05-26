package com.studioops.event;

import com.studioops.common.tenant.TenantContext;
import com.studioops.common.tenant.TenantConstants;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.project.Project;
import com.studioops.project.ProjectRepository;
import com.studioops.studio.StudioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.studioops.event.dto.EventCreateRequest;
import com.studioops.event.dto.EventResponse;
import com.studioops.event.dto.EventUpdateRequest;

class EventServiceTest {
    @Mock
    private TenantContext tenantContext;


    @Mock
    private EventRepository eventRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private StudioRepository studioRepository;

    @InjectMocks
    private EventService eventService;

    private UUID projectId;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(tenantContext.getCurrentStudioId()).thenReturn(TenantConstants.DEFAULT_STUDIO_ID);
        projectId = UUID.randomUUID();
        lenient().when(studioRepository.existsById(any(UUID.class))).thenReturn(true);
    }

    @Test
    void createEvent_Success() {
        EventCreateRequest request = new EventCreateRequest(
                projectId, "Wedding Shoot", EventType.WEDDING, LocalDate.of(2026, 6, 5),
                LocalTime.of(9, 0), LocalTime.of(17, 0), "Grand Ballroom", "Stockholm",
                "Main Street 1", EventStatus.SCHEDULED, "Bring wide lens"
        );

        Project project = new Project();
        project.setId(projectId);
        project.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.of(project));

        Event event = new Event();
        event.setId(UUID.randomUUID());
        event.setProjectId(projectId);
        event.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        event.setTitle(request.getTitle());
        event.setType(request.getType());
        event.setEventDate(request.getEventDate());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setVenueName(request.getVenueName());
        event.setCity(request.getCity());
        event.setAddress(request.getAddress());
        event.setStatus(request.getStatus());
        event.setNotes(request.getNotes());

        when(eventRepository.save(any(Event.class))).thenReturn(event);

        EventResponse response = eventService.createEvent(request);

        assertNotNull(response);
        assertEquals(event.getId(), response.getId());
        assertEquals("Wedding Shoot", response.getTitle());
        assertEquals(EventType.WEDDING, response.getType());
        assertEquals(TenantConstants.DEFAULT_STUDIO_ID, response.getStudioId());
        verify(eventRepository, times(1)).save(any(Event.class));
    }

    @Test
    void createEvent_InvalidProjectId_ThrowsException() {
        EventCreateRequest request = new EventCreateRequest(
                projectId, "Wedding Shoot", EventType.WEDDING, LocalDate.of(2026, 6, 5),
                LocalTime.of(9, 0), LocalTime.of(17, 0), "Grand Ballroom", "Stockholm",
                "Main Street 1", EventStatus.SCHEDULED, "Bring wide lens"
        );

        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.empty());

        Exception exception = assertThrows(IllegalArgumentException.class, () -> eventService.createEvent(request));
        assertTrue(exception.getMessage().contains("Project not found with id"));
        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void createEvent_InvalidStudioId_ThrowsException() {
        UUID customStudioId = UUID.randomUUID();
        when(tenantContext.getCurrentStudioId()).thenReturn(customStudioId);
        EventCreateRequest request = new EventCreateRequest(
                projectId, "Wedding Shoot", EventType.WEDDING, LocalDate.of(2026, 6, 5),
                LocalTime.of(9, 0), LocalTime.of(17, 0), "Grand Ballroom", "Stockholm",
                "Main Street 1", EventStatus.SCHEDULED, "Bring wide lens", customStudioId
        );

        when(studioRepository.existsById(customStudioId)).thenReturn(false);

        Exception exception = assertThrows(IllegalArgumentException.class, () -> eventService.createEvent(request));
        assertTrue(exception.getMessage().contains("Studio not found with id"));
        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void createEvent_ProjectDifferentStudio_ThrowsException() {
        UUID customStudioId = UUID.randomUUID();
        when(tenantContext.getCurrentStudioId()).thenReturn(customStudioId);
        EventCreateRequest request = new EventCreateRequest(
                projectId, "Wedding Shoot", EventType.WEDDING, LocalDate.of(2026, 6, 5),
                LocalTime.of(9, 0), LocalTime.of(17, 0), "Grand Ballroom", "Stockholm",
                "Main Street 1", EventStatus.SCHEDULED, "Bring wide lens", customStudioId
        );

        when(studioRepository.existsById(customStudioId)).thenReturn(true);
        when(projectRepository.findByIdAndStudioId(projectId, customStudioId))
                .thenReturn(Optional.empty());

        Exception exception = assertThrows(IllegalArgumentException.class, () -> eventService.createEvent(request));
        assertTrue(exception.getMessage().contains("Project not found with id"));
        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void createEvent_InvalidTimeRange_ThrowsException() {
        EventCreateRequest request = new EventCreateRequest(
                projectId, "Wedding Shoot", EventType.WEDDING, LocalDate.of(2026, 6, 5),
                LocalTime.of(17, 0), LocalTime.of(9, 0), "Grand Ballroom", "Stockholm",
                "Main Street 1", EventStatus.SCHEDULED, "Bring wide lens"
        );

        Project project = new Project();
        project.setId(projectId);
        project.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.of(project));

        Exception exception = assertThrows(IllegalArgumentException.class, () -> eventService.createEvent(request));
        assertTrue(exception.getMessage().contains("Start time must be before end time"));
        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void createEvent_DefaultStatus_Success() {
        EventCreateRequest request = new EventCreateRequest(
                projectId, "Wedding Shoot", EventType.WEDDING, LocalDate.of(2026, 6, 5),
                LocalTime.of(9, 0), LocalTime.of(17, 0), "Grand Ballroom", "Stockholm",
                "Main Street 1", null, "Bring wide lens"
        );

        Project project = new Project();
        project.setId(projectId);
        project.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.of(project));

        Event event = new Event();
        event.setId(UUID.randomUUID());
        event.setProjectId(projectId);
        event.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        event.setTitle(request.getTitle());
        event.setType(request.getType());
        event.setEventDate(request.getEventDate());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setVenueName(request.getVenueName());
        event.setCity(request.getCity());
        event.setAddress(request.getAddress());
        event.setStatus(EventStatus.SCHEDULED); // Defaulted

        when(eventRepository.save(any(Event.class))).thenReturn(event);

        EventResponse response = eventService.createEvent(request);

        assertNotNull(response);
        assertEquals(EventStatus.SCHEDULED, response.getStatus());
    }

    @Test
    void getEventById_Success() {
        UUID id = UUID.randomUUID();
        Event event = new Event();
        event.setId(id);
        event.setTitle("Wedding");
        event.setProjectId(projectId);
        event.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(eventRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(event));

        EventResponse response = eventService.getEventById(id);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals("Wedding", response.getTitle());
    }

    @Test
    void getEventById_NotFound_ThrowsException() {
        UUID id = UUID.randomUUID();
        when(eventRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> eventService.getEventById(id));
    }

    @Test
    void getEventsByProjectId_Success() {
        Event e1 = new Event();
        e1.setProjectId(projectId);
        e1.setTitle("Wedding");
        e1.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        Event e2 = new Event();
        e2.setProjectId(projectId);
        e2.setTitle("Engagement");
        e2.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        Project project = new Project();
        project.setId(projectId);
        project.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.of(project));
        when(eventRepository.findByProjectIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(List.of(e1, e2));

        List<EventResponse> responses = eventService.getEventsByProjectId(projectId);

        assertEquals(2, responses.size());
        verify(eventRepository, times(1)).findByProjectIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID);
    }

    @Test
    void getEventsByProjectId_NotFound_ThrowsException() {
        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> eventService.getEventsByProjectId(projectId));
    }

    @Test
    void updateEvent_Success() {
        UUID id = UUID.randomUUID();
        Event event = new Event();
        event.setId(id);
        event.setProjectId(projectId);
        event.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        event.setTitle("Wedding Shoot");

        EventUpdateRequest request = new EventUpdateRequest(
                projectId, "Wedding Shoot Updated", EventType.WEDDING, LocalDate.of(2026, 6, 5),
                LocalTime.of(10, 0), LocalTime.of(18, 0), "Grand Ballroom 2", "Stockholm",
                "Main Street 2", EventStatus.COMPLETED, "Updated notes"
        );

        when(eventRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(event));
        Project project = new Project();
        project.setId(projectId);
        project.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.of(project));
        when(eventRepository.save(any(Event.class))).thenReturn(event);

        EventResponse response = eventService.updateEvent(id, request);

        assertNotNull(response);
        assertEquals("Wedding Shoot Updated", response.getTitle());
        assertEquals(LocalTime.of(10, 0), response.getStartTime());
        assertEquals(EventStatus.COMPLETED, response.getStatus());
    }

    @Test
    void updateEvent_InvalidProjectId_ThrowsException() {
        UUID id = UUID.randomUUID();
        Event event = new Event();
        event.setId(id);
        event.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        EventUpdateRequest request = new EventUpdateRequest(
                projectId, "Wedding Shoot", EventType.WEDDING, LocalDate.of(2026, 6, 5),
                LocalTime.of(10, 0), LocalTime.of(18, 0), "Grand Ballroom 2", "Stockholm",
                "Main Street 2", EventStatus.COMPLETED, "Updated notes"
        );

        when(eventRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(event));
        when(projectRepository.findByIdAndStudioId(projectId, TenantConstants.DEFAULT_STUDIO_ID))
                .thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> eventService.updateEvent(id, request));
    }

    @Test
    void deleteEvent_Success() {
        UUID id = UUID.randomUUID();
        Event event = new Event();
        event.setId(id);
        event.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(eventRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(event));
        doNothing().when(eventRepository).delete(event);

        assertDoesNotThrow(() -> eventService.deleteEvent(id));
        verify(eventRepository, times(1)).delete(event);
    }

    @Test
    void deleteEvent_NotFound_ThrowsException() {
        UUID id = UUID.randomUUID();
        when(eventRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> eventService.deleteEvent(id));
    }

    @Test
    void listEvents_NoDateFilters() {
        Event e1 = new Event();
        e1.setTitle("Wedding 1");
        e1.setEventDate(LocalDate.of(2026, 6, 5));
        e1.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(eventRepository.searchEventsWithoutDatesByStudio(TenantConstants.DEFAULT_STUDIO_ID, "Wedding"))
                .thenReturn(List.of(e1));

        List<EventResponse> responses = eventService.listEvents("Wedding", null, null);

        assertEquals(1, responses.size());
        assertEquals("Wedding 1", responses.get(0).getTitle());
        verify(eventRepository, times(1)).searchEventsWithoutDatesByStudio(TenantConstants.DEFAULT_STUDIO_ID, "Wedding");
    }

    @Test
    void listEvents_FromDateOnly() {
        Event e1 = new Event();
        e1.setTitle("Wedding 1");
        e1.setEventDate(LocalDate.of(2026, 6, 5));
        e1.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        LocalDate fromDate = LocalDate.of(2026, 6, 1);

        when(eventRepository.searchEventsWithFromDateByStudio(TenantConstants.DEFAULT_STUDIO_ID, "Wedding", fromDate))
                .thenReturn(List.of(e1));

        List<EventResponse> responses = eventService.listEvents("Wedding", fromDate, null);

        assertEquals(1, responses.size());
        assertEquals("Wedding 1", responses.get(0).getTitle());
        verify(eventRepository, times(1)).searchEventsWithFromDateByStudio(TenantConstants.DEFAULT_STUDIO_ID, "Wedding", fromDate);
    }

    @Test
    void listEvents_ToDateOnly() {
        Event e1 = new Event();
        e1.setTitle("Wedding 1");
        e1.setEventDate(LocalDate.of(2026, 6, 5));
        e1.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        LocalDate toDate = LocalDate.of(2026, 6, 10);

        when(eventRepository.searchEventsWithToDateByStudio(TenantConstants.DEFAULT_STUDIO_ID, "Wedding", toDate))
                .thenReturn(List.of(e1));

        List<EventResponse> responses = eventService.listEvents("Wedding", null, toDate);

        assertEquals(1, responses.size());
        assertEquals("Wedding 1", responses.get(0).getTitle());
        verify(eventRepository, times(1)).searchEventsWithToDateByStudio(TenantConstants.DEFAULT_STUDIO_ID, "Wedding", toDate);
    }

    @Test
    void listEvents_BothDates() {
        Event e1 = new Event();
        e1.setTitle("Wedding 1");
        e1.setEventDate(LocalDate.of(2026, 6, 5));
        e1.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        LocalDate fromDate = LocalDate.of(2026, 6, 1);
        LocalDate toDate = LocalDate.of(2026, 6, 10);

        when(eventRepository.searchEventsWithDateRangeByStudio(TenantConstants.DEFAULT_STUDIO_ID, "Wedding", fromDate, toDate))
                .thenReturn(List.of(e1));

        List<EventResponse> responses = eventService.listEvents("Wedding", fromDate, toDate);

        assertEquals(1, responses.size());
        assertEquals("Wedding 1", responses.get(0).getTitle());
        verify(eventRepository, times(1)).searchEventsWithDateRangeByStudio(TenantConstants.DEFAULT_STUDIO_ID, "Wedding", fromDate, toDate);
    }

    @Test
    void listEvents_SearchAndDateRange() {
        Event e1 = new Event();
        e1.setTitle("Engagement 1");
        e1.setEventDate(LocalDate.of(2026, 6, 5));
        e1.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        LocalDate fromDate = LocalDate.of(2026, 6, 1);
        LocalDate toDate = LocalDate.of(2026, 6, 10);

        when(eventRepository.searchEventsWithDateRangeByStudio(TenantConstants.DEFAULT_STUDIO_ID, "Engagement", fromDate, toDate))
                .thenReturn(List.of(e1));

        List<EventResponse> responses = eventService.listEvents("Engagement", fromDate, toDate);

        assertEquals(1, responses.size());
        assertEquals("Engagement 1", responses.get(0).getTitle());
        verify(eventRepository, times(1)).searchEventsWithDateRangeByStudio(TenantConstants.DEFAULT_STUDIO_ID, "Engagement", fromDate, toDate);
    }
}
