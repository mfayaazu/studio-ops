package com.studioops.followup.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FollowUpTaskRepository extends JpaRepository<FollowUpTask, UUID> {

    Optional<FollowUpTask> findByIdAndStudioId(UUID id, UUID studioId);

    List<FollowUpTask> findAllByStudioId(UUID studioId);

    List<FollowUpTask> findByStudioIdAndStatus(UUID studioId, FollowUpTaskStatus status);

    List<FollowUpTask> findByStudioIdAndScheduledAtLessThanEqualAndStatus(UUID studioId, Instant scheduledAt, FollowUpTaskStatus status);

    List<FollowUpTask> findByProjectIdAndStudioId(UUID projectId, UUID studioId);

    List<FollowUpTask> findByClientIdAndStudioId(UUID clientId, UUID studioId);
}
