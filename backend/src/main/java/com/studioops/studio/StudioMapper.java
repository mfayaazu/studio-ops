package com.studioops.studio;

import com.studioops.studio.dto.StudioResponse;

public class StudioMapper {

    public static StudioResponse toResponse(Studio studio) {
        if (studio == null) {
            return null;
        }
        StudioResponse response = new StudioResponse();
        response.setId(studio.getId());
        response.setName(studio.getName());
        response.setSlug(studio.getSlug());
        response.setBusinessEmail(studio.getBusinessEmail());
        response.setPhone(studio.getPhone());
        response.setCountry(studio.getCountry());
        response.setTimezone(studio.getTimezone());
        response.setStatus(studio.getStatus());
        response.setSubscriptionPlan(studio.getSubscriptionPlan());
        response.setSubscriptionStatus(studio.getSubscriptionStatus());
        response.setCreatedAt(studio.getCreatedAt());
        response.setUpdatedAt(studio.getUpdatedAt());
        return response;
    }
}
