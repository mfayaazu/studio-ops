package com.studioops.assignment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface EventAssignmentRepository extends JpaRepository<EventAssignment, UUID> {

    List<EventAssignment> findByEventId(UUID eventId);

    List<EventAssignment> findByEmployeeId(UUID employeeId);

    @Query("SELECT ea FROM EventAssignment ea, Event e WHERE ea.eventId = e.id " +
           "AND ea.employeeId = :employeeId " +
           "AND ea.eventId != :eventId " +
           "AND ea.assignmentStatus NOT IN :excludedStatuses " +
           "AND e.eventDate = :eventDate " +
           "AND e.startTime < :endTime " +
           "AND :startTime < e.endTime")
    List<EventAssignment> findOverlappingAssignments(
        @Param("employeeId") UUID employeeId,
        @Param("eventId") UUID eventId,
        @Param("eventDate") LocalDate eventDate,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("excludedStatuses") Collection<AssignmentStatus> excludedStatuses
    );
}
