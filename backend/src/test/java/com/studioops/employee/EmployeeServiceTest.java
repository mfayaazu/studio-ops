package com.studioops.employee;

import com.studioops.common.tenant.TenantContext;
import com.studioops.common.tenant.TenantConstants;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.studio.StudioRepository;
import com.studioops.employee.dto.EmployeeCreateRequest;
import com.studioops.employee.dto.EmployeeResponse;
import com.studioops.employee.dto.EmployeeUpdateRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class EmployeeServiceTest {
    @Mock
    private TenantContext tenantContext;


    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private StudioRepository studioRepository;

    @InjectMocks
    private EmployeeService employeeService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(tenantContext.getCurrentStudioId()).thenReturn(TenantConstants.DEFAULT_STUDIO_ID);
        // Default mock behavior: studios exist
        when(studioRepository.existsById(any(UUID.class))).thenReturn(true);
    }

    @Test
    void createEmployee_Success() {
        EmployeeCreateRequest request = new EmployeeCreateRequest(
                null, "Alice Smith", "ALICE@example.com", "123456", "Lead Photographer", "Colorist", null
        );

        Employee savedEmployee = new Employee();
        savedEmployee.setId(UUID.randomUUID());
        savedEmployee.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        savedEmployee.setFullName("Alice Smith");
        savedEmployee.setEmail("alice@example.com");
        savedEmployee.setPhone("123456");
        savedEmployee.setPrimaryRole("Lead Photographer");
        savedEmployee.setSkills("Colorist");
        savedEmployee.setStatus(EmployeeStatus.ACTIVE);
        savedEmployee.setCreatedAt(Instant.now());
        savedEmployee.setUpdatedAt(Instant.now());

        when(employeeRepository.findByEmail("alice@example.com")).thenReturn(Optional.empty());
        when(employeeRepository.save(any(Employee.class))).thenReturn(savedEmployee);

        EmployeeResponse response = employeeService.createEmployee(request);

        assertNotNull(response.getId());
        assertEquals("Alice Smith", response.getFullName());
        assertEquals("alice@example.com", response.getEmail());
        assertEquals(TenantConstants.DEFAULT_STUDIO_ID, response.getStudioId());
        assertEquals(EmployeeStatus.ACTIVE, response.getStatus());
        verify(studioRepository, times(1)).existsById(TenantConstants.DEFAULT_STUDIO_ID);
        verify(employeeRepository, times(1)).save(any(Employee.class));
    }

    @Test
    void createEmployee_WithCustomStudioId_Success() {
        UUID customStudioId = UUID.randomUUID();
        when(tenantContext.getCurrentStudioId()).thenReturn(customStudioId);
        EmployeeCreateRequest request = new EmployeeCreateRequest(
                null, "Alice Smith", "alice@example.com", "123456", "Lead Photographer", "Colorist", EmployeeStatus.ACTIVE, customStudioId
        );

        Employee savedEmployee = new Employee();
        savedEmployee.setId(UUID.randomUUID());
        savedEmployee.setStudioId(customStudioId);
        savedEmployee.setFullName("Alice Smith");
        savedEmployee.setEmail("alice@example.com");
        savedEmployee.setPhone("123456");
        savedEmployee.setPrimaryRole("Lead Photographer");
        savedEmployee.setSkills("Colorist");
        savedEmployee.setStatus(EmployeeStatus.ACTIVE);

        when(employeeRepository.findByEmail("alice@example.com")).thenReturn(Optional.empty());
        when(employeeRepository.save(any(Employee.class))).thenReturn(savedEmployee);

        EmployeeResponse response = employeeService.createEmployee(request);

        assertNotNull(response);
        assertEquals(customStudioId, response.getStudioId());
        verify(studioRepository, times(1)).existsById(customStudioId);
    }

    @Test
    void createEmployee_StudioNotFound_ThrowsException() {
        UUID nonExistentStudioId = UUID.randomUUID();
        when(tenantContext.getCurrentStudioId()).thenReturn(nonExistentStudioId);
        EmployeeCreateRequest request = new EmployeeCreateRequest(
                null, "Alice Smith", "alice@example.com", "123456", "Lead Photographer", "Colorist", EmployeeStatus.ACTIVE, nonExistentStudioId
        );

        when(studioRepository.existsById(nonExistentStudioId)).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                employeeService.createEmployee(request)
        );
        assertEquals("Studio not found with id: " + nonExistentStudioId, exception.getMessage());
        verify(employeeRepository, never()).save(any(Employee.class));
    }

    @Test
    void createEmployee_DuplicateEmail_ThrowsException() {
        EmployeeCreateRequest request = new EmployeeCreateRequest(
                null, "Alice Smith", "alice@example.com", "123456", "Lead Photographer", "Colorist", EmployeeStatus.ACTIVE
        );

        when(employeeRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(new Employee()));

        assertThrows(IllegalArgumentException.class, () -> employeeService.createEmployee(request));
        verify(employeeRepository, never()).save(any(Employee.class));
    }

    @Test
    void listEmployees_NoSearch_ReturnsAllForDefaultStudio() {
        Employee emp1 = new Employee();
        emp1.setEmail("emp1@example.com");
        emp1.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        Employee emp2 = new Employee();
        emp2.setEmail("emp2@example.com");
        emp2.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(employeeRepository.findAllByStudioId(TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Arrays.asList(emp1, emp2));

        List<EmployeeResponse> responses = employeeService.listEmployees(null);

        assertEquals(2, responses.size());
        verify(employeeRepository, times(1)).findAllByStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        verify(employeeRepository, never()).findAll();
    }

    @Test
    void listEmployees_WithSearch_CallsSearchByStudio() {
        Employee emp = new Employee();
        emp.setEmail("emp@example.com");
        emp.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(employeeRepository.searchEmployeesByStudio(TenantConstants.DEFAULT_STUDIO_ID, "photographer")).thenReturn(Collections.singletonList(emp));

        List<EmployeeResponse> responses = employeeService.listEmployees("photographer");

        assertEquals(1, responses.size());
        verify(employeeRepository, never()).findAll();
        verify(employeeRepository, times(1)).searchEmployeesByStudio(TenantConstants.DEFAULT_STUDIO_ID, "photographer");
        verify(employeeRepository, never()).searchEmployees(anyString());
    }

    @Test
    void listEmployeesForStudio_CustomStudio_ReturnsMatching() {
        UUID customStudioId = UUID.randomUUID();
        when(tenantContext.getCurrentStudioId()).thenReturn(customStudioId);
        Employee emp = new Employee();
        emp.setEmail("emp@example.com");
        emp.setStudioId(customStudioId);

        when(employeeRepository.findAllByStudioId(customStudioId)).thenReturn(Collections.singletonList(emp));

        List<EmployeeResponse> responses = employeeService.listEmployeesForStudio(customStudioId, null);

        assertEquals(1, responses.size());
        assertEquals(customStudioId, responses.get(0).getStudioId());
        verify(employeeRepository, times(1)).findAllByStudioId(customStudioId);
    }

    @Test
    void getEmployeeById_Success() {
        UUID id = UUID.randomUUID();
        Employee employee = new Employee();
        employee.setId(id);
        employee.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        employee.setFullName("John Doe");
        employee.setEmail("john@example.com");

        when(employeeRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(employee));

        EmployeeResponse response = employeeService.getEmployeeById(id);

        assertEquals(id, response.getId());
        assertEquals(TenantConstants.DEFAULT_STUDIO_ID, response.getStudioId());
        assertEquals("John Doe", response.getFullName());
    }

    @Test
    void getEmployeeById_NotFound_ThrowsException() {
        UUID id = UUID.randomUUID();
        when(employeeRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> employeeService.getEmployeeById(id));
    }

    @Test
    void updateEmployee_Success() {
        UUID id = UUID.randomUUID();
        EmployeeUpdateRequest request = new EmployeeUpdateRequest(
                null, "John Updated", "john@example.com", "123456", "Senior Editor", "Photoshop", EmployeeStatus.ON_LEAVE
        );

        Employee existing = new Employee();
        existing.setId(id);
        existing.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        existing.setFullName("John Doe");
        existing.setEmail("john@example.com");
        existing.setStatus(EmployeeStatus.ACTIVE);

        Employee updated = new Employee();
        updated.setId(id);
        updated.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        updated.setFullName("John Updated");
        updated.setEmail("john@example.com");
        updated.setPhone("123456");
        updated.setPrimaryRole("Senior Editor");
        updated.setSkills("Photoshop");
        updated.setStatus(EmployeeStatus.ON_LEAVE);
        updated.setCreatedAt(Instant.now());
        updated.setUpdatedAt(Instant.now());

        when(employeeRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(existing));
        when(employeeRepository.findByEmail("john@example.com")).thenReturn(Optional.of(existing));
        when(employeeRepository.save(any(Employee.class))).thenReturn(updated);

        EmployeeResponse response = employeeService.updateEmployee(id, request);

        assertEquals("John Updated", response.getFullName());
        assertEquals("Senior Editor", response.getPrimaryRole());
        assertEquals(EmployeeStatus.ON_LEAVE, response.getStatus());
        assertEquals(TenantConstants.DEFAULT_STUDIO_ID, response.getStudioId());
    }

    @Test
    void updateEmployee_DuplicateEmail_ThrowsException() {
        UUID id = UUID.randomUUID();
        EmployeeUpdateRequest request = new EmployeeUpdateRequest(
                null, "John Updated", "other@example.com", "123456", "Senior Editor", "Photoshop", EmployeeStatus.ACTIVE
        );

        Employee existing = new Employee();
        existing.setId(id);
        existing.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        existing.setEmail("john@example.com");

        Employee other = new Employee();
        other.setId(UUID.randomUUID());
        other.setEmail("other@example.com");

        when(employeeRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(existing));
        when(employeeRepository.findByEmail("other@example.com")).thenReturn(Optional.of(other));

        assertThrows(IllegalArgumentException.class, () -> employeeService.updateEmployee(id, request));
    }

    @Test
    void deleteEmployee_Success() {
        UUID id = UUID.randomUUID();
        Employee employee = new Employee();
        employee.setId(id);
        employee.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(employeeRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(employee));
        doNothing().when(employeeRepository).delete(employee);

        assertDoesNotThrow(() -> employeeService.deleteEmployee(id));
        verify(employeeRepository, times(1)).delete(employee);
    }

    @Test
    void deleteEmployee_NotFound_ThrowsException() {
        UUID id = UUID.randomUUID();
        when(employeeRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> employeeService.deleteEmployee(id));
        verify(employeeRepository, never()).delete(any(Employee.class));
    }
}
