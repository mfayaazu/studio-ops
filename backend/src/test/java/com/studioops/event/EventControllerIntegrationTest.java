package com.studioops.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studioops.config.SecurityConfig;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.studioops.event.dto.EventCreateRequest;
import com.studioops.event.dto.EventResponse;
import com.studioops.event.dto.EventUpdateRequest;

@WebMvcTest(EventController.class)
@Import(SecurityConfig.class)
class EventControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EventService eventService;

    @Test
    void createEvent_Success() throws Exception {
        UUID projectId = UUID.randomUUID();
        UUID studioId = TenantConstants.DEFAULT_STUDIO_ID;
        EventCreateRequest request = new EventCreateRequest(
                projectId, "Wedding Day 1", EventType.WEDDING, LocalDate.of(2026, 6, 5),
                LocalTime.of(9, 0), LocalTime.of(17, 0), "Grand Palace", "Gothenburg",
                "Storgatan 1", EventStatus.SCHEDULED, "Main event"
        );

        EventResponse response = new EventResponse(
                UUID.randomUUID(), projectId, "Wedding Day 1", EventType.WEDDING, LocalDate.of(2026, 6, 5),
                LocalTime.of(9, 0), LocalTime.of(17, 0), "Grand Palace", "Gothenburg",
                "Storgatan 1", EventStatus.SCHEDULED, "Main event", Instant.now(), Instant.now(),
                studioId
        );

        when(eventService.createEvent(any(EventCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(response.getId().toString()))
                .andExpect(jsonPath("$.title").value("Wedding Day 1"))
                .andExpect(jsonPath("$.type").value("WEDDING"))
                .andExpect(jsonPath("$.studioId").value(studioId.toString()));
    }

    @Test
    void createEvent_InvalidPayload_BadRequest() throws Exception {
        EventCreateRequest request = new EventCreateRequest(
                null, "", null, null, null, null, "", "", "", null, null
        );

        mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.projectId").exists())
                .andExpect(jsonPath("$.errors.title").exists())
                .andExpect(jsonPath("$.errors.type").exists())
                .andExpect(jsonPath("$.errors.eventDate").exists())
                .andExpect(jsonPath("$.errors.startTime").exists())
                .andExpect(jsonPath("$.errors.endTime").exists())
                .andExpect(jsonPath("$.errors.venueName").exists())
                .andExpect(jsonPath("$.errors.city").exists())
                .andExpect(jsonPath("$.errors.address").exists());

        verify(eventService, never()).createEvent(any(EventCreateRequest.class));
    }

    @Test
    void getEventById_Success() throws Exception {
        UUID id = UUID.randomUUID();
        UUID projectId = UUID.randomUUID();
        UUID studioId = TenantConstants.DEFAULT_STUDIO_ID;
        EventResponse response = new EventResponse(
                id, projectId, "Wedding Day 1", EventType.WEDDING, LocalDate.of(2026, 6, 5),
                LocalTime.of(9, 0), LocalTime.of(17, 0), "Grand Palace", "Gothenburg",
                "Storgatan 1", EventStatus.SCHEDULED, null, Instant.now(), Instant.now(),
                studioId
        );

        when(eventService.getEventById(id)).thenReturn(response);

        mockMvc.perform(get("/api/events/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.title").value("Wedding Day 1"))
                .andExpect(jsonPath("$.studioId").value(studioId.toString()));
    }

    @Test
    void getEventById_NotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(eventService.getEventById(id)).thenThrow(new ResourceNotFoundException("Event not found"));

        mockMvc.perform(get("/api/events/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void getEventsByProjectId_Success() throws Exception {
        UUID projectId = UUID.randomUUID();
        UUID studioId = TenantConstants.DEFAULT_STUDIO_ID;
        EventResponse response = new EventResponse(
                UUID.randomUUID(), projectId, "Wedding Day 1", EventType.WEDDING, LocalDate.of(2026, 6, 5),
                LocalTime.of(9, 0), LocalTime.of(17, 0), "Grand Palace", "Gothenburg",
                "Storgatan 1", EventStatus.SCHEDULED, null, Instant.now(), Instant.now(),
                studioId
        );

        when(eventService.getEventsByProjectId(projectId)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/projects/{projectId}/events", projectId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].projectId").value(projectId.toString()))
                .andExpect(jsonPath("$[0].title").value("Wedding Day 1"))
                .andExpect(jsonPath("$[0].studioId").value(studioId.toString()));
    }

    @Test
    void listEvents_Success() throws Exception {
        UUID studioId = TenantConstants.DEFAULT_STUDIO_ID;
        EventResponse response = new EventResponse(
                UUID.randomUUID(), UUID.randomUUID(), "Wedding Day 1", EventType.WEDDING, LocalDate.of(2026, 6, 5),
                LocalTime.of(9, 0), LocalTime.of(17, 0), "Grand Palace", "Gothenburg",
                "Storgatan 1", EventStatus.SCHEDULED, null, Instant.now(), Instant.now(),
                studioId
        );

        when(eventService.listEvents("Wedding", LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 10)))
                .thenReturn(List.of(response));

        mockMvc.perform(get("/api/events")
                .param("search", "Wedding")
                .param("fromDate", "2026-06-01")
                .param("toDate", "2026-06-10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Wedding Day 1"))
                .andExpect(jsonPath("$[0].studioId").value(studioId.toString()));
    }

    @Test
    void updateEvent_Success() throws Exception {
        UUID id = UUID.randomUUID();
        UUID projectId = UUID.randomUUID();
        UUID studioId = TenantConstants.DEFAULT_STUDIO_ID;
        EventUpdateRequest request = new EventUpdateRequest(
                projectId, "Wedding Day 1 Updated", EventType.WEDDING, LocalDate.of(2026, 6, 5),
                LocalTime.of(10, 0), LocalTime.of(18, 0), "Grand Palace 2", "Gothenburg",
                "Storgatan 2", EventStatus.COMPLETED, "Some notes"
        );

        EventResponse response = new EventResponse(
                id, projectId, "Wedding Day 1 Updated", EventType.WEDDING, LocalDate.of(2026, 6, 5),
                LocalTime.of(10, 0), LocalTime.of(18, 0), "Grand Palace 2", "Gothenburg",
                "Storgatan 2", EventStatus.COMPLETED, "Some notes", Instant.now(), Instant.now(),
                studioId
        );

        when(eventService.updateEvent(eq(id), any(EventUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/events/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Wedding Day 1 Updated"))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.studioId").value(studioId.toString()));
    }

    @Test
    void deleteEvent_Success() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(eventService).deleteEvent(id);

        mockMvc.perform(delete("/api/events/{id}", id))
                .andExpect(status().isNoContent());

        verify(eventService, times(1)).deleteEvent(id);
    }
}
