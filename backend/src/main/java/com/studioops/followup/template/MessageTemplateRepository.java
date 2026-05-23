package com.studioops.followup.template;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MessageTemplateRepository extends JpaRepository<MessageTemplate, UUID> {

    Optional<MessageTemplate> findByIdAndStudioId(UUID id, UUID studioId);

    List<MessageTemplate> findAllByStudioId(UUID studioId);

    @Query("SELECT m FROM MessageTemplate m WHERE m.studioId = :studioId AND (" +
           "LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.subject) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.body) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(STR(m.channel)) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(STR(m.templateType)) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<MessageTemplate> searchByStudioId(@Param("studioId") UUID studioId, @Param("search") String search);

    boolean existsByStudioIdAndNameIgnoreCaseAndChannel(UUID studioId, String name, CommunicationChannel channel);

    boolean existsByStudioIdAndNameIgnoreCaseAndChannelAndIdNot(UUID studioId, String name, CommunicationChannel channel, UUID id);
}
