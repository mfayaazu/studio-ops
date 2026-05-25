package com.studioops.lead;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeadRepository extends JpaRepository<Lead, UUID> {

    Optional<Lead> findByIdAndStudioId(UUID id, UUID studioId);

    List<Lead> findAllByStudioId(UUID studioId);

    List<Lead> findByStudioIdAndPipelineStage(UUID studioId, LeadPipelineStage pipelineStage);

    List<Lead> findByStudioIdAndLeadSource(UUID studioId, LeadSource leadSource);

    List<Lead> findByStudioIdAndNextFollowUpAtLessThanEqual(UUID studioId, Instant nextFollowUpAt);

    @Query("SELECT l FROM Lead l WHERE l.studioId = :studioId AND (" +
           "LOWER(l.clientName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(l.phone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(l.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(l.eventType) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(l.city) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(l.notes) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(STR(l.preferredChannel)) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(STR(l.leadSource)) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(STR(l.pipelineStage)) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Lead> searchByStudioId(@Param("studioId") UUID studioId, @Param("search") String search);
}
