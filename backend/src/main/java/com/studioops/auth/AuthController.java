package com.studioops.auth;

import com.studioops.auth.dto.CurrentUserResponse;
import com.studioops.auth.dto.LoginRequest;
import com.studioops.auth.dto.LoginResponse;
import com.studioops.auth.dto.SignupRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final com.studioops.user.PermissionService permissionService;

    public AuthController(AuthService authService, com.studioops.user.PermissionService permissionService) {
        this.authService = authService;
        this.permissionService = permissionService;
    }

    @PostMapping("/signup")
    public ResponseEntity<com.studioops.auth.dto.SignupResponse> signup(@Valid @RequestBody SignupRequest request) {
        com.studioops.auth.dto.SignupResponse response = authService.signup(request);
        return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {
        return ResponseEntity.ok(authService.login(request, servletRequest, servletResponse));
    }

    @GetMapping("/me")
    public ResponseEntity<CurrentUserResponse> me() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }

    @GetMapping("/me/permissions")
    public ResponseEntity<com.studioops.user.dto.UserEffectivePermissionResponse> mePermissions() {
        com.studioops.user.User currentUser = permissionService.getCurrentUser();
        return ResponseEntity.ok(permissionService.getEffectivePermissions(currentUser.getId()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        authService.logout(request);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/me/profile")
    public ResponseEntity<com.studioops.user.dto.UserResponse> updateProfile(
            @Valid @RequestBody com.studioops.auth.dto.UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<java.util.Map<String, String>> changePassword(
            @Valid @RequestBody com.studioops.auth.dto.ChangePasswordRequest request) {
        authService.changePassword(request);
        return ResponseEntity.ok(java.util.Map.of("message", "Password changed successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody com.studioops.auth.dto.ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody com.studioops.auth.dto.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/accept-invite")
    public ResponseEntity<Void> acceptInvite(@Valid @RequestBody com.studioops.auth.dto.AcceptInviteRequest request) {
        authService.acceptInvite(request);
        return ResponseEntity.ok().build();
    }
}
