package com.studioops.employee;

import com.studioops.employee.dto.EmployeeResponse;
import com.studioops.user.User;

public class EmployeeMapper {

    public static EmployeeResponse toResponse(Employee employee) {
        if (employee == null) {
            return null;
        }
        EmployeeResponse response = new EmployeeResponse();
        response.setId(employee.getId());
        response.setUserId(employee.getUserId());
        response.setFullName(employee.getFullName());
        response.setEmail(employee.getEmail());
        response.setPhone(employee.getPhone());
        response.setPrimaryRole(employee.getPrimaryRole());
        response.setSkills(employee.getSkills());
        response.setStatus(employee.getStatus());
        response.setLeaveFromDate(employee.getLeaveFromDate());
        response.setLeaveToDate(employee.getLeaveToDate());
        response.setCreatedAt(employee.getCreatedAt());
        response.setUpdatedAt(employee.getUpdatedAt());
        response.setStudioId(employee.getStudioId());
        return response;
    }

    public static EmployeeResponse toResponse(Employee employee, User user) {
        EmployeeResponse response = toResponse(employee);
        if (response != null && user != null) {
            response.setLoginEmail(user.getEmail());
            response.setUserRole(user.getRole().name());
            response.setLoginEnabled(true);
        } else if (response != null) {
            response.setLoginEnabled(false);
        }
        return response;
    }
}
