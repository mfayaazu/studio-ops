package com.studioops.postproduction.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostProductionTaskRepository extends JpaRepository<PostProductionTask, UUID> {

    Optional<PostProductionTask> findByIdAndStudioId(UUID id, UUID studioId);

    List<PostProductionTask> findAllByStudioId(UUID studioId);

    List<PostProductionTask> findByStudioIdAndProjectId(UUID studioId, UUID projectId);

    List<PostProductionTask> findByStudioIdAndDeliverableId(UUID studioId, UUID deliverableId);

    List<PostProductionTask> findByStudioIdAndStatus(UUID studioId, PostProductionTaskStatus status);

    List<PostProductionTask> findByStudioIdAndAssignedEmployeeId(UUID studioId, UUID assignedEmployeeId);

    List<PostProductionTask> findByStudioIdAndDueDateLessThanEqual(UUID studioId, LocalDate dueDate);

    @Query("SELECT t FROM PostProductionTask t WHERE t.studioId = :studioId " +
           "AND (:projectId IS NULL OR t.projectId = :projectId) " +
           "AND (:deliverableId IS NULL OR t.deliverableId = :deliverableId) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:assignedEmployeeId IS NULL OR t.assignedEmployeeId = :assignedEmployeeId) " +
           "AND (:dueBefore IS NULL OR t.dueDate <= :dueBefore) " +
           "AND (:search IS NULL OR LOWER(t.title) LIKE :search " +
           "OR (t.description IS NOT NULL AND LOWER(t.description) LIKE :search) " +
           "OR LOWER(STR(t.taskType)) LIKE :search " +
           "OR LOWER(STR(t.priority)) LIKE :search " +
           "OR LOWER(STR(t.status)) LIKE :search)")
    List<PostProductionTask> filterTasks(
            @Param("studioId") UUID studioId,
            @Param("projectId") UUID projectId,
            @Param("deliverableId") UUID deliverableId,
            @Param("status") PostProductionTaskStatus status,
            @Param("assignedEmployeeId") UUID assignedEmployeeId,
            @Param("dueBefore") LocalDate dueBefore,
            @Param("search") String search
    );
}
