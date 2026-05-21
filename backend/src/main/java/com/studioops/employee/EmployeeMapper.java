package com.studioops.employee;

import com.studioops.employee.dto.EmployeeResponse;

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
        response.setCreatedAt(employee.getCreatedAt());
        response.setUpdatedAt(employee.getUpdatedAt());
        return response;
    }
}
