package com.studioops.user;

import com.studioops.studio.Studio;
import com.studioops.studio.StudioRepository;
import com.studioops.studio.StudioStatus;
import com.studioops.studio.SubscriptionPlan;
import com.studioops.studio.SubscriptionStatus;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudioRepository studioRepository;

    private Studio testStudio;
    private User testUser;

    @BeforeEach
    void setUp() {
        testStudio = new Studio();
        testStudio.setName("Test Repo Studio");
        testStudio.setSlug("test-repo-studio");
        testStudio.setStatus(StudioStatus.ACTIVE);
        testStudio.setSubscriptionPlan(SubscriptionPlan.STARTER);
        testStudio.setSubscriptionStatus(SubscriptionStatus.TRIAL);
        testStudio = studioRepository.save(testStudio);

        testUser = new User();
        testUser.setStudioId(testStudio.getId());
        testUser.setEmail("test-repo@studioops.local");
        testUser.setPasswordHash("$2a$10$H6vsjg5UAjHWeYnf0KQqEem8iQq9DzmsfjWinD3Jfn/w2AF/rNjo.");
        testUser.setRole(UserRole.EMPLOYEE);
        testUser.setStatus(UserStatus.ACTIVE);
        testUser.setDisplayName("Test Repo User");
        testUser = userRepository.save(testUser);
    }

    @AfterEach
    void tearDown() {
        if (testUser != null && testUser.getId() != null) {
            userRepository.findById(testUser.getId()).ifPresent(user -> userRepository.delete(user));
        }
        if (testStudio != null && testStudio.getId() != null) {
            studioRepository.findById(testStudio.getId()).ifPresent(studio -> studioRepository.delete(studio));
        }
    }

    @Test
    void findByEmail_Success() {
        Optional<User> found = userRepository.findByEmail("test-repo@studioops.local");
        assertTrue(found.isPresent());
        assertEquals(testUser.getId(), found.get().getId());
        assertEquals("Test Repo User", found.get().getDisplayName());
        assertEquals(testStudio.getId(), found.get().getStudioId());
    }

    @Test
    void uniqueEmailConstraint_ThrowsException() {
        User duplicateUser = new User();
        duplicateUser.setStudioId(testStudio.getId());
        duplicateUser.setEmail("test-repo@studioops.local"); // Duplicate email
        duplicateUser.setPasswordHash("somehash");
        duplicateUser.setRole(UserRole.EDITOR);
        duplicateUser.setStatus(UserStatus.ACTIVE);
        duplicateUser.setDisplayName("Duplicate User");

        assertThrows(DataIntegrityViolationException.class, () -> {
            userRepository.saveAndFlush(duplicateUser);
        });
    }
}
