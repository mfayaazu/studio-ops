package com.studioops.project;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {

    Optional<Project> findByProjectCode(String projectCode);

    @Query("SELECT p FROM Project p WHERE " +
           "LOWER(p.projectCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.projectType) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(STR(p.status)) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(STR(p.bookingStatus)) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(STR(p.paymentStatus)) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Project> searchProjects(@Param("search") String search);

    long countByStatusNotIn(java.util.Collection<ProjectStatus> statuses);
}
