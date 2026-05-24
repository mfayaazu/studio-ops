package com.studioops.followup.log;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommunicationLogRepository extends JpaRepository<CommunicationLog, UUID> {

    Optional<CommunicationLog> findByIdAndStudioId(UUID id, UUID studioId);

    List<CommunicationLog> findAllByStudioId(UUID studioId);

    List<CommunicationLog> findByProjectIdAndStudioId(UUID projectId, UUID studioId);

    List<CommunicationLog> findByClientIdAndStudioId(UUID clientId, UUID studioId);

    List<CommunicationLog> findByFollowUpTaskIdAndStudioId(UUID followUpTaskId, UUID studioId);
}
