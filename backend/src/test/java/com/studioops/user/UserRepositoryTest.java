package com.studioops.user;

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

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
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
    }

    @Test
    void findByEmail_Success() {
        Optional<User> found = userRepository.findByEmail("test-repo@studioops.local");
        assertTrue(found.isPresent());
        assertEquals(testUser.getId(), found.get().getId());
        assertEquals("Test Repo User", found.get().getDisplayName());
    }

    @Test
    void uniqueEmailConstraint_ThrowsException() {
        User duplicateUser = new User();
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
