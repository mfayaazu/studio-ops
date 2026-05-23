package com.studioops.followup.sequence.dto;

import com.studioops.followup.template.CommunicationChannel;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public class FollowUpStepUpdateRequest {

    @NotNull(message = "stepOrder is required")
    private Integer stepOrder;

    @NotNull(message = "delayDays is required")
    @Min(value = 0, message = "delayDays must be greater than or equal to 0")
    private Integer delayDays;

    @NotNull(message = "channel is required")
    private CommunicationChannel channel;

    @NotNull(message = "templateId is required")
    private UUID templateId;

    @Size(max = 150, message = "goal must not exceed 150 characters")
    private String goal;

    @NotNull(message = "active is required")
    private Boolean active;

    public FollowUpStepUpdateRequest() {
    }

    public FollowUpStepUpdateRequest(Integer stepOrder, Integer delayDays, CommunicationChannel channel, UUID templateId, String goal, Boolean active) {
        this.stepOrder = stepOrder;
        this.delayDays = delayDays;
        this.channel = channel;
        this.templateId = templateId;
        this.goal = goal;
        this.active = active;
    }

    public Integer getStepOrder() {
        return stepOrder;
    }

    public void setStepOrder(Integer stepOrder) {
        this.stepOrder = stepOrder;
    }

    public Integer getDelayDays() {
        return delayDays;
    }

    public void setDelayDays(Integer delayDays) {
        this.delayDays = delayDays;
    }

    public CommunicationChannel getChannel() {
        return channel;
    }

    public void setChannel(CommunicationChannel channel) {
        this.channel = channel;
    }

    public UUID getTemplateId() {
        return templateId;
    }

    public void setTemplateId(UUID templateId) {
        this.templateId = templateId;
    }

    public String getGoal() {
        return goal;
    }

    public void setGoal(String goal) {
        this.goal = goal;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
