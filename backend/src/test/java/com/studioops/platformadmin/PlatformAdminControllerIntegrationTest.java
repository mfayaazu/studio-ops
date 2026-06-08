package com.studioops.platformadmin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studioops.auth.dto.LoginRequest;
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
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Arrays;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PlatformAdminControllerIntegrationTest {

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

    @Autowired
    private PlatformAdminService platformAdminService;

    private Studio testStudio;
    private User platformAdminUser;
    private User regularOwnerUser;
    private Studio pendingStudio;
    private User pendingOwnerUser;

    @BeforeEach
    void setUp() {
        // Dynamically override configured platform admin emails list for testing isolation
        ReflectionTestUtils.setField(
                platformAdminService,
                "platformAdminEmails",
                Arrays.asList("platform-admin-test@studioops.local")
        );

        // Create test studio with a unique slug
        testStudio = new Studio();
        testStudio.setName("Platform Admin Test Studio");
        testStudio.setSlug("pa-test-studio-unique");
        testStudio.setStatus(StudioStatus.ACTIVE);
        testStudio.setSubscriptionPlan(SubscriptionPlan.STARTER);
        testStudio.setSubscriptionStatus(SubscriptionStatus.TRIAL);
        testStudio = studioRepository.save(testStudio);

        // Platform Admin User with isolated email
        platformAdminUser = new User();
        platformAdminUser.setStudioId(testStudio.getId());
        platformAdminUser.setEmail("platform-admin-test@studioops.local");
        platformAdminUser.setPasswordHash(passwordEncoder.encode("ChangeMe123!"));
        platformAdminUser.setRole(UserRole.OWNER);
        platformAdminUser.setStatus(UserStatus.ACTIVE);
        platformAdminUser.setDisplayName("Platform Admin");
        platformAdminUser = userRepository.save(platformAdminUser);

        // Regular Non-Admin Owner User
        regularOwnerUser = new User();
        regularOwnerUser.setStudioId(testStudio.getId());
        regularOwnerUser.setEmail("regular-owner-test@studioops.local");
        regularOwnerUser.setPasswordHash(passwordEncoder.encode("Password123!"));
        regularOwnerUser.setRole(UserRole.OWNER);
        regularOwnerUser.setStatus(UserStatus.ACTIVE);
        regularOwnerUser.setDisplayName("Regular Owner");
        regularOwnerUser = userRepository.save(regularOwnerUser);

        // Pending Studio for approval tests
        pendingStudio = new Studio();
        pendingStudio.setName("Pending Test Studio");
        pendingStudio.setSlug("pending-test-studio-unique");
        pendingStudio.setStatus(StudioStatus.PENDING_APPROVAL);
        pendingStudio.setSubscriptionPlan(SubscriptionPlan.STARTER);
        pendingStudio.setSubscriptionStatus(SubscriptionStatus.TRIAL);
        pendingStudio = studioRepository.save(pendingStudio);

        pendingOwnerUser = new User();
        pendingOwnerUser.setStudioId(pendingStudio.getId());
        pendingOwnerUser.setEmail("pending-owner-test@test.local");
        pendingOwnerUser.setPasswordHash(passwordEncoder.encode("Password123!"));
        pendingOwnerUser.setRole(UserRole.OWNER);
        pendingOwnerUser.setStatus(UserStatus.ACTIVE);
        pendingOwnerUser.setDisplayName("Pending Owner");
        pendingOwnerUser = userRepository.save(pendingOwnerUser);
    }

    @AfterEach
    void tearDown() {
        // Delete users first due to FK constraint on user_id
        if (platformAdminUser != null && platformAdminUser.getId() != null) {
            userRepository.delete(platformAdminUser);
        }
        if (regularOwnerUser != null && regularOwnerUser.getId() != null) {
            userRepository.delete(regularOwnerUser);
        }
        if (pendingOwnerUser != null && pendingOwnerUser.getId() != null) {
            userRepository.delete(pendingOwnerUser);
        }
        if (testStudio != null && testStudio.getId() != null) {
            studioRepository.delete(testStudio);
        }
        if (pendingStudio != null && pendingStudio.getId() != null) {
            studioRepository.delete(pendingStudio);
        }
    }

    private MockHttpSession loginAs(String email, String password) throws Exception {
        LoginRequest loginRequest = new LoginRequest(email, password);
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();
        return (MockHttpSession) result.getRequest().getSession();
    }

    @Test
    void platformAdmin_CanListStudios_AndPendingStudios() throws Exception {
        MockHttpSession adminSession = loginAs("platform-admin-test@studioops.local", "ChangeMe123!");

        mockMvc.perform(get("/api/platform-admin/studios").session(adminSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[?(@.slug == 'pending-test-studio-unique')].ownerEmail").value("pending-owner-test@test.local"));

        mockMvc.perform(get("/api/platform-admin/studios/pending").session(adminSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[?(@.slug == 'pending-test-studio-unique')].status").value("PENDING_APPROVAL"));
    }

    @Test
    void platformAdmin_CanApproveStudio() throws Exception {
        MockHttpSession adminSession = loginAs("platform-admin-test@studioops.local", "ChangeMe123!");

        mockMvc.perform(post("/api/platform-admin/studios/" + pendingStudio.getId() + "/approve").session(adminSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("BETA_ACTIVE"))
                .andExpect(jsonPath("$.subscriptionStatus").value("TRIAL"));

        Studio updated = studioRepository.findById(pendingStudio.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(StudioStatus.BETA_ACTIVE, updated.getStatus());
    }

    @Test
    void platformAdmin_CanRejectStudio_AndSuspendStudio() throws Exception {
        MockHttpSession adminSession = loginAs("platform-admin-test@studioops.local", "ChangeMe123!");

        mockMvc.perform(post("/api/platform-admin/studios/" + pendingStudio.getId() + "/reject").session(adminSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUSPENDED"));

        Studio updated = studioRepository.findById(pendingStudio.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(StudioStatus.SUSPENDED, updated.getStatus());

        // Suspend
        mockMvc.perform(post("/api/platform-admin/studios/" + testStudio.getId() + "/suspend").session(adminSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUSPENDED"));
    }

    @Test
    void regularOwner_CannotAccessPlatformAdmin_Returns403() throws Exception {
        MockHttpSession userSession = loginAs("regular-owner-test@studioops.local", "Password123!");

        mockMvc.perform(get("/api/platform-admin/studios").session(userSession))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/platform-admin/studios/" + pendingStudio.getId() + "/approve").session(userSession))
                .andExpect(status().isForbidden());
    }

    @Test
    void unauthenticated_CannotAccessPlatformAdmin_Returns403() throws Exception {
        mockMvc.perform(get("/api/platform-admin/studios"))
                .andExpect(status().isForbidden());
    }
}
