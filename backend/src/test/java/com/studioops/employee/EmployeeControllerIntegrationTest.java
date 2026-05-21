package com.studioops.employee;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studioops.config.SecurityConfig;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.employee.dto.EmployeeCreateRequest;
import com.studioops.employee.dto.EmployeeResponse;
import com.studioops.employee.dto.EmployeeUpdateRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.time.Instant;
import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EmployeeController.class)
@Import(SecurityConfig.class)
class EmployeeControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EmployeeService employeeService;

    @Test
    void createEmployee_Success() throws Exception {
        EmployeeCreateRequest request = new EmployeeCreateRequest(
                null, "John Doe", "john.doe@studioops.se", "+46701112233", "Lead Photographer", "Colorist", EmployeeStatus.ACTIVE
        );
        EmployeeResponse response = new EmployeeResponse(
                UUID.randomUUID(), null, "John Doe", "john.doe@studioops.se", "+46701112233", "Lead Photographer", "Colorist", EmployeeStatus.ACTIVE, Instant.now(), Instant.now()
        );

        when(employeeService.createEmployee(any(EmployeeCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/employees")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(response.getId().toString()))
                .andExpect(jsonPath("$.fullName").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john.doe@studioops.se"));
    }

    @Test
    void createEmployee_InvalidPayload_BadRequest() throws Exception {
        EmployeeCreateRequest request = new EmployeeCreateRequest(
                null, "", "invalid-email", "phone-too-long-phone-too-long-phone-too-long-phone-too-long", "", "", null
        );

        mockMvc.perform(post("/api/employees")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.fullName").exists())
                .andExpect(jsonPath("$.errors.email").exists())
                .andExpect(jsonPath("$.errors.phone").exists())
                .andExpect(jsonPath("$.errors.primaryRole").exists());

        verify(employeeService, never()).createEmployee(any(EmployeeCreateRequest.class));
    }

    @Test
    void getEmployeeById_Success() throws Exception {
        UUID id = UUID.randomUUID();
        EmployeeResponse response = new EmployeeResponse(
                id, null, "John Doe", "john.doe@studioops.se", "+46701112233", "Lead Photographer", "Colorist", EmployeeStatus.ACTIVE, Instant.now(), Instant.now()
        );

        when(employeeService.getEmployeeById(id)).thenReturn(response);

        mockMvc.perform(get("/api/employees/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.fullName").value("John Doe"));
    }

    @Test
    void getEmployeeById_NotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(employeeService.getEmployeeById(id)).thenThrow(new ResourceNotFoundException("Employee not found"));

        mockMvc.perform(get("/api/employees/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void updateEmployee_Success() throws Exception {
        UUID id = UUID.randomUUID();
        EmployeeUpdateRequest request = new EmployeeUpdateRequest(
                null, "John Updated", "john.doe@studioops.se", "+46701112233", "Lead Photographer", "Colorist", EmployeeStatus.ACTIVE
        );
        EmployeeResponse response = new EmployeeResponse(
                id, null, "John Updated", "john.doe@studioops.se", "+46701112233", "Lead Photographer", "Colorist", EmployeeStatus.ACTIVE, Instant.now(), Instant.now()
        );

        when(employeeService.updateEmployee(eq(id), any(EmployeeUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/employees/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("John Updated"));
    }

    @Test
    void deleteEmployee_Success() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(employeeService).deleteEmployee(id);

        mockMvc.perform(delete("/api/employees/{id}", id))
                .andExpect(status().isNoContent());

        verify(employeeService, times(1)).deleteEmployee(id);
    }
}
