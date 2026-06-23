package com.studioops.project;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {

    Optional<Project> findByIdAndStudioId(UUID id, UUID studioId);

    List<Project> findAllByStudioId(UUID studioId);

    @Query("SELECT p FROM Project p WHERE p.studioId = :studioId AND (" +
           "LOWER(p.projectCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.projectType) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(STR(p.status)) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(STR(p.bookingStatus)) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(STR(p.paymentStatus)) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Project> searchProjectsByStudio(@Param("studioId") UUID studioId, @Param("search") String search);

    Optional<Project> findByProjectCode(String projectCode);

    Optional<Project> findByStudioIdAndProjectCode(UUID studioId, String projectCode);

    @Query("SELECT p.projectCode FROM Project p WHERE p.studioId = :studioId AND p.projectCode LIKE :prefixPattern")
    List<String> findProjectCodesByStudioAndPattern(@Param("studioId") UUID studioId, @Param("prefixPattern") String prefixPattern);

    @Query("SELECT p FROM Project p WHERE " +
           "LOWER(p.projectCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.projectType) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(STR(p.status)) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(STR(p.bookingStatus)) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(STR(p.paymentStatus)) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Project> searchProjects(@Param("search") String search);

    long countByStatusNotIn(java.util.Collection<ProjectStatus> statuses);

    long countByStudioId(UUID studioId);

    long countByStatusNotInAndStudioId(java.util.Collection<ProjectStatus> statuses, UUID studioId);
}
