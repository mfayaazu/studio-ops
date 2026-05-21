package com.studioops.auth;

import com.studioops.auth.dto.CurrentUserResponse;
import com.studioops.auth.dto.LoginRequest;
import com.studioops.auth.dto.LoginResponse;
import com.studioops.user.User;
import com.studioops.user.UserStatus;
import com.studioops.user.UserService;
import com.studioops.user.dto.UserResponse;
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

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    public AuthService(AuthenticationManager authenticationManager, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
    }

    public LoginResponse login(LoginRequest request, HttpServletRequest servletRequest, HttpServletResponse servletResponse) {
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
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, servletRequest, servletResponse);

        userService.updateLastLogin(request.getEmail());

        User updatedUser = userService.findUserByEmail(request.getEmail());
        return new LoginResponse("SUCCESS", UserResponse.fromUser(updatedUser));
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
        return new CurrentUserResponse(true, UserResponse.fromUser(user));
    }
}
