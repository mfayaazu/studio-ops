package com.studioops.deliverable;
import com.studioops.deliverable.dto.DeliverableCreateRequest;
import com.studioops.deliverable.dto.DeliverableResponse;
import com.studioops.deliverable.dto.DeliverableUpdateRequest;

public class DeliverableMapper {

    public static Deliverable toEntity(DeliverableCreateRequest request) {
        Deliverable deliverable = new Deliverable();
        deliverable.setProjectId(request.getProjectId());
        deliverable.setName(request.getName());
        deliverable.setDeliverableType(request.getDeliverableType());
        deliverable.setStatus(request.getStatus());
        deliverable.setPriority(request.getPriority() != null ? request.getPriority() : DeliverablePriority.MEDIUM);
        deliverable.setAssignedEmployeeId(request.getAssignedEmployeeId());
        deliverable.setReferenceUrl(request.getReferenceUrl());
        deliverable.setDueDate(request.getDueDate());
        return deliverable;
    }

    public static DeliverableResponse toResponse(Deliverable entity) {
        DeliverableResponse response = new DeliverableResponse();
        response.setId(entity.getId());
        response.setProjectId(entity.getProjectId());
        response.setStudioId(entity.getStudioId());
        response.setName(entity.getName());
        response.setDeliverableType(entity.getDeliverableType());
        response.setStatus(entity.getStatus());
        response.setPriority(entity.getPriority());
        response.setAssignedEmployeeId(entity.getAssignedEmployeeId());
        response.setReferenceUrl(entity.getReferenceUrl());
        response.setDueDate(entity.getDueDate());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }

    public static void updateEntity(Deliverable entity, DeliverableUpdateRequest request) {
        entity.setName(request.getName());
        entity.setDeliverableType(request.getDeliverableType());
        entity.setStatus(request.getStatus());
        if (request.getPriority() != null) {
            entity.setPriority(request.getPriority());
        }
        entity.setAssignedEmployeeId(request.getAssignedEmployeeId());
        entity.setReferenceUrl(request.getReferenceUrl());
        entity.setDueDate(request.getDueDate());
    }
}
