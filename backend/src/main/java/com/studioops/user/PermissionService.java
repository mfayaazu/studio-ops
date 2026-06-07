package com.studioops.user;

import com.studioops.common.tenant.TenantContext;
import com.studioops.user.dto.UserEffectivePermissionResponse;
import com.studioops.user.dto.UserPagePermissionResponse;
import com.studioops.user.dto.UserPagePermissionUpsertRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PermissionService {

    private final UserRepository userRepository;
    private final UserPagePermissionRepository userPagePermissionRepository;
    private final TenantContext tenantContext;

    public PermissionService(
            UserRepository userRepository,
            UserPagePermissionRepository userPagePermissionRepository,
            TenantContext tenantContext) {
        this.userRepository = userRepository;
        this.userPagePermissionRepository = userPagePermissionRepository;
        this.tenantContext = tenantContext;
    }

    public Map<PageKey, AccessLevel> getRoleDefaults(UserRole role) {
        Map<PageKey, AccessLevel> defaults = new EnumMap<>(PageKey.class);
        
        // Initialize all to NONE
        for (PageKey key : PageKey.values()) {
            defaults.put(key, AccessLevel.NONE);
        }

        switch (role) {
            case OWNER:
            case ADMIN:
                // OWNER and ADMIN get EDIT on all pages
                for (PageKey key : PageKey.values()) {
                    defaults.put(key, AccessLevel.EDIT);
                }
                break;

            case PROJECT_MANAGER:
                defaults.put(PageKey.DASHBOARD, AccessLevel.EDIT);
                defaults.put(PageKey.FOLLOW_UP_CENTER, AccessLevel.EDIT);
                defaults.put(PageKey.CLIENTS, AccessLevel.EDIT);
                defaults.put(PageKey.QUOTATIONS, AccessLevel.VIEW); // PM gets VIEW by default
                defaults.put(PageKey.PROJECTS, AccessLevel.EDIT);
                defaults.put(PageKey.EVENTS, AccessLevel.EDIT);
                defaults.put(PageKey.DELIVERABLES, AccessLevel.EDIT);
                defaults.put(PageKey.BACKUP, AccessLevel.EDIT);
                defaults.put(PageKey.POST_PRODUCTION, AccessLevel.EDIT);
                defaults.put(PageKey.EMPLOYEES, AccessLevel.NONE); // PM cannot manage employees
                break;

            case EDITOR:
                defaults.put(PageKey.EVENTS, AccessLevel.EDIT);
                defaults.put(PageKey.DELIVERABLES, AccessLevel.EDIT);
                defaults.put(PageKey.POST_PRODUCTION, AccessLevel.EDIT);
                break;

            case EMPLOYEE:
                defaults.put(PageKey.EVENTS, AccessLevel.VIEW);
                break;
        }

        return defaults;
    }

    public UserEffectivePermissionResponse getEffectivePermissions(UUID userId) {
        UUID studioId = tenantContext.getCurrentStudioId();
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.getStudioId().equals(studioId)) {
            throw new AccessDeniedException("User does not belong to your studio");
        }

        // Fetch overrides
        List<UserPagePermission> overrides = userPagePermissionRepository.findAllByUserIdAndStudioId(userId, studioId);
        List<UserPagePermissionResponse> overrideResponses = overrides.stream()
                .map(o -> new UserPagePermissionResponse(o.getPageKey(), o.getAccessLevel()))
                .collect(Collectors.toList());

        // Resolve effective permissions
        Map<PageKey, AccessLevel> effective = new EnumMap<>(PageKey.class);

        if (user.getRole() == UserRole.OWNER) {
            // OWNER cannot be downgraded or restricted
            for (PageKey key : PageKey.values()) {
                effective.put(key, AccessLevel.EDIT);
            }
        } else {
            // Start with role defaults
            Map<PageKey, AccessLevel> defaults = getRoleDefaults(user.getRole());
            effective.putAll(defaults);

            // Apply database overrides
            for (UserPagePermission op : overrides) {
                effective.put(op.getPageKey(), op.getAccessLevel());
            }
        }

        return new UserEffectivePermissionResponse(userId, overrideResponses, effective);
    }

    @Transactional
    public void upsertPermissions(UUID targetUserId, List<UserPagePermissionUpsertRequest> requests, UUID currentUserId) {
        UUID studioId = tenantContext.getCurrentStudioId();

        User current = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("Requester not found"));

        if (current.getRole() != UserRole.OWNER && current.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Only OWNER or ADMIN can manage permissions");
        }

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("Target user not found"));

        if (!target.getStudioId().equals(studioId)) {
            throw new AccessDeniedException("Target user does not belong to your studio");
        }

        if (targetUserId.equals(currentUserId)) {
            throw new IllegalArgumentException("Cannot modify your own permissions");
        }

        if (target.getRole() == UserRole.OWNER) {
            throw new IllegalArgumentException("Cannot modify permissions of an OWNER");
        }

        // Delete all old overrides for the target user in this studio
        userPagePermissionRepository.deleteAllByUserIdAndStudioId(targetUserId, studioId);

        // Save new overrides
        for (UserPagePermissionUpsertRequest request : requests) {
            UserPagePermission permission = new UserPagePermission();
            permission.setStudioId(studioId);
            permission.setUserId(targetUserId);
            permission.setPageKey(request.getPageKey());
            permission.setAccessLevel(request.getAccessLevel());
            userPagePermissionRepository.save(permission);
        }
    }

    public boolean hasAccess(UUID userId, PageKey pageKey, AccessLevel requiredLevel) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() == UserRole.OWNER) {
            return true; // OWNER always has EDIT (which includes VIEW)
        }

        // Fetch user override
        UUID studioId = user.getStudioId();
        Optional<UserPagePermission> override = userPagePermissionRepository
                .findByUserIdAndPageKeyAndStudioId(userId, pageKey, studioId);

        AccessLevel resolved;
        if (override.isPresent()) {
            resolved = override.get().getAccessLevel();
        } else {
            resolved = getRoleDefaults(user.getRole()).get(pageKey);
        }

        if (requiredLevel == AccessLevel.EDIT) {
            return resolved == AccessLevel.EDIT;
        } else if (requiredLevel == AccessLevel.VIEW) {
            return resolved == AccessLevel.VIEW || resolved == AccessLevel.EDIT;
        }
        return true;
    }

    public void checkPermission(PageKey pageKey, AccessLevel requiredLevel) {
        User user = getCurrentUser();
        if (!hasAccess(user.getId(), pageKey, requiredLevel)) {
            throw new AccessDeniedException("Insufficient page permission: " + pageKey + " " + requiredLevel);
        }
    }

    public User getCurrentUser() {
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

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Authenticated user not found"));
    }
}
