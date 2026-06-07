package com.studioops.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserPagePermissionRepository extends JpaRepository<UserPagePermission, UUID> {
    List<UserPagePermission> findAllByUserIdAndStudioId(UUID userId, UUID studioId);
    Optional<UserPagePermission> findByUserIdAndPageKeyAndStudioId(UUID userId, PageKey pageKey, UUID studioId);
    void deleteAllByUserIdAndStudioId(UUID userId, UUID studioId);
}
