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

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@Valid @RequestBody SignupRequest request) {
        authService.signup(request);
        return ResponseEntity.ok().build();
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

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        authService.logout(request);
        return ResponseEntity.noContent().build();
    }
}
