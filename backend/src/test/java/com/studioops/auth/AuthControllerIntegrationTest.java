package com.studioops.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studioops.auth.dto.LoginRequest;
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
    private PasswordEncoder passwordEncoder;

    private User disabledUser;

    @BeforeEach
    void setUp() {
        // Create a disabled user to test disabled user login block
        disabledUser = new User();
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
}
