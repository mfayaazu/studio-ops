package com.studioops.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studioops.auth.dto.LoginRequest;
import com.studioops.auth.dto.SignupRequest;
import com.studioops.studio.Studio;
import com.studioops.studio.StudioRepository;
import com.studioops.studio.StudioStatus;
import com.studioops.studio.SubscriptionPlan;
import com.studioops.studio.SubscriptionStatus;
import com.studioops.user.User;
import com.studioops.user.UserRepository;
import com.studioops.user.UserRole;
import com.studioops.user.UserStatus;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudioRepository studioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Studio testStudio;
    private User disabledUser;

    @BeforeEach
    void setUp() {
        testStudio = new Studio();
        testStudio.setName("Test Auth Studio");
        testStudio.setSlug("test-auth-studio");
        testStudio.setStatus(StudioStatus.ACTIVE);
        testStudio.setSubscriptionPlan(SubscriptionPlan.STARTER);
        testStudio.setSubscriptionStatus(SubscriptionStatus.TRIAL);
        testStudio = studioRepository.save(testStudio);

        // Create a disabled user to test disabled user login block
        disabledUser = new User();
        disabledUser.setStudioId(testStudio.getId());
        disabledUser.setEmail("disabled@studioops.local");
        disabledUser.setPasswordHash(passwordEncoder.encode("Password123!"));
        disabledUser.setRole(UserRole.EMPLOYEE);
        disabledUser.setStatus(UserStatus.DISABLED);
        disabledUser.setDisplayName("Disabled Employee");
        disabledUser = userRepository.save(disabledUser);
    }

    @AfterEach
    void tearDown() {
        if (disabledUser != null && disabledUser.getId() != null) {
            userRepository.findById(disabledUser.getId()).ifPresent(user -> userRepository.delete(user));
        }
        if (testStudio != null && testStudio.getId() != null) {
            studioRepository.findById(testStudio.getId()).ifPresent(studio -> studioRepository.delete(studio));
        }
    }

    @Test
    void login_Success_WithSeedUser() throws Exception {
        LoginRequest request = new LoginRequest("owner@studioops.local", "ChangeMe123!");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.user.email").value("owner@studioops.local"))
                .andExpect(jsonPath("$.user.role").value("OWNER"))
                .andExpect(jsonPath("$.user.displayName").value("Studio Owner"))
                .andExpect(jsonPath("$.user.studioId").value("d3b07384-d113-4952-b1cf-9a993710787e"))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist()) // Verify response safety
                .andReturn();

        MockHttpSession session = (MockHttpSession) result.getRequest().getSession();
        org.junit.jupiter.api.Assertions.assertNotNull(session, "Session should be created and returned");

        // Verify /api/auth/me retrieves user details when session cookie is provided
        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.user.email").value("owner@studioops.local"))
                .andExpect(jsonPath("$.user.role").value("OWNER"))
                .andExpect(jsonPath("$.user.studioId").value("d3b07384-d113-4952-b1cf-9a993710787e"))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist());
    }

    @Test
    void login_Failure_WrongPassword() throws Exception {
        LoginRequest request = new LoginRequest("owner@studioops.local", "WrongPassword!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Bad credentials")); // Standard bad credentials error msg
    }

    @Test
    void login_Failure_DisabledUser() throws Exception {
        LoginRequest request = new LoginRequest("disabled@studioops.local", "Password123!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Forbidden"))
                .andExpect(jsonPath("$.message").value("User account is disabled"));
    }

    @Test
    void me_Unauthenticated() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isForbidden());
    }

    @Test
    void logout_Success_InvalidatesSession() throws Exception {
        LoginRequest request = new LoginRequest("owner@studioops.local", "ChangeMe123!");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession session = (MockHttpSession) result.getRequest().getSession();
        org.junit.jupiter.api.Assertions.assertNotNull(session, "Session should be created and returned");

        // Verify me works initially
        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true));

        // Logout
        mockMvc.perform(post("/api/auth/logout").session(session))
                .andExpect(status().isNoContent());

        // Verify me now returns forbidden/unauthorized
        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isForbidden());
    }

    @Test
    void logout_SafeWithoutSession() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isNoContent());
    }

    @Test
    void signup_And_Approve_Success() throws Exception {
        SignupRequest signupRequest = new SignupRequest(
                "Onboarding Test Studio",
                "Test Onboarding Owner",
                "onboarding@test.local",
                "Password123!",
                "123456",
                "Sweden"
        );

        // 1. Signup
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Beta workspace request submitted"))
                .andExpect(jsonPath("$.studioName").value("Onboarding Test Studio"))
                .andExpect(jsonPath("$.studioStatus").value("PENDING_APPROVAL"))
                .andExpect(jsonPath("$.ownerEmail").value("onboarding@test.local"));

        // Verify user and studio created
        User user = userRepository.findByEmail("onboarding@test.local")
                .orElseThrow(() -> new AssertionError("User should have been created"));
        org.junit.jupiter.api.Assertions.assertNotNull(user.getStudioId());
        
        Studio studio = studioRepository.findById(user.getStudioId())
                .orElseThrow(() -> new AssertionError("Studio should have been created"));
        org.junit.jupiter.api.Assertions.assertEquals("Onboarding Test Studio", studio.getName());
        org.junit.jupiter.api.Assertions.assertEquals(StudioStatus.PENDING_APPROVAL, studio.getStatus());

        // 2. Login as pending user
        LoginRequest loginRequest = new LoginRequest("onboarding@test.local", "Password123!");
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.user.studioStatus").value("PENDING_APPROVAL"))
                .andExpect(jsonPath("$.user.studioName").value("Onboarding Test Studio"))
                .andReturn();

        MockHttpSession session = (MockHttpSession) result.getRequest().getSession();

        // 3. Approve studio
        mockMvc.perform(post("/api/studios/" + studio.getId() + "/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("BETA_ACTIVE"));

        // 4. Verify me endpoint returns BETA_ACTIVE now
        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.user.studioStatus").value("BETA_ACTIVE"));

        // Clean up
        userRepository.delete(user);
        studioRepository.delete(studio);
    }

    @Test
    void changePassword_Success_And_Fails() throws Exception {
        // First login to get a session
        LoginRequest loginRequest = new LoginRequest("owner@studioops.local", "ChangeMe123!");
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();
        MockHttpSession session = (MockHttpSession) result.getRequest().getSession();

        // 1. Change password fails with wrong current password
        com.studioops.auth.dto.ChangePasswordRequest wrongCurrentReq = new com.studioops.auth.dto.ChangePasswordRequest("WrongPass!", "NewPassword123!");
        mockMvc.perform(post("/api/auth/change-password")
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(wrongCurrentReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Current password is incorrect."));

        // 2. Change password fails with too short new password
        com.studioops.auth.dto.ChangePasswordRequest shortNewReq = new com.studioops.auth.dto.ChangePasswordRequest("ChangeMe123!", "short");
        mockMvc.perform(post("/api/auth/change-password")
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(shortNewReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("New password must be at least 8 characters."));

        // 3. Change password succeeds
        com.studioops.auth.dto.ChangePasswordRequest successReq = new com.studioops.auth.dto.ChangePasswordRequest("ChangeMe123!", "NewPassword123!");
        mockMvc.perform(post("/api/auth/change-password")
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(successReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password changed successfully"));

        // 4. Verify we can login with the new password
        LoginRequest newLoginRequest = new LoginRequest("owner@studioops.local", "NewPassword123!");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newLoginRequest)))
                .andExpect(status().isOk());

        // Restore original password for other tests
        User user = userRepository.findByEmail("owner@studioops.local")
                .orElseThrow(() -> new AssertionError("Owner should exist"));
        user.setPasswordHash(passwordEncoder.encode("ChangeMe123!"));
        userRepository.save(user);
    }

    @Test
    void updateProfile_Success() throws Exception {
        LoginRequest loginRequest = new LoginRequest("owner@studioops.local", "ChangeMe123!");
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();
        MockHttpSession session = (MockHttpSession) result.getRequest().getSession();

        com.studioops.auth.dto.UpdateProfileRequest updateReq = new com.studioops.auth.dto.UpdateProfileRequest("New Owner Display Name");
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/auth/me/profile")
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("New Owner Display Name"))
                .andExpect(jsonPath("$.role").value("OWNER"));

        // Restore original display name
        User user = userRepository.findByEmail("owner@studioops.local")
                .orElseThrow(() -> new AssertionError("Owner should exist"));
        user.setDisplayName("Studio Owner");
        userRepository.save(user);
    }

    @Test
    void updateProfile_OnlyUpdatesCurrentUser() throws Exception {
        // Create second user
        User user2 = new User();
        user2.setStudioId(testStudio.getId());
        user2.setEmail("user2@studioops.local");
        user2.setPasswordHash(passwordEncoder.encode("Password123!"));
        user2.setRole(UserRole.EMPLOYEE);
        user2.setStatus(UserStatus.ACTIVE);
        user2.setDisplayName("User Two Original");
        user2 = userRepository.save(user2);

        // Login as owner@studioops.local
        LoginRequest loginRequest = new LoginRequest("owner@studioops.local", "ChangeMe123!");
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();
        MockHttpSession session = (MockHttpSession) result.getRequest().getSession();

        // Update profile
        com.studioops.auth.dto.UpdateProfileRequest updateReq = new com.studioops.auth.dto.UpdateProfileRequest("Owner New Name");
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/auth/me/profile")
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk());

        // Verify owner's name was changed, but user2's name was NOT changed
        User owner = userRepository.findByEmail("owner@studioops.local").orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals("Owner New Name", owner.getDisplayName());
        
        User dbUser2 = userRepository.findByEmail("user2@studioops.local").orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals("User Two Original", dbUser2.getDisplayName());

        // Cleanup
        userRepository.delete(dbUser2);
        owner.setDisplayName("Studio Owner");
        userRepository.save(owner);
    }
}
