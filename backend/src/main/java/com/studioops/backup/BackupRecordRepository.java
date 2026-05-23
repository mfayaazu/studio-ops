package com.studioops.backup;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BackupRecordRepository extends JpaRepository<BackupRecord, UUID> {

    Optional<BackupRecord> findByIdAndStudioId(UUID id, UUID studioId);

    List<BackupRecord> findAllByStudioId(UUID studioId);

    List<BackupRecord> findByProjectIdAndStudioId(UUID projectId, UUID studioId);

    List<BackupRecord> findByDeliverableIdAndStudioId(UUID deliverableId, UUID studioId);

    List<BackupRecord> findByProjectId(UUID projectId);

    List<BackupRecord> findByDeliverableId(UUID deliverableId);

    @Query("SELECT DISTINCT br.locationType FROM BackupRecord br " +
           "WHERE br.deliverableId = :deliverableId AND br.status = com.studioops.backup.BackupStatus.COMPLETED")
    List<BackupLocationType> findDistinctCompletedLocationTypesByDeliverableId(@Param("deliverableId") UUID deliverableId);

    @Query("SELECT DISTINCT br.locationType FROM BackupRecord br " +
           "WHERE br.deliverableId = :deliverableId AND br.studioId = :studioId AND br.status = com.studioops.backup.BackupStatus.COMPLETED")
    List<BackupLocationType> findDistinctCompletedLocationTypesByDeliverableIdAndStudioId(
        @Param("deliverableId") UUID deliverableId,
        @Param("studioId") UUID studioId
    );

    long countByStatus(BackupStatus status);
}
