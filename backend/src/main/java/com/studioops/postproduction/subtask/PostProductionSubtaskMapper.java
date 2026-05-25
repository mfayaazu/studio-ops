package com.studioops.postproduction.subtask;

import com.studioops.postproduction.subtask.dto.PostProductionSubtaskCreateRequest;
import com.studioops.postproduction.subtask.dto.PostProductionSubtaskResponse;
import com.studioops.postproduction.subtask.dto.PostProductionSubtaskUpdateRequest;

public class PostProductionSubtaskMapper {

    public static PostProductionSubtask toEntity(PostProductionSubtaskCreateRequest request) {
        if (request == null) {
            return null;
        }
        PostProductionSubtask subtask = new PostProductionSubtask();
        subtask.setTaskId(request.getTaskId());
        subtask.setTitle(request.getTitle());
        subtask.setDescription(request.getDescription());
        subtask.setStatus(request.getStatus() != null ? request.getStatus() : PostProductionSubtaskStatus.TODO);
        subtask.setAssignedEmployeeId(request.getAssignedEmployeeId());
        subtask.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        return subtask;
    }

    public static PostProductionSubtaskResponse toResponse(PostProductionSubtask entity) {
        if (entity == null) {
            return null;
        }
        PostProductionSubtaskResponse response = new PostProductionSubtaskResponse();
        response.setId(entity.getId());
        response.setStudioId(entity.getStudioId());
        response.setTaskId(entity.getTaskId());
        response.setTitle(entity.getTitle());
        response.setDescription(entity.getDescription());
        response.setStatus(entity.getStatus());
        response.setAssignedEmployeeId(entity.getAssignedEmployeeId());
        response.setSortOrder(entity.getSortOrder());
        response.setCompletedAt(entity.getCompletedAt());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }

    public static void updateEntity(PostProductionSubtask entity, PostProductionSubtaskUpdateRequest request) {
        if (entity == null || request == null) {
            return;
        }
        entity.setTitle(request.getTitle());
        entity.setDescription(request.getDescription());
        entity.setStatus(request.getStatus());
        entity.setAssignedEmployeeId(request.getAssignedEmployeeId());
        if (request.getSortOrder() != null) {
            entity.setSortOrder(request.getSortOrder());
        }
    }
}
