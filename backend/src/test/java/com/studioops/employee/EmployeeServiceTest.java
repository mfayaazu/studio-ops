package com.studioops.employee;

import com.studioops.common.tenant.TenantContext;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.studio.StudioRepository;
import com.studioops.user.User;
import com.studioops.user.UserRepository;
import com.studioops.user.UserRole;
import com.studioops.user.UserStatus;
import com.studioops.employee.dto.EmployeeCreateRequest;
import com.studioops.employee.dto.EmployeeResponse;
import com.studioops.employee.dto.EmployeeUpdateRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
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

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private com.studioops.user.PermissionService permissionService;

    @Mock
    private com.studioops.email.EmailService emailService;

    @InjectMocks
    private EmployeeService employeeService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(tenantContext.getCurrentStudioId()).thenReturn(TenantConstants.DEFAULT_STUDIO_ID);
        when(studioRepository.existsById(any(UUID.class))).thenReturn(true);
        when(passwordEncoder.encode(any(CharSequence.class))).thenAnswer(inv -> "encoded_" + inv.getArgument(0));
        SecurityContextHolder.clearContext();
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
    void createEmployee_CreateLogin_EmailSendingSucceeds() {
        EmployeeCreateRequest request = new EmployeeCreateRequest(
                null, "Bob Jones", "bob@example.com", "9999", "Editor", "VFX", EmployeeStatus.ACTIVE
        );
        request.setCreateLogin(true);
        request.setLoginEmail("bob.login@example.com");
        request.setUserRole("EDITOR");
        request.setTemporaryPassword("bobPassword");
        request.setSendInviteEmail(true);

        Employee savedEmployee = new Employee();
        savedEmployee.setId(UUID.randomUUID());
        savedEmployee.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        savedEmployee.setFullName("Bob Jones");
        savedEmployee.setEmail("bob@example.com");
        savedEmployee.setPhone("9999");
        savedEmployee.setPrimaryRole("Editor");
        savedEmployee.setSkills("VFX");
        savedEmployee.setStatus(EmployeeStatus.ACTIVE);

        User savedUser = new User();
        savedUser.setId(UUID.randomUUID());
        savedUser.setEmail("bob.login@example.com");
        savedUser.setRole(UserRole.EDITOR);
        savedUser.setInviteToken("my-test-token");

        when(employeeRepository.findByEmail("bob@example.com")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("bob.login@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(employeeRepository.save(any(Employee.class))).thenAnswer(inv -> {
            Employee e = inv.getArgument(0);
            e.setId(savedEmployee.getId());
            return e;
        });
        when(userRepository.findById(savedUser.getId())).thenReturn(Optional.of(savedUser));

        EmployeeResponse response = employeeService.createEmployee(request);

        assertNotNull(response);
        assertTrue(response.isLoginEnabled());
        assertEquals("bob.login@example.com", response.getLoginEmail());
        assertEquals("EDITOR", response.getUserRole());
        assertNull(response.getInviteWarning());
        verify(userRepository, times(1)).save(any(User.class));
        verify(emailService, times(1)).sendEmployeeInviteEmail(eq(savedUser), anyString(), eq("my-test-token"));
    }

    @Test
    void createEmployee_CreateLogin_EmailSendingFails() {
        EmployeeCreateRequest request = new EmployeeCreateRequest(
                null, "Bob Jones", "bob@example.com", "9999", "Editor", "VFX", EmployeeStatus.ACTIVE
        );
        request.setCreateLogin(true);
        request.setLoginEmail("bob.login@example.com");
        request.setUserRole("EDITOR");
        request.setTemporaryPassword("bobPassword");
        request.setSendInviteEmail(true);

        Employee savedEmployee = new Employee();
        savedEmployee.setId(UUID.randomUUID());
        savedEmployee.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        savedEmployee.setFullName("Bob Jones");
        savedEmployee.setEmail("bob@example.com");
        savedEmployee.setStatus(EmployeeStatus.ACTIVE);

        User savedUser = new User();
        savedUser.setId(UUID.randomUUID());
        savedUser.setEmail("bob.login@example.com");
        savedUser.setRole(UserRole.EDITOR);
        savedUser.setInviteToken("my-test-token");

        when(employeeRepository.findByEmail("bob@example.com")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("bob.login@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(employeeRepository.save(any(Employee.class))).thenAnswer(inv -> {
            Employee e = inv.getArgument(0);
            e.setId(savedEmployee.getId());
            return e;
        });
        when(userRepository.findById(savedUser.getId())).thenReturn(Optional.of(savedUser));

        doThrow(new RuntimeException("SMTP Server Unavailable"))
                .when(emailService).sendEmployeeInviteEmail(any(User.class), anyString(), anyString());

        EmployeeResponse response = employeeService.createEmployee(request);

        assertNotNull(response);
        assertTrue(response.isLoginEnabled());
        assertEquals("Employee login created, but invite email could not be sent.", response.getInviteWarning());
        verify(userRepository, times(1)).save(any(User.class));
        verify(emailService, times(1)).sendEmployeeInviteEmail(eq(savedUser), anyString(), eq("my-test-token"));
    }

    @Test
    void createEmployee_CreateLogin_SendInviteEmailFalse() {
        EmployeeCreateRequest request = new EmployeeCreateRequest(
                null, "Bob Jones", "bob@example.com", "9999", "Editor", "VFX", EmployeeStatus.ACTIVE
        );
        request.setCreateLogin(true);
        request.setLoginEmail("bob.login@example.com");
        request.setUserRole("EDITOR");
        request.setTemporaryPassword("bobPassword");
        request.setSendInviteEmail(false);

        Employee savedEmployee = new Employee();
        savedEmployee.setId(UUID.randomUUID());
        savedEmployee.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        savedEmployee.setFullName("Bob Jones");
        savedEmployee.setEmail("bob@example.com");
        savedEmployee.setStatus(EmployeeStatus.ACTIVE);

        User savedUser = new User();
        savedUser.setId(UUID.randomUUID());
        savedUser.setEmail("bob.login@example.com");
        savedUser.setRole(UserRole.EDITOR);

        when(employeeRepository.findByEmail("bob@example.com")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("bob.login@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(employeeRepository.save(any(Employee.class))).thenAnswer(inv -> {
            Employee e = inv.getArgument(0);
            e.setId(savedEmployee.getId());
            return e;
        });
        when(userRepository.findById(savedUser.getId())).thenReturn(Optional.of(savedUser));

        EmployeeResponse response = employeeService.createEmployee(request);

        assertNotNull(response);
        verify(userRepository, times(1)).save(any(User.class));
        verify(emailService, never()).sendEmployeeInviteEmail(any(User.class), anyString(), anyString());
    }

    @Test
    void getEmployeeById_Success() {
        UUID id = UUID.randomUUID();
        Employee employee = new Employee();
        employee.setId(id);
        employee.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        employee.setFullName("Jane Doe");
        employee.setEmail("jane@example.com");
        employee.setPrimaryRole("Staff");

        when(employeeRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(employee));

        EmployeeResponse response = employeeService.getEmployeeById(id);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals("Jane Doe", response.getFullName());
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
                null, "Jane Doe Updated", "jane@example.com", "987654", "Studio Manager", "Photoshop", EmployeeStatus.ACTIVE
        );

        Employee existing = new Employee();
        existing.setId(id);
        existing.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        existing.setFullName("Jane Doe");
        existing.setEmail("jane@example.com");
        existing.setPrimaryRole("Staff");

        Employee saved = new Employee();
        saved.setId(id);
        saved.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        saved.setFullName("Jane Doe Updated");
        saved.setEmail("jane@example.com");
        saved.setPhone("987654");
        saved.setPrimaryRole("Studio Manager");
        saved.setSkills("Photoshop");
        saved.setStatus(EmployeeStatus.ACTIVE);

        when(employeeRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(existing));
        when(employeeRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(existing));
        when(employeeRepository.save(any(Employee.class))).thenReturn(saved);

        EmployeeResponse response = employeeService.updateEmployee(id, request);

        assertNotNull(response);
        assertEquals("Jane Doe Updated", response.getFullName());
        assertEquals("Studio Manager", response.getPrimaryRole());
        verify(employeeRepository, times(1)).save(any(Employee.class));
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

    @Test
    void updateEmployee_UpdateLogin_Success() {
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        EmployeeUpdateRequest request = new EmployeeUpdateRequest(
                userId, "Jane Updated", "jane@example.com", "987", "Editor", "Premiere", EmployeeStatus.ACTIVE
        );
        request.setCreateLogin(true);
        request.setLoginEmail("jane.login@example.com");
        request.setUserRole("EDITOR");
        request.setTemporaryPassword("newPassword");
        request.setSendInviteEmail(false);

        Employee existing = new Employee();
        existing.setId(id);
        existing.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        existing.setUserId(userId);
        existing.setEmail("jane@example.com");

        User existingUser = new User();
        existingUser.setId(userId);
        existingUser.setEmail("jane.old@example.com");
        existingUser.setRole(UserRole.EMPLOYEE);

        when(employeeRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(existing));
        when(employeeRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(existing));
        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        when(userRepository.findByEmail("jane.login@example.com")).thenReturn(Optional.empty());
        when(employeeRepository.save(any(Employee.class))).thenReturn(existing);
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        EmployeeResponse response = employeeService.updateEmployee(id, request);

        assertNotNull(response);
        assertNull(response.getInviteWarning());
        verify(userRepository, times(1)).save(argThat(u -> 
            u.getEmail().equals("jane.login@example.com") &&
            u.getRole().equals(UserRole.EDITOR) &&
            u.getPasswordHash().equals("encoded_newPassword")
        ));
        verify(emailService, never()).sendEmployeeInviteEmail(any(User.class), anyString(), anyString());
    }

    @Test
    void updateEmployee_ResendInviteEmail_Success() {
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        EmployeeUpdateRequest request = new EmployeeUpdateRequest(
                userId, "Jane Updated", "jane@example.com", "987", "Editor", "Premiere", EmployeeStatus.ACTIVE
        );
        request.setCreateLogin(true);
        request.setLoginEmail("jane.login@example.com");
        request.setUserRole("EDITOR");
        request.setSendInviteEmail(true);

        Employee existing = new Employee();
        existing.setId(id);
        existing.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        existing.setUserId(userId);
        existing.setEmail("jane@example.com");

        User existingUser = new User();
        existingUser.setId(userId);
        existingUser.setEmail("jane.old@example.com");
        existingUser.setRole(UserRole.EMPLOYEE);

        when(employeeRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(existing));
        when(employeeRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(existing));
        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        when(userRepository.findByEmail("jane.login@example.com")).thenReturn(Optional.empty());
        when(employeeRepository.save(any(Employee.class))).thenReturn(existing);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setInviteToken("my-update-token");
            return u;
        });

        EmployeeResponse response = employeeService.updateEmployee(id, request);

        assertNotNull(response);
        assertNull(response.getInviteWarning());
        verify(emailService, times(1)).sendEmployeeInviteEmail(any(User.class), anyString(), eq("my-update-token"));
    }

    @Test
    void updateEmployee_ResendInviteEmail_Failure() {
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        EmployeeUpdateRequest request = new EmployeeUpdateRequest(
                userId, "Jane Updated", "jane@example.com", "987", "Editor", "Premiere", EmployeeStatus.ACTIVE
        );
        request.setCreateLogin(true);
        request.setLoginEmail("jane.login@example.com");
        request.setUserRole("EDITOR");
        request.setSendInviteEmail(true);

        Employee existing = new Employee();
        existing.setId(id);
        existing.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        existing.setUserId(userId);
        existing.setEmail("jane@example.com");

        User existingUser = new User();
        existingUser.setId(userId);
        existingUser.setEmail("jane.old@example.com");
        existingUser.setRole(UserRole.EMPLOYEE);

        when(employeeRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(existing));
        when(employeeRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(existing));
        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        when(userRepository.findByEmail("jane.login@example.com")).thenReturn(Optional.empty());
        when(employeeRepository.save(any(Employee.class))).thenReturn(existing);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setInviteToken("my-update-token");
            return u;
        });

        doThrow(new RuntimeException("SMTP Failure"))
                .when(emailService).sendEmployeeInviteEmail(any(User.class), anyString(), anyString());

        EmployeeResponse response = employeeService.updateEmployee(id, request);

        assertNotNull(response);
        assertEquals("Employee login updated, but invite email could not be sent.", response.getInviteWarning());
        verify(emailService, times(1)).sendEmployeeInviteEmail(any(User.class), anyString(), eq("my-update-token"));
    }

    @Test
    void updateEmployee_ExistingLinkedUser_SameEmail_Succeeds() {
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        EmployeeUpdateRequest request = new EmployeeUpdateRequest(
                userId, "Jane Same", "jane@example.com", "987", "Editor", "Premiere", EmployeeStatus.ACTIVE
        );
        request.setCreateLogin(true);
        request.setLoginEmail("jane.login@example.com");
        request.setUserRole("EDITOR");
        request.setSendInviteEmail(false);

        Employee existing = new Employee();
        existing.setId(id);
        existing.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        existing.setUserId(userId);
        existing.setEmail("jane@example.com");

        User existingUser = new User();
        existingUser.setId(userId);
        existingUser.setEmail("jane.login@example.com");
        existingUser.setRole(UserRole.EMPLOYEE);

        when(employeeRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(existing));
        when(employeeRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(existing));
        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        when(userRepository.findByEmail("jane.login@example.com")).thenReturn(Optional.of(existingUser));
        when(employeeRepository.save(any(Employee.class))).thenReturn(existing);
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        EmployeeResponse response = employeeService.updateEmployee(id, request);

        assertNotNull(response);
        assertEquals("jane.login@example.com", response.getLoginEmail());
        verify(userRepository, times(1)).findByEmail("jane.login@example.com");
        verify(userRepository, times(1)).save(existingUser);
    }

    @Test
    void updateEmployee_LinkedUser_ChangedUnusedEmail_Succeeds() {
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        EmployeeUpdateRequest request = new EmployeeUpdateRequest(
                userId, "Jane Changed", "jane@example.com", "987", "Editor", "Premiere", EmployeeStatus.ACTIVE
        );
        request.setCreateLogin(true);
        request.setLoginEmail("jane.new@example.com");
        request.setUserRole("EDITOR");
        request.setSendInviteEmail(false);

        Employee existing = new Employee();
        existing.setId(id);
        existing.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        existing.setUserId(userId);
        existing.setEmail("jane@example.com");

        User existingUser = new User();
        existingUser.setId(userId);
        existingUser.setEmail("jane.login@example.com");
        existingUser.setRole(UserRole.EMPLOYEE);

        when(employeeRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(existing));
        when(employeeRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(existing));
        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        when(userRepository.findByEmail("jane.new@example.com")).thenReturn(Optional.empty());
        when(employeeRepository.save(any(Employee.class))).thenReturn(existing);
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        EmployeeResponse response = employeeService.updateEmployee(id, request);

        assertNotNull(response);
        assertEquals("jane.new@example.com", response.getLoginEmail());
        verify(userRepository, times(1)).findByEmail("jane.new@example.com");
        verify(userRepository, times(1)).save(existingUser);
    }

    @Test
    void updateEmployee_LinkedUser_EmailUsedByAnotherUser_Fails() {
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        EmployeeUpdateRequest request = new EmployeeUpdateRequest(
                userId, "Jane Changed", "jane@example.com", "987", "Editor", "Premiere", EmployeeStatus.ACTIVE
        );
        request.setCreateLogin(true);
        request.setLoginEmail("another.used@example.com");
        request.setUserRole("EDITOR");
        request.setSendInviteEmail(false);

        Employee existing = new Employee();
        existing.setId(id);
        existing.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        existing.setUserId(userId);
        existing.setEmail("jane@example.com");

        User existingUser = new User();
        existingUser.setId(userId);
        existingUser.setEmail("jane.login@example.com");
        existingUser.setRole(UserRole.EMPLOYEE);

        User anotherUser = new User();
        anotherUser.setId(UUID.randomUUID());
        anotherUser.setEmail("another.used@example.com");

        when(employeeRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(existing));
        when(employeeRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(existing));
        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        when(userRepository.findByEmail("another.used@example.com")).thenReturn(Optional.of(anotherUser));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> 
            employeeService.updateEmployee(id, request)
        );
        assertEquals("This email is already used by another user. Use a different login email.", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateEmployee_NoLinkedUser_EmailUsedByExistingUser_Fails() {
        UUID id = UUID.randomUUID();

        EmployeeUpdateRequest request = new EmployeeUpdateRequest(
                null, "Jane No User", "jane@example.com", "987", "Editor", "Premiere", EmployeeStatus.ACTIVE
        );
        request.setCreateLogin(true);
        request.setLoginEmail("existing.user@example.com");
        request.setUserRole("EDITOR");
        request.setSendInviteEmail(false);

        Employee existing = new Employee();
        existing.setId(id);
        existing.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        existing.setEmail("jane@example.com");

        User existingUser = new User();
        existingUser.setId(UUID.randomUUID());
        existingUser.setEmail("existing.user@example.com");

        when(employeeRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(existing));
        when(employeeRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(existing));
        when(userRepository.findByEmail("existing.user@example.com")).thenReturn(Optional.of(existingUser));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> 
            employeeService.updateEmployee(id, request)
        );
        assertEquals("This email is already used by another user. Use a different login email.", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateEmployee_ExistingLinkedUser_DoesNotCreateDuplicateUser() {
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        EmployeeUpdateRequest request = new EmployeeUpdateRequest(
                userId, "Jane No Duplicate", "jane@example.com", "987", "Editor", "Premiere", EmployeeStatus.ACTIVE
        );
        request.setCreateLogin(true);
        request.setLoginEmail("jane.login@example.com");
        request.setUserRole("EDITOR");
        request.setSendInviteEmail(false);

        Employee existing = new Employee();
        existing.setId(id);
        existing.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        existing.setUserId(userId);
        existing.setEmail("jane@example.com");

        User existingUser = new User();
        existingUser.setId(userId);
        existingUser.setEmail("jane.login@example.com");
        existingUser.setRole(UserRole.EMPLOYEE);

        when(employeeRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(existing));
        when(employeeRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(existing));
        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        when(userRepository.findByEmail("jane.login@example.com")).thenReturn(Optional.of(existingUser));
        when(employeeRepository.save(any(Employee.class))).thenReturn(existing);
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        EmployeeResponse response = employeeService.updateEmployee(id, request);

        assertNotNull(response);
        assertEquals(userId, existing.getUserId());
        verify(userRepository, times(1)).save(existingUser);
    }
}
