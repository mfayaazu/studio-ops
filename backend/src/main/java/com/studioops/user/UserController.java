package com.studioops.user;

import com.studioops.user.dto.UserResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final PermissionService permissionService;

    public UserController(UserService userService, PermissionService permissionService) {
        this.userService = userService;
        this.permissionService = permissionService;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> listUsers() {
        return ResponseEntity.ok(userService.listAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(userService.getUserById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{userId}/permissions")
    public ResponseEntity<com.studioops.user.dto.UserEffectivePermissionResponse> getUserPermissions(@PathVariable UUID userId) {
        return ResponseEntity.ok(permissionService.getEffectivePermissions(userId));
    }

    @PutMapping("/{userId}/permissions")
    public ResponseEntity<Void> updateUserPermissions(
            @PathVariable UUID userId,
            @jakarta.validation.Valid @RequestBody List<com.studioops.user.dto.UserPagePermissionUpsertRequest> requests) {
        User currentUser = permissionService.getCurrentUser();
        permissionService.upsertPermissions(userId, requests, currentUser.getId());
        return ResponseEntity.ok().build();
    }
}
