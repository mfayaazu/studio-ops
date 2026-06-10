package com.studioops.followup.sequence.dto;

import com.studioops.followup.template.CommunicationChannel;
import java.time.Instant;
import java.util.UUID;

public class FollowUpStepResponse {

    private UUID id;
    private UUID studioId;
    private UUID sequenceId;
    private int stepOrder;
    private int delayDays;
    private String stepName;
    private com.studioops.lead.LeadPipelineStage triggerStage;
    private int delayValue;
    private String delayUnit;
    private com.studioops.lead.LeadPriority defaultPriority;
    private Integer urgencyThresholdHours;
    private CommunicationChannel channel;
    private UUID templateId;
    private String goal;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    public FollowUpStepResponse() {
    }

    public FollowUpStepResponse(UUID id, UUID studioId, UUID sequenceId, int stepOrder, int delayDays, String stepName, com.studioops.lead.LeadPipelineStage triggerStage, int delayValue, String delayUnit, com.studioops.lead.LeadPriority defaultPriority, Integer urgencyThresholdHours, CommunicationChannel channel, UUID templateId, String goal, boolean active, Instant createdAt, Instant updatedAt) {
        this.id = id;
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
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public FollowUpStepResponse(UUID id, UUID studioId, UUID sequenceId, int stepOrder, int delayDays, CommunicationChannel channel, UUID templateId, String goal, boolean active, Instant createdAt, Instant updatedAt) {
        this(id, studioId, sequenceId, stepOrder, delayDays, "Step " + stepOrder, com.studioops.lead.LeadPipelineStage.NEW_LEAD, delayDays, "DAYS", com.studioops.lead.LeadPriority.NORMAL, 24, channel, templateId, goal, active, createdAt, updatedAt);
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public int getStepOrder() {
        return stepOrder;
    }

    public void setStepOrder(int stepOrder) {
        this.stepOrder = stepOrder;
    }

    public int getDelayDays() {
        return delayDays;
    }

    public void setDelayDays(int delayDays) {
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

    public int getDelayValue() {
        return delayValue;
    }

    public void setDelayValue(int delayValue) {
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

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
