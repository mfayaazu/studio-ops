package com.studioops.event;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {

    List<Event> findByProjectId(UUID projectId);

    @Query("SELECT e FROM Event e WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(e.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(STR(e.type)) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.venueName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.city) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.address) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(STR(e.status)) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:fromDate IS NULL OR e.eventDate >= :fromDate) AND " +
           "(:toDate IS NULL OR e.eventDate <= :toDate)")
    List<Event> searchEvents(@Param("search") String search, 
                             @Param("fromDate") LocalDate fromDate, 
                             @Param("toDate") LocalDate toDate);

    long countByStatusAndEventDateGreaterThanEqual(EventStatus status, LocalDate date);
}
