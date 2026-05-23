package com.studioops.deliverable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeliverableRepository extends JpaRepository<Deliverable, UUID> {
    List<Deliverable> findByProjectId(UUID projectId);

    Optional<Deliverable> findByIdAndStudioId(UUID id, UUID studioId);
    List<Deliverable> findAllByStudioId(UUID studioId);
    List<Deliverable> findByProjectIdAndStudioId(UUID projectId, UUID studioId);
}
