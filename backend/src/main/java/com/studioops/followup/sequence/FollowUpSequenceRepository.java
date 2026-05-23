package com.studioops.followup.sequence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FollowUpSequenceRepository extends JpaRepository<FollowUpSequence, UUID> {

    Optional<FollowUpSequence> findByIdAndStudioId(UUID id, UUID studioId);

    List<FollowUpSequence> findAllByStudioId(UUID studioId);

    @Query("SELECT s FROM FollowUpSequence s WHERE s.studioId = :studioId AND (" +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<FollowUpSequence> searchByStudioId(@Param("studioId") UUID studioId, @Param("search") String search);

    boolean existsByStudioIdAndNameIgnoreCase(UUID studioId, String name);

    boolean existsByStudioIdAndNameIgnoreCaseAndIdNot(UUID studioId, String name, UUID id);
}
