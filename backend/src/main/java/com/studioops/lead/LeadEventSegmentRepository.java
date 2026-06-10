package com.studioops.lead;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface LeadEventSegmentRepository extends JpaRepository<LeadEventSegment, UUID> {
}
