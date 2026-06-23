package com.studioops.client;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClientRepository extends JpaRepository<Client, UUID> {

    Optional<Client> findByIdAndStudioId(UUID id, UUID studioId);

    List<Client> findAllByStudioId(UUID studioId);

    @Query("SELECT c FROM Client c WHERE c.studioId = :studioId AND LOWER(TRIM(c.email)) = LOWER(TRIM(:email))")
    List<Client> findByStudioIdAndEmailIgnoreCase(@Param("studioId") UUID studioId, @Param("email") String email);

    @Query("SELECT c FROM Client c WHERE c.studioId = :studioId AND (" +
           "LOWER(c.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.phone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Client> searchClientsByStudio(@Param("studioId") UUID studioId, @Param("search") String search);

    long countByStudioId(UUID studioId);
}
