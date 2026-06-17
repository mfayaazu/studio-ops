package com.studioops.platformadmin;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.email.EmailService;
import com.studioops.email.SesVerificationService;
import com.studioops.platformadmin.dto.PlatformStudioResponse;
import com.studioops.studio.Studio;
import com.studioops.studio.StudioRepository;
import com.studioops.studio.StudioStatus;
import com.studioops.studio.SubscriptionStatus;
import com.studioops.user.User;
import com.studioops.user.UserRepository;
import com.studioops.user.UserRole;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PlatformAdminService {

    private static final Logger log = LoggerFactory.getLogger(PlatformAdminService.class);

    private final StudioRepository studioRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SesVerificationService sesVerificationService;

    @Value("${studioops.platform-admin.emails:a.fayaaz@gmail.com,owner@studioops.local}")
    private List<String> platformAdminEmails;

    public PlatformAdminService(StudioRepository studioRepository, UserRepository userRepository, EmailService emailService, SesVerificationService sesVerificationService) {
        this.studioRepository = studioRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.sesVerificationService = sesVerificationService;
    }

    public void checkPlatformAdminAccess() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AccessDeniedException("User is unauthenticated");
        }

        Object principal = authentication.getPrincipal();
        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        if (email == null || email.trim().isEmpty()) {
            throw new AccessDeniedException("Invalid session context");
        }

        boolean authorized = platformAdminEmails != null &&
                platformAdminEmails.stream()
                        .anyMatch(adminEmail -> adminEmail.trim().equalsIgnoreCase(email.trim()));

        if (!authorized) {
            throw new AccessDeniedException("User is not authorized as platform admin");
        }
    }

    @Transactional(readOnly = true)
    public List<PlatformStudioResponse> listStudios() {
        checkPlatformAdminAccess();
        return studioRepository.findAll().stream()
                .map(this::mapToPlatformStudioResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PlatformStudioResponse> listPendingStudios() {
        checkPlatformAdminAccess();
        return studioRepository.findAll().stream()
                .filter(studio -> studio.getStatus() == StudioStatus.PENDING_APPROVAL)
                .map(this::mapToPlatformStudioResponse)
                .collect(Collectors.toList());
    }

    public PlatformStudioResponse approveStudio(UUID studioId) {
        checkPlatformAdminAccess();
        Studio studio = studioRepository.findById(studioId)
                .orElseThrow(() -> new ResourceNotFoundException("Studio not found"));

        studio.setStatus(StudioStatus.BETA_ACTIVE);
        studio.setSubscriptionStatus(SubscriptionStatus.TRIAL);
        Studio saved = studioRepository.save(studio);

        // Send email to owner
        List<User> owners = userRepository.findByStudioIdAndRole(studioId, UserRole.OWNER);
        if (!owners.isEmpty()) {
            User owner = owners.get(0);
            try {
                emailService.sendStudioApprovedEmail(owner, studio.getName());
            } catch (Exception e) {
                log.warn("Failed to send approval email to owner: {}. Error: {}", owner.getEmail(), e.getMessage());
            }
        } else {
            log.warn("No owner user found for studio: {}. Skipping approval email.", studio.getName());
        }

        return mapToPlatformStudioResponse(saved);
    }
    public PlatformStudioResponse rejectStudio(UUID studioId) {
        checkPlatformAdminAccess();
        Studio studio = studioRepository.findById(studioId)
                .orElseThrow(() -> new ResourceNotFoundException("Studio not found"));

        // Reject sets status to SUSPENDED as PENDING_APPROVAL -> SUSPENDED is the closest available state.
        // Future: replace email-only notification with StudioOps Platform Admin Console and subscription approval workflow.
        studio.setStatus(StudioStatus.SUSPENDED);
        Studio saved = studioRepository.save(studio);

        // Send email to owner
        List<User> owners = userRepository.findByStudioIdAndRole(studioId, UserRole.OWNER);
        if (!owners.isEmpty()) {
            User owner = owners.get(0);
            try {
                emailService.sendStudioRejectedEmail(owner, studio.getName());
            } catch (Exception e) {
                log.warn("Failed to send rejection email to owner: {}. Error: {}", owner.getEmail(), e.getMessage());
            }
        } else {
            log.warn("No owner user found for studio: {}. Skipping rejection email.", studio.getName());
        }

        return mapToPlatformStudioResponse(saved);
    }

    public PlatformStudioResponse suspendStudio(UUID studioId) {
        checkPlatformAdminAccess();
        Studio studio = studioRepository.findById(studioId)
                .orElseThrow(() -> new ResourceNotFoundException("Studio not found"));

        studio.setStatus(StudioStatus.SUSPENDED);
        Studio saved = studioRepository.save(studio);
        return mapToPlatformStudioResponse(saved);
    }

    public void resendSesVerification(UUID studioId) {
        checkPlatformAdminAccess();
        Studio studio = studioRepository.findById(studioId)
                .orElseThrow(() -> new ResourceNotFoundException("Studio not found"));
        List<User> owners = userRepository.findByStudioIdAndRole(studioId, UserRole.OWNER);
        if (owners.isEmpty()) {
            throw new ResourceNotFoundException("Owner user not found for studio");
        }
        User owner = owners.get(0);
        sesVerificationService.requestEmailVerification(owner.getEmail(), studioId, owner.getId());
    }

    private PlatformStudioResponse mapToPlatformStudioResponse(Studio studio) {
        PlatformStudioResponse response = new PlatformStudioResponse();
        response.setId(studio.getId());
        response.setName(studio.getName());
        response.setSlug(studio.getSlug());
        response.setStatus(studio.getStatus());
        response.setSubscriptionPlan(studio.getSubscriptionPlan());
        response.setSubscriptionStatus(studio.getSubscriptionStatus());
        response.setPhone(studio.getPhone());
        response.setCountry(studio.getCountry());
        response.setCreatedAt(studio.getCreatedAt());

        List<User> owners = userRepository.findByStudioIdAndRole(studio.getId(), UserRole.OWNER);
        if (!owners.isEmpty()) {
            User owner = owners.get(0);
            response.setOwnerName(owner.getDisplayName());
            response.setOwnerEmail(owner.getEmail());
            response.setOwnerEmailVerificationStatus(sesVerificationService.getEmailVerificationStatus(owner.getEmail()));
        } else {
            response.setOwnerName("N/A");
            response.setOwnerEmail("N/A");
            response.setOwnerEmailVerificationStatus("UNKNOWN");
        }

        return response;
    }
}
