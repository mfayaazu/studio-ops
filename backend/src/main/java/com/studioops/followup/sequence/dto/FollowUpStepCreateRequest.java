package com.studioops.followup.sequence.dto;

import com.studioops.followup.template.CommunicationChannel;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public class FollowUpStepCreateRequest {

    private UUID studioId;

    @NotNull(message = "sequenceId is required")
    private UUID sequenceId;

    @NotNull(message = "stepOrder is required")
    private Integer stepOrder;

    @NotNull(message = "delayDays is required")
    @Min(value = 0, message = "delayDays must be greater than or equal to 0")
    private Integer delayDays;

    @NotNull(message = "channel is required")
    private CommunicationChannel channel;

    @NotNull(message = "templateId is required")
    private UUID templateId;

    private String stepName;

    private com.studioops.lead.LeadPipelineStage triggerStage;

    private Integer delayValue;

    private String delayUnit;

    private com.studioops.lead.LeadPriority defaultPriority;

    private Integer urgencyThresholdHours;

    @Size(max = 150, message = "goal must not exceed 150 characters")
    private String goal;

    private Boolean active;

    public FollowUpStepCreateRequest() {
    }

    public FollowUpStepCreateRequest(UUID studioId, UUID sequenceId, Integer stepOrder, Integer delayDays, String stepName, com.studioops.lead.LeadPipelineStage triggerStage, Integer delayValue, String delayUnit, com.studioops.lead.LeadPriority defaultPriority, Integer urgencyThresholdHours, CommunicationChannel channel, UUID templateId, String goal, Boolean active) {
        this.studioId = studioId;
        this.sequenceId = sequenceId;
        this.stepOrder = stepOrder;
        this.delayDays = delayDays;
        this.stepName = stepName;
        this.triggerStage = triggerStage;
        this.delayValue = delayValue;
        this.delayUnit = delayUnit;
        this.defaultPriority = defaultPriority;
        this.urgencyThresholdHours = urgencyThresholdHours;
        this.channel = channel;
        this.templateId = templateId;
        this.goal = goal;
        this.active = active;
    }

    public FollowUpStepCreateRequest(UUID studioId, UUID sequenceId, Integer stepOrder, Integer delayDays, CommunicationChannel channel, UUID templateId, String goal, Boolean active) {
        this(studioId, sequenceId, stepOrder, delayDays, "Step " + stepOrder, com.studioops.lead.LeadPipelineStage.NEW_LEAD, delayDays, "DAYS", com.studioops.lead.LeadPriority.NORMAL, 24, channel, templateId, goal, active);
    }

    public UUID getStudioId() {
        return studioId;
    }

    public void setStudioId(UUID studioId) {
        this.studioId = studioId;
    }

    public UUID getSequenceId() {
        return sequenceId;
    }

    public void setSequenceId(UUID sequenceId) {
        this.sequenceId = sequenceId;
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

    public String getStepName() {
        return stepName;
    }

    public void setStepName(String stepName) {
        this.stepName = stepName;
    }

    public com.studioops.lead.LeadPipelineStage getTriggerStage() {
        return triggerStage;
    }

    public void setTriggerStage(com.studioops.lead.LeadPipelineStage triggerStage) {
        this.triggerStage = triggerStage;
    }

    public Integer getDelayValue() {
        return delayValue;
    }

    public void setDelayValue(Integer delayValue) {
        this.delayValue = delayValue;
    }

    public String getDelayUnit() {
        return delayUnit;
    }

    public void setDelayUnit(String delayUnit) {
        this.delayUnit = delayUnit;
    }

    public com.studioops.lead.LeadPriority getDefaultPriority() {
        return defaultPriority;
    }

    public void setDefaultPriority(com.studioops.lead.LeadPriority defaultPriority) {
        this.defaultPriority = defaultPriority;
    }

    public Integer getUrgencyThresholdHours() {
        return urgencyThresholdHours;
    }

    public void setUrgencyThresholdHours(Integer urgencyThresholdHours) {
        this.urgencyThresholdHours = urgencyThresholdHours;
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
