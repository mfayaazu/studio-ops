package com.studioops.followup.sequence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FollowUpStepRepository extends JpaRepository<FollowUpStep, UUID> {

    Optional<FollowUpStep> findByIdAndStudioId(UUID id, UUID studioId);

    List<FollowUpStep> findBySequenceIdAndStudioIdOrderByStepOrderAsc(UUID sequenceId, UUID studioId);

    boolean existsBySequenceIdAndStepOrder(UUID sequenceId, Integer stepOrder);

    boolean existsBySequenceIdAndStepOrderAndIdNot(UUID sequenceId, Integer stepOrder, UUID id);

    List<FollowUpStep> findAllByStudioId(UUID studioId);

    boolean existsByTemplateId(UUID templateId);
}

