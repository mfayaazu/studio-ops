package com.studioops.postproduction.subtask;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostProductionSubtaskRepository extends JpaRepository<PostProductionSubtask, UUID> {

    Optional<PostProductionSubtask> findByIdAndStudioId(UUID id, UUID studioId);

    List<PostProductionSubtask> findAllByStudioId(UUID studioId);

    List<PostProductionSubtask> findByStudioIdAndTaskIdOrderBySortOrderAsc(UUID studioId, UUID taskId);

    List<PostProductionSubtask> findByStudioIdAndStatus(UUID studioId, PostProductionSubtaskStatus status);

    List<PostProductionSubtask> findByStudioIdAndAssignedEmployeeId(UUID studioId, UUID assignedEmployeeId);

    @Query("SELECT s FROM PostProductionSubtask s WHERE s.studioId = :studioId " +
           "AND (:taskId IS NULL OR s.taskId = :taskId) " +
           "AND (:status IS NULL OR s.status = :status) " +
           "AND (:assignedEmployeeId IS NULL OR s.assignedEmployeeId = :assignedEmployeeId) " +
           "ORDER BY s.sortOrder ASC")
    List<PostProductionSubtask> filterSubtasks(
            @Param("studioId") UUID studioId,
            @Param("taskId") UUID taskId,
            @Param("status") PostProductionSubtaskStatus status,
            @Param("assignedEmployeeId") UUID assignedEmployeeId
    );
}
