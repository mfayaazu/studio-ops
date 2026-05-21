package com.studioops.event;

public class EventMapper {

    public static EventResponse toResponse(Event event) {
        if (event == null) {
            return null;
        }
        return new EventResponse(
            event.getId(),
            event.getProjectId(),
            event.getTitle(),
            event.getType(),
            event.getEventDate(),
            event.getStartTime(),
            event.getEndTime(),
            event.getVenueName(),
            event.getCity(),
            event.getAddress(),
            event.getStatus(),
            event.getNotes(),
            event.getCreatedAt(),
            event.getUpdatedAt()
        );
    }
}
