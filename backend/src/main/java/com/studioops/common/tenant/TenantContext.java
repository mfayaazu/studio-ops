package com.studioops.common.tenant;

import com.studioops.studio.Studio;
import com.studioops.studio.StudioRepository;
import com.studioops.studio.StudioStatus;
import com.studioops.user.User;
import com.studioops.user.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class TenantContext {

    private final UserRepository userRepository;
    private final StudioRepository studioRepository;

    public TenantContext(UserRepository userRepository, StudioRepository studioRepository) {
        this.userRepository = userRepository;
        this.studioRepository = studioRepository;
    }

    /**
     * Resolves the studio ID for the current context.
     *
     * Behavior:
     * 1. If unauthenticated / anonymous user:
     *    - Returns TenantConstants.DEFAULT_STUDIO_ID (for public/demo/test flows).
     * 2. If authenticated user found:
     *    - Returns user.studioId, unless the studio is PENDING_APPROVAL.
     * 3. If authenticated user not found in database:
     *    - Throws AccessDeniedException.
     * 4. If studio is missing from database:
     *    - Throws AccessDeniedException.
     *
     * @return the resolved studio UUID
     * @throws AccessDeniedException if the user or studio is not found, or is pending approval
     */
    public UUID getCurrentStudioId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            // Fallback for public/demo/test flows
            return TenantConstants.DEFAULT_STUDIO_ID;
        }

        Object principal = authentication.getPrincipal();
        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        if (email == null || email.trim().isEmpty()) {
            return TenantConstants.DEFAULT_STUDIO_ID;
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Authenticated user not found"));

        if (user.getStudioId() == null) {
            throw new AccessDeniedException("User is not associated with any workspace");
        }

        Studio studio = studioRepository.findById(user.getStudioId())
                .orElseThrow(() -> new AccessDeniedException("Associated workspace not found"));

        if (studio.getStatus() == StudioStatus.PENDING_APPROVAL) {
            throw new AccessDeniedException("Workspace approval pending");
        }

        return user.getStudioId();
    }
}
