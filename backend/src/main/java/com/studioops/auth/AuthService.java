package com.studioops.auth;

import com.studioops.auth.dto.*;
import com.studioops.user.User;
import com.studioops.user.UserStatus;
import com.studioops.user.UserService;
import com.studioops.user.dto.UserResponse;
import java.time.Instant;
import java.util.UUID;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;
import jakarta.servlet.http.HttpSession;
import com.studioops.studio.StudioRepository;
import com.studioops.studio.Studio;
import com.studioops.auth.dto.SignupRequest;
import com.studioops.user.UserRepository;
import com.studioops.user.UserRole;
import com.studioops.studio.StudioStatus;
import com.studioops.studio.SubscriptionPlan;
import com.studioops.studio.SubscriptionStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final StudioRepository studioRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.studioops.email.EmailService emailService;
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    @Value("${studioops.platform-admin.emails:a.fayaaz@gmail.com,owner@studioops.local}")
    private List<String> platformAdminEmails;

    public AuthService(AuthenticationManager authenticationManager, 
                       UserService userService, 
                       StudioRepository studioRepository,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       com.studioops.email.EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.studioRepository = studioRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public LoginResponse login(LoginRequest request, HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {
        User user;
        try {
            user = userService.findUserByEmail(request.getEmail());
        } catch (IllegalArgumentException e) {
            throw new org.springframework.security.authentication.BadCredentialsException("Invalid email or password");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new org.springframework.security.authentication.DisabledException("User account is disabled");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, servletRequest, servletResponse);

        userService.updateLastLogin(request.getEmail());

        User updatedUser = userService.findUserByEmail(request.getEmail());
        return new LoginResponse("SUCCESS", mapToUserResponse(updatedUser));
    }

    public void logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
    }

    public CurrentUserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            return new CurrentUserResponse(false, null);
        }

        Object principal = authentication.getPrincipal();
        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        User user = userService.findUserByEmail(email);
        return new CurrentUserResponse(true, mapToUserResponse(user));
    }

    private UserResponse mapToUserResponse(User user) {
        UserResponse response = UserResponse.fromUser(user);
        if (response != null) {
            boolean isPlatformAdmin = platformAdminEmails != null &&
                platformAdminEmails.stream().anyMatch(email -> email.trim().equalsIgnoreCase(user.getEmail().trim()));
            response.setIsPlatformAdmin(isPlatformAdmin);
            
            if (user.getStudioId() != null) {
                studioRepository.findById(user.getStudioId()).ifPresent(studio -> {
                    response.setStudioName(studio.getName());
                    response.setStudioStatus(studio.getStatus().name());
                });
            }
        }
        return response;
    }

    @Transactional
    public com.studioops.auth.dto.SignupResponse signup(SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already registered");
        }

        // Create Studio
        Studio studio = new Studio();
        studio.setName(request.getStudioName());
        studio.setSlug(generateSlug(request.getStudioName()));
        studio.setBusinessEmail(request.getEmail());
        studio.setPhone(request.getPhone());
        studio.setCountry(request.getCountry());
        studio.setStatus(StudioStatus.PENDING_APPROVAL);
        studio.setSubscriptionPlan(SubscriptionPlan.STARTER);
        studio.setSubscriptionStatus(SubscriptionStatus.TRIAL);
        
        Studio savedStudio = studioRepository.save(studio);

        // Create User
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setDisplayName(request.getOwnerName());
        user.setRole(UserRole.OWNER);
        user.setStatus(UserStatus.ACTIVE);
        user.setStudioId(savedStudio.getId());

        userRepository.save(user);

        // Future: replace email-only notification with StudioOps Platform Admin Console and subscription approval workflow.
        emailService.sendPlatformBetaSignupNotification(savedStudio, user);

        return new com.studioops.auth.dto.SignupResponse(
            "Beta workspace request submitted",
            savedStudio.getId(),
            savedStudio.getName(),
            savedStudio.getStatus().name(),
            user.getEmail()
        );
    }

    private String generateSlug(String studioName) {
        String baseSlug = studioName.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
        if (baseSlug.isEmpty()) {
            baseSlug = "studio";
        }
        
        // Ensure uniqueness
        String slug = baseSlug;
        int counter = 1;
        while (studioRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }
        return slug;
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String trimmedEmail = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(trimmedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Email address not found: " + trimmedEmail));

        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        user.setPasswordResetTokenExpiresAt(Instant.now().plus(java.time.Duration.ofHours(1))); // 1 hour expiration
        userRepository.save(user);

        try {
            emailService.sendPasswordResetEmail(user, token);
        } catch (Exception e) {
            log.warn("Failed to send password reset email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset token"));

        if (user.getPasswordResetTokenExpiresAt() == null || Instant.now().isAfter(user.getPasswordResetTokenExpiresAt())) {
            throw new IllegalArgumentException("Password reset token has expired");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getPassword().trim()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiresAt(null);
        userRepository.save(user);
    }

    @Transactional
    public void acceptInvite(AcceptInviteRequest request) {
        User user = userRepository.findByInviteToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired account invite token"));

        if (user.getInviteTokenExpiresAt() == null || Instant.now().isAfter(user.getInviteTokenExpiresAt())) {
            throw new IllegalArgumentException("Invite token has expired");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getPassword().trim()));
        user.setInviteToken(null);
        user.setInviteTokenExpiresAt(null);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        User user = getAuthenticatedUser();
        user.setDisplayName(request.getDisplayName().trim());
        User saved = userRepository.save(user);
        return mapToUserResponse(saved);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = getAuthenticatedUser();
        
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }
        
        String newPassword = request.getNewPassword();
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters.");
        }
        
        user.setPasswordHash(passwordEncoder.encode(newPassword.trim()));
        userRepository.save(user);
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            throw new org.springframework.security.access.AccessDeniedException("User is not authenticated");
        }
        Object principal = authentication.getPrincipal();
        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }
        return userService.findUserByEmail(email);
    }
}
