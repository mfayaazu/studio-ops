package com.studioops.assignment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventAssignmentRepository extends JpaRepository<EventAssignment, UUID> {

    Optional<EventAssignment> findByIdAndStudioId(UUID id, UUID studioId);

    List<EventAssignment> findAllByStudioId(UUID studioId);

    List<EventAssignment> findByEventIdAndStudioId(UUID eventId, UUID studioId);

    List<EventAssignment> findByEmployeeIdAndStudioId(UUID employeeId, UUID studioId);

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

    @Query("SELECT ea FROM EventAssignment ea, Event e WHERE ea.eventId = e.id " +
           "AND ea.studioId = :studioId " +
           "AND ea.employeeId = :employeeId " +
           "AND ea.eventId != :eventId " +
           "AND ea.assignmentStatus NOT IN :excludedStatuses " +
           "AND e.eventDate = :eventDate " +
           "AND e.startTime < :endTime " +
           "AND :startTime < e.endTime")
    List<EventAssignment> findOverlappingAssignmentsByStudio(
        @Param("studioId") UUID studioId,
        @Param("employeeId") UUID employeeId,
        @Param("eventId") UUID eventId,
        @Param("eventDate") LocalDate eventDate,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("excludedStatuses") Collection<AssignmentStatus> excludedStatuses
    );
}
