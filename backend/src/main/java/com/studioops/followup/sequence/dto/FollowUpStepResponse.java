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
    private CommunicationChannel channel;
    private UUID templateId;
    private String goal;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    public FollowUpStepResponse() {
    }

    public FollowUpStepResponse(UUID id, UUID studioId, UUID sequenceId, int stepOrder, int delayDays, CommunicationChannel channel, UUID templateId, String goal, boolean active, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.studioId = studioId;
        this.sequenceId = sequenceId;
        this.stepOrder = stepOrder;
        this.delayDays = delayDays;
        this.channel = channel;
        this.templateId = templateId;
        this.goal = goal;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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
