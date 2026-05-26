package com.studioops.quotation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, UUID> {

    Optional<Quotation> findByIdAndStudioId(UUID id, UUID studioId);

    List<Quotation> findAllByStudioId(UUID studioId);

    List<Quotation> findByStudioIdAndStatus(UUID studioId, QuotationStatus status);

    boolean existsByStudioIdAndQuotationNumber(UUID studioId, String quotationNumber);
}
