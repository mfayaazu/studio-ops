package com.studioops.employee;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantContext;
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

    public EmployeeService(EmployeeRepository employeeRepository, 
                           StudioRepository studioRepository, 
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           TenantContext tenantContext) {
        this.employeeRepository = employeeRepository;
        this.studioRepository = studioRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tenantContext = tenantContext;
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
        if (request.getCreateLogin() != null && request.getCreateLogin()) {
            String loginEmail = request.getLoginEmail() != null && !request.getLoginEmail().trim().isEmpty()
                    ? request.getLoginEmail().trim().toLowerCase()
                    : trimmedEmail;

            if (userRepository.findByEmail(loginEmail).isPresent()) {
                throw new IllegalArgumentException("Login email is already in use");
            }

            UserRole role;
            try {
                role = UserRole.valueOf(request.getUserRole() != null ? request.getUserRole().toUpperCase().trim() : "EMPLOYEE");
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid user role: " + request.getUserRole());
            }

            String tempPass = request.getTemporaryPassword() != null && !request.getTemporaryPassword().trim().isEmpty()
                    ? request.getTemporaryPassword().trim()
                    : "TempPass123!";

            User user = new User();
            user.setEmail(loginEmail);
            user.setPasswordHash(passwordEncoder.encode(tempPass));
            user.setRole(role);
            user.setStatus(UserStatus.ACTIVE);
            user.setStudioId(studioId);
            user.setDisplayName(request.getFullName().trim());
            User savedUser = userRepository.save(user);

            employee.setUserId(savedUser.getId());
        }

        Employee saved = employeeRepository.save(employee);
        return mapToResponse(saved);
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

            if (employee.getUserId() == null) {
                // Create new login user
                if (userRepository.findByEmail(loginEmail).isPresent()) {
                    throw new IllegalArgumentException("Login email is already in use");
                }

                String tempPass = request.getTemporaryPassword() != null && !request.getTemporaryPassword().trim().isEmpty()
                        ? request.getTemporaryPassword().trim()
                        : "TempPass123!";

                User user = new User();
                user.setEmail(loginEmail);
                user.setPasswordHash(passwordEncoder.encode(tempPass));
                user.setRole(role);
                user.setStatus(UserStatus.ACTIVE);
                user.setStudioId(employee.getStudioId());
                user.setDisplayName(request.getFullName().trim());
                User savedUser = userRepository.save(user);

                employee.setUserId(savedUser.getId());
            } else {
                // Update existing login user
                User user = userRepository.findById(employee.getUserId())
                        .orElseThrow(() -> new IllegalArgumentException("Linked user account not found"));

                // If email changed, check uniqueness
                if (!user.getEmail().equalsIgnoreCase(loginEmail)) {
                    if (userRepository.findByEmail(loginEmail).isPresent()) {
                        throw new IllegalArgumentException("Login email is already in use");
                    }
                    user.setEmail(loginEmail);
                }

                user.setRole(role);
                user.setDisplayName(request.getFullName().trim());

                // If password provided, update it
                if (request.getTemporaryPassword() != null && !request.getTemporaryPassword().trim().isEmpty()) {
                    user.setPasswordHash(passwordEncoder.encode(request.getTemporaryPassword().trim()));
                }

                userRepository.save(user);
            }
        }

        Employee updated = employeeRepository.save(employee);
        return mapToResponse(updated);
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
        User currentUser = getCurrentUser();
        if (currentUser != null && currentUser.getRole() != UserRole.OWNER && currentUser.getRole() != UserRole.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Only Owners and Admins can manage employees");
        }
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
