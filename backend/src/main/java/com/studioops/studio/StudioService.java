package com.studioops.studio;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.studio.dto.StudioCreateRequest;
import com.studioops.studio.dto.StudioResponse;
import com.studioops.studio.dto.StudioUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class StudioService {

    private final StudioRepository studioRepository;

    public StudioService(StudioRepository studioRepository) {
        this.studioRepository = studioRepository;
    }

    public StudioResponse createStudio(StudioCreateRequest request) {
        String slug = request.getSlug().trim();
        if (studioRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("Studio slug already exists: " + slug);
        }

        Studio studio = new Studio();
        studio.setName(request.getName().trim());
        studio.setSlug(slug);

        // Optional fields
        String email = request.getBusinessEmail();
        studio.setBusinessEmail(email != null && !email.trim().isEmpty() ? email.trim() : null);

        String phone = request.getPhone();
        studio.setPhone(phone != null && !phone.trim().isEmpty() ? phone.trim() : null);

        String country = request.getCountry();
        studio.setCountry(country != null && !country.trim().isEmpty() ? country.trim() : null);

        // Defaults handling
        String timezone = request.getTimezone();
        studio.setTimezone(timezone != null && !timezone.trim().isEmpty() ? timezone.trim() : "Europe/Stockholm");

        StudioStatus status = request.getStatus();
        studio.setStatus(status != null ? status : StudioStatus.ACTIVE);

        SubscriptionPlan plan = request.getSubscriptionPlan();
        studio.setSubscriptionPlan(plan != null ? plan : SubscriptionPlan.STARTER);

        SubscriptionStatus subStatus = request.getSubscriptionStatus();
        studio.setSubscriptionStatus(subStatus != null ? subStatus : SubscriptionStatus.TRIAL);

        Studio saved = studioRepository.save(studio);
        return StudioMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<StudioResponse> listStudios(String search) {
        List<Studio> studios;
        if (search == null || search.trim().isEmpty()) {
            studios = studioRepository.findAll();
        } else {
            studios = studioRepository.searchStudios(search.trim());
        }
        return studios.stream()
                .map(StudioMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public StudioResponse getStudioById(UUID id) {
        Studio studio = studioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Studio not found with id: " + id));
        return StudioMapper.toResponse(studio);
    }

    public StudioResponse updateStudio(UUID id, StudioUpdateRequest request) {
        Studio studio = studioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Studio not found with id: " + id));

        String slug = request.getSlug().trim();
        if (studioRepository.existsBySlugAndIdNot(slug, id)) {
            throw new IllegalArgumentException("Studio slug already exists: " + slug);
        }

        studio.setName(request.getName().trim());
        studio.setSlug(slug);

        // Optional fields
        String email = request.getBusinessEmail();
        studio.setBusinessEmail(email != null && !email.trim().isEmpty() ? email.trim() : null);

        String phone = request.getPhone();
        studio.setPhone(phone != null && !phone.trim().isEmpty() ? phone.trim() : null);

        String country = request.getCountry();
        studio.setCountry(country != null && !country.trim().isEmpty() ? country.trim() : null);

        studio.setTimezone(request.getTimezone().trim());
        studio.setStatus(request.getStatus());
        studio.setSubscriptionPlan(request.getSubscriptionPlan());
        studio.setSubscriptionStatus(request.getSubscriptionStatus());

        Studio updated = studioRepository.save(studio);
        return StudioMapper.toResponse(updated);
    }

    public StudioResponse approveStudio(UUID id) {
        Studio studio = studioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Studio not found with id: " + id));
        studio.setStatus(StudioStatus.BETA_ACTIVE);
        Studio updated = studioRepository.save(studio);
        return StudioMapper.toResponse(updated);
    }

    public void deleteStudio(UUID id) {
        Studio studio = studioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Studio not found with id: " + id));
        studioRepository.delete(studio);
    }
}
