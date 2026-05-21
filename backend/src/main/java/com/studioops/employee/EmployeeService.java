package com.studioops.employee;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.employee.dto.EmployeeCreateRequest;
import com.studioops.employee.dto.EmployeeResponse;
import com.studioops.employee.dto.EmployeeUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public EmployeeResponse createEmployee(EmployeeCreateRequest request) {
        String trimmedEmail = request.getEmail().trim().toLowerCase();
        if (employeeRepository.findByEmail(trimmedEmail).isPresent()) {
            throw new IllegalArgumentException("Email is already in use");
        }

        Employee employee = new Employee();
        employee.setUserId(request.getUserId());
        employee.setFullName(request.getFullName().trim());
        employee.setEmail(trimmedEmail);
        employee.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        employee.setPrimaryRole(request.getPrimaryRole().trim());
        employee.setSkills(request.getSkills() != null ? request.getSkills().trim() : null);
        
        EmployeeStatus status = request.getStatus();
        if (status == null) {
            status = EmployeeStatus.ACTIVE;
        }
        employee.setStatus(status);

        Employee saved = employeeRepository.save(employee);
        return EmployeeMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> listEmployees(String search) {
        List<Employee> employees;
        if (search == null || search.trim().isEmpty()) {
            employees = employeeRepository.findAll();
        } else {
            employees = employeeRepository.searchEmployees(search.trim());
        }
        return employees.stream()
                .map(EmployeeMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(UUID id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return EmployeeMapper.toResponse(employee);
    }

    public EmployeeResponse updateEmployee(UUID id, EmployeeUpdateRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        String trimmedEmail = request.getEmail().trim().toLowerCase();
        Optional<Employee> existingWithEmail = employeeRepository.findByEmail(trimmedEmail);
        if (existingWithEmail.isPresent() && !existingWithEmail.get().getId().equals(id)) {
            throw new IllegalArgumentException("Email is already in use");
        }

        employee.setUserId(request.getUserId());
        employee.setFullName(request.getFullName().trim());
        employee.setEmail(trimmedEmail);
        employee.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        employee.setPrimaryRole(request.getPrimaryRole().trim());
        employee.setSkills(request.getSkills() != null ? request.getSkills().trim() : null);
        
        EmployeeStatus status = request.getStatus();
        if (status == null) {
            status = EmployeeStatus.ACTIVE;
        }
        employee.setStatus(status);

        Employee updated = employeeRepository.save(employee);
        return EmployeeMapper.toResponse(updated);
    }

    public void deleteEmployee(UUID id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        employeeRepository.delete(employee);
    }
}
