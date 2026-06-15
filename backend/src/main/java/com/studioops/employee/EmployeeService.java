package com.studioops.employee;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantContext;
import java.time.Instant;
import com.studioops.studio.StudioRepository;
import com.studioops.user.User;
import com.studioops.user.UserRepository;
import com.studioops.user.UserRole;
import com.studioops.user.UserStatus;
import com.studioops.employee.dto.EmployeeCreateRequest;
import com.studioops.employee.dto.EmployeeResponse;
import com.studioops.employee.dto.EmployeeUpdateRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final StudioRepository studioRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TenantContext tenantContext;
    private final com.studioops.user.PermissionService permissionService;
    private final com.studioops.email.EmailService emailService;

    public EmployeeService(EmployeeRepository employeeRepository, 
                           StudioRepository studioRepository, 
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           TenantContext tenantContext,
                           com.studioops.user.PermissionService permissionService,
                           com.studioops.email.EmailService emailService) {
        this.employeeRepository = employeeRepository;
        this.studioRepository = studioRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tenantContext = tenantContext;
        this.permissionService = permissionService;
        this.emailService = emailService;
    }

    public EmployeeResponse createEmployee(EmployeeCreateRequest request) {
        checkOwnerOrAdminAccess();

        UUID currentStudioId = tenantContext.getCurrentStudioId();
        if (request.getStudioId() != null && !request.getStudioId().equals(currentStudioId)) {
            throw new IllegalArgumentException("Mismatched studio ID provided");
        }
        UUID studioId = currentStudioId;

        if (!studioRepository.existsById(studioId)) {
            throw new IllegalArgumentException("Studio not found with id: " + studioId);
        }

        String trimmedEmail = request.getEmail().trim().toLowerCase();
        if (employeeRepository.findByEmail(trimmedEmail).isPresent()) {
            throw new IllegalArgumentException("Email is already in use");
        }

        Employee employee = new Employee();
        employee.setStudioId(studioId);
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

        // Create login if requested
        String warning = null;
        if (request.getCreateLogin() != null && request.getCreateLogin()) {
            String loginEmail = request.getLoginEmail() != null && !request.getLoginEmail().trim().isEmpty()
                    ? request.getLoginEmail().trim().toLowerCase()
                    : trimmedEmail;

            if (userRepository.findByEmail(loginEmail).isPresent()) {
                throw new IllegalArgumentException("This email is already used by another user. Use a different login email.");
            }

            UserRole role;
            try {
                role = UserRole.valueOf(request.getUserRole() != null ? request.getUserRole().toUpperCase().trim() : "EMPLOYEE");
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid user role: " + request.getUserRole());
            }

            String tempPass = request.getTemporaryPassword() != null && !request.getTemporaryPassword().trim().isEmpty()
                    ? request.getTemporaryPassword().trim()
                    : UUID.randomUUID().toString();

            User user = new User();
            user.setEmail(loginEmail);
            user.setPasswordHash(passwordEncoder.encode(tempPass));
            user.setRole(role);
            user.setStatus(UserStatus.ACTIVE);
            user.setStudioId(studioId);
            user.setDisplayName(request.getFullName().trim());

            String inviteToken = UUID.randomUUID().toString();
            user.setInviteToken(inviteToken);
            user.setInviteTokenExpiresAt(Instant.now().plus(java.time.Duration.ofHours(48)));

            User savedUser = userRepository.save(user);
            employee.setUserId(savedUser.getId());

            if (request.getSendInviteEmail() == null || request.getSendInviteEmail()) {
                String studioName = studioRepository.findById(studioId)
                        .map(com.studioops.studio.Studio::getName)
                        .orElse("StudioOps");
                String replyToEmail = null;
                List<User> owners = userRepository.findByStudioIdAndRole(studioId, UserRole.OWNER);
                if (!owners.isEmpty()) {
                    replyToEmail = owners.get(0).getEmail();
                }
                
                if (!emailService.isEnabled()) {
                    warning = "Employee created. Email sending is disabled.";
                } else {
                    try {
                        emailService.sendEmployeeInviteEmail(savedUser, studioName, savedUser.getInviteToken(), replyToEmail);
                        warning = "Employee created. Invite email sent.";
                    } catch (Exception e) {
                        warning = "Employee created, but invite email could not be sent.";
                    }
                }
            }
        }
        Employee saved = employeeRepository.save(employee);
        EmployeeResponse response = mapToResponse(saved);
        if (warning != null) {
            response.setInviteWarning(warning);
        }
        return response;
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> listEmployees(String search) {
        return listEmployeesForStudio(tenantContext.getCurrentStudioId(), search);
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> listEmployeesForStudio(UUID studioId, String search) {
        List<Employee> employees;
        if (search == null || search.trim().isEmpty()) {
            employees = employeeRepository.findAllByStudioId(studioId);
        } else {
            employees = employeeRepository.searchEmployeesByStudio(studioId, search.trim());
        }
        return employees.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(UUID id) {
        Employee employee = employeeRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return mapToResponse(employee);
    }

    public EmployeeResponse updateEmployee(UUID id, EmployeeUpdateRequest request) {
        checkOwnerOrAdminAccess();

        Employee employee = employeeRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        String trimmedEmail = request.getEmail().trim().toLowerCase();
        Optional<Employee> existingWithEmail = employeeRepository.findByEmail(trimmedEmail);
        if (existingWithEmail.isPresent() && !existingWithEmail.get().getId().equals(id)) {
            throw new IllegalArgumentException("Email is already in use");
        }

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

        // Create or update login if requested
        String warning = null;
        if (request.getCreateLogin() != null && request.getCreateLogin()) {
            String loginEmail = request.getLoginEmail() != null && !request.getLoginEmail().trim().isEmpty()
                    ? request.getLoginEmail().trim().toLowerCase()
                    : trimmedEmail;

            UserRole role;
            try {
                role = UserRole.valueOf(request.getUserRole() != null ? request.getUserRole().toUpperCase().trim() : "EMPLOYEE");
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid user role: " + request.getUserRole());
            }

            if (employee.getUserId() != null) {
                // Case A: employee has existing userId
                User linkedUser = userRepository.findById(employee.getUserId())
                        .orElseThrow(() -> new IllegalArgumentException("Linked user account not found"));

                Optional<User> foundUserOpt = userRepository.findByEmail(loginEmail);
                if (foundUserOpt.isPresent()) {
                    User foundUser = foundUserOpt.get();
                    if (!foundUser.getId().equals(linkedUser.getId())) {
                        throw new IllegalArgumentException("This email is already used by another user. Use a different login email.");
                    }
                    linkedUser.setEmail(loginEmail);
                } else {
                    linkedUser.setEmail(loginEmail);
                }

                linkedUser.setRole(role);
                linkedUser.setDisplayName(request.getFullName().trim());

                // If password provided, update it
                if (request.getTemporaryPassword() != null && !request.getTemporaryPassword().trim().isEmpty()) {
                    linkedUser.setPasswordHash(passwordEncoder.encode(request.getTemporaryPassword().trim()));
                }

                // Resend invite if requested explicitly
                if (request.getSendInviteEmail() != null && request.getSendInviteEmail()) {
                    String inviteToken = UUID.randomUUID().toString();
                    linkedUser.setInviteToken(inviteToken);
                    linkedUser.setInviteTokenExpiresAt(Instant.now().plus(java.time.Duration.ofHours(48)));

                    User savedUser = userRepository.save(linkedUser);
                    String studioName = studioRepository.findById(employee.getStudioId())
                            .map(com.studioops.studio.Studio::getName)
                            .orElse("StudioOps");
                    String replyToEmail = null;
                    List<User> owners = userRepository.findByStudioIdAndRole(employee.getStudioId(), UserRole.OWNER);
                    if (!owners.isEmpty()) {
                        replyToEmail = owners.get(0).getEmail();
                    }

                    if (!emailService.isEnabled()) {
                        warning = "Employee created. Email sending is disabled.";
                    } else {
                        try {
                            emailService.sendEmployeeInviteEmail(savedUser, studioName, savedUser.getInviteToken(), replyToEmail);
                            warning = "Employee created. Invite email sent.";
                        } catch (Exception e) {
                            warning = "Employee created, but invite email could not be sent.";
                        }
                    }
                } else {
                    userRepository.save(linkedUser);
                }
            } else {
                // Case B: employee has no existing userId
                Optional<User> existingUser = userRepository.findByEmail(loginEmail);
                if (existingUser.isPresent()) {
                    throw new IllegalArgumentException("This email is already used by another user. Use a different login email.");
                }

                String tempPass = request.getTemporaryPassword() != null && !request.getTemporaryPassword().trim().isEmpty()
                        ? request.getTemporaryPassword().trim()
                        : UUID.randomUUID().toString();

                User user = new User();
                user.setEmail(loginEmail);
                user.setPasswordHash(passwordEncoder.encode(tempPass));
                user.setRole(role);
                user.setStatus(UserStatus.ACTIVE);
                user.setStudioId(employee.getStudioId());
                user.setDisplayName(request.getFullName().trim());

                String inviteToken = UUID.randomUUID().toString();
                user.setInviteToken(inviteToken);
                user.setInviteTokenExpiresAt(Instant.now().plus(java.time.Duration.ofHours(48)));

                User savedUser = userRepository.save(user);
                employee.setUserId(savedUser.getId());

                if (request.getSendInviteEmail() == null || request.getSendInviteEmail()) {
                    String studioName = studioRepository.findById(employee.getStudioId())
                            .map(com.studioops.studio.Studio::getName)
                            .orElse("StudioOps");
                    String replyToEmail = null;
                    List<User> owners = userRepository.findByStudioIdAndRole(employee.getStudioId(), UserRole.OWNER);
                    if (!owners.isEmpty()) {
                        replyToEmail = owners.get(0).getEmail();
                    }

                    if (!emailService.isEnabled()) {
                        warning = "Employee created. Email sending is disabled.";
                    } else {
                        try {
                            emailService.sendEmployeeInviteEmail(savedUser, studioName, savedUser.getInviteToken(), replyToEmail);
                            warning = "Employee created. Invite email sent.";
                        } catch (Exception e) {
                            warning = "Employee created, but invite email could not be sent.";
                        }
                    }
                }
            }
        }

        Employee updated = employeeRepository.save(employee);
        EmployeeResponse response = mapToResponse(updated);
        if (warning != null) {
            response.setInviteWarning(warning);
        }
        return response;
    }

    public void deleteEmployee(UUID id) {
        checkOwnerOrAdminAccess();

        Employee employee = employeeRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        
        // If employee has associated user login, we delete it too
        if (employee.getUserId() != null) {
            userRepository.findById(employee.getUserId()).ifPresent(userRepository::delete);
        }

        employeeRepository.delete(employee);
    }

    private EmployeeResponse mapToResponse(Employee employee) {
        if (employee.getUserId() != null) {
            User user = userRepository.findById(employee.getUserId()).orElse(null);
            return EmployeeMapper.toResponse(employee, user);
        }
        return EmployeeMapper.toResponse(employee, null);
    }

    private void checkOwnerOrAdminAccess() {
        permissionService.checkPermission(com.studioops.user.PageKey.EMPLOYEES, com.studioops.user.AccessLevel.EDIT);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }
        if (email == null || email.trim().isEmpty()) {
            return null;
        }
        return userRepository.findByEmail(email).orElse(null);
    }
}
