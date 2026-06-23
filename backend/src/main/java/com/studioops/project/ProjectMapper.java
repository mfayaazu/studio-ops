package com.studioops.project;

import com.studioops.project.dto.ProjectResponse;

public class ProjectMapper {

    public static ProjectResponse toResponse(Project project) {
        if (project == null) {
            return null;
        }
        ProjectResponse response = new ProjectResponse();
        response.setId(project.getId());
        response.setClientId(project.getClientId());
        response.setAssignedProjectManagerId(project.getAssignedProjectManagerId());
        response.setProjectCode(project.getProjectCode());
        response.setTitle(project.getTitle());
        response.setProjectType(project.getProjectType());
        response.setBookingStatus(project.getBookingStatus());
        response.setPaymentStatus(project.getPaymentStatus());
        response.setStatus(project.getStatus());
        response.setStartDate(project.getStartDate());
        response.setEndDate(project.getEndDate());
        response.setNotes(project.getNotes());
        response.setCreatedAt(project.getCreatedAt());
        response.setUpdatedAt(project.getUpdatedAt());
        response.setStudioId(project.getStudioId());
        
        response.setProjectSubtype(project.getProjectSubtype());
        response.setProjectEvents(project.getProjectEvents());
        response.setProjectBudget(project.getProjectBudget());
        response.setAmountPaid(project.getAmountPaid());
        response.setShootLocation(project.getShootLocation());
        response.setGoogleMapsLink(project.getGoogleMapsLink());
        response.setShootDate(project.getShootDate());
        response.setShootStartTime(project.getShootStartTime());
        response.setShootEndTime(project.getShootEndTime());
        response.setPriority(project.getPriority());
        response.setLeadSource(project.getLeadSource());
        return response;
    }
}
