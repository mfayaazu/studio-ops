package com.studioops.studio;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface StudioRepository extends JpaRepository<Studio, UUID> {

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, UUID id);

    @Query("SELECT s FROM Studio s WHERE " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.slug) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "(s.businessEmail IS NOT NULL AND LOWER(s.businessEmail) LIKE LOWER(CONCAT('%', :search, '%'))) OR " +
           "(s.phone IS NOT NULL AND LOWER(s.phone) LIKE LOWER(CONCAT('%', :search, '%'))) OR " +
           "(s.country IS NOT NULL AND LOWER(s.country) LIKE LOWER(CONCAT('%', :search, '%'))) OR " +
           "LOWER(CAST(s.subscriptionPlan AS string)) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(CAST(s.subscriptionStatus AS string)) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Studio> searchStudios(@Param("search") String search);
}
