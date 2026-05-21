package com.studioops.backup;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface BackupRecordRepository extends JpaRepository<BackupRecord, UUID> {

    List<BackupRecord> findByProjectId(UUID projectId);

    List<BackupRecord> findByDeliverableId(UUID deliverableId);

    @Query("SELECT DISTINCT br.locationType FROM BackupRecord br " +
           "WHERE br.deliverableId = :deliverableId AND br.status = com.studioops.backup.BackupStatus.COMPLETED")
    List<BackupLocationType> findDistinctCompletedLocationTypesByDeliverableId(@Param("deliverableId") UUID deliverableId);

    long countByStatus(BackupStatus status);
}
