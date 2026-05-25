package com.studioops.postproduction.task;

import com.studioops.postproduction.task.dto.PostProductionTaskCreateRequest;
import com.studioops.postproduction.task.dto.PostProductionTaskResponse;
import com.studioops.postproduction.task.dto.PostProductionTaskUpdateRequest;

public class PostProductionTaskMapper {

    public static PostProductionTask toEntity(PostProductionTaskCreateRequest request) {
        if (request == null) {
            return null;
        }
        PostProductionTask task = new PostProductionTask();
        task.setProjectId(request.getProjectId());
        task.setDeliverableId(request.getDeliverableId());
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setTaskType(request.getTaskType());
        task.setPriority(request.getPriority() != null ? request.getPriority() : PostProductionTaskPriority.MEDIUM);
        task.setStatus(request.getStatus() != null ? request.getStatus() : PostProductionTaskStatus.TODO);
        task.setAssignedEmployeeId(request.getAssignedEmployeeId());
        task.setDueDate(request.getDueDate());
        task.setEstimatedHours(request.getEstimatedHours());
        task.setActualHours(request.getActualHours());
        task.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        return task;
    }

    public static PostProductionTaskResponse toResponse(PostProductionTask entity) {
        if (entity == null) {
            return null;
        }
        PostProductionTaskResponse response = new PostProductionTaskResponse();
        response.setId(entity.getId());
        response.setStudioId(entity.getStudioId());
        response.setProjectId(entity.getProjectId());
        response.setDeliverableId(entity.getDeliverableId());
        response.setTitle(entity.getTitle());
        response.setDescription(entity.getDescription());
        response.setTaskType(entity.getTaskType());
        response.setPriority(entity.getPriority());
        response.setStatus(entity.getStatus());
        response.setAssignedEmployeeId(entity.getAssignedEmployeeId());
        response.setDueDate(entity.getDueDate());
        response.setEstimatedHours(entity.getEstimatedHours());
        response.setActualHours(entity.getActualHours());
        response.setSortOrder(entity.getSortOrder());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }

    public static void updateEntity(PostProductionTask entity, PostProductionTaskUpdateRequest request) {
        if (entity == null || request == null) {
            return;
        }
        entity.setTitle(request.getTitle());
        entity.setDescription(request.getDescription());
        entity.setTaskType(request.getTaskType());
        entity.setPriority(request.getPriority());
        entity.setStatus(request.getStatus());
        entity.setAssignedEmployeeId(request.getAssignedEmployeeId());
        entity.setDueDate(request.getDueDate());
        entity.setEstimatedHours(request.getEstimatedHours());
        entity.setActualHours(request.getActualHours());
        if (request.getSortOrder() != null) {
            entity.setSortOrder(request.getSortOrder());
        }
    }
}
