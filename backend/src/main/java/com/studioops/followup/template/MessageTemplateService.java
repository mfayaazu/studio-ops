package com.studioops.followup.template;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantContext;
import com.studioops.studio.StudioRepository;
import com.studioops.followup.template.dto.MessageTemplateCreateRequest;
import com.studioops.followup.template.dto.MessageTemplateResponse;
import com.studioops.followup.template.dto.MessageTemplateUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class MessageTemplateService {

    private final MessageTemplateRepository messageTemplateRepository;
    private final StudioRepository studioRepository;
    private final TenantContext tenantContext;

    public MessageTemplateService(MessageTemplateRepository messageTemplateRepository, StudioRepository studioRepository, TenantContext tenantContext) {
        this.messageTemplateRepository = messageTemplateRepository;
        this.studioRepository = studioRepository;
        this.tenantContext = tenantContext;
    }

    public MessageTemplateResponse createTemplate(MessageTemplateCreateRequest request) {
        UUID currentStudioId = tenantContext.getCurrentStudioId();
        if (request.getStudioId() != null && !request.getStudioId().equals(currentStudioId)) {
            throw new IllegalArgumentException("Mismatched studio ID provided");
        }
        UUID studioId = currentStudioId;

        if (!studioRepository.existsById(studioId)) {
            throw new IllegalArgumentException("Studio not found with id: " + studioId);
        }

        if (messageTemplateRepository.existsByStudioIdAndNameIgnoreCaseAndChannel(studioId, request.getName(), request.getChannel())) {
            throw new IllegalArgumentException("Template with name '" + request.getName() + "' and channel '" + request.getChannel() + "' already exists for studio: " + studioId);
        }

        MessageTemplate template = new MessageTemplate();
        template.setStudioId(studioId);
        template.setName(request.getName().trim());
        template.setChannel(request.getChannel());
        template.setTemplateType(request.getTemplateType());
        template.setSubject(request.getSubject() != null ? request.getSubject().trim() : null);
        template.setBody(request.getBody().trim());
        template.setActive(request.getActive() != null ? request.getActive() : true);

        MessageTemplate saved = messageTemplateRepository.save(template);
        return MessageTemplateMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MessageTemplateResponse> listTemplates(String search) {
        return listTemplatesForStudio(tenantContext.getCurrentStudioId(), search);
    }

    @Transactional(readOnly = true)
    public List<MessageTemplateResponse> listTemplatesForStudio(UUID studioId, String search) {
        List<MessageTemplate> templates;
        if (search == null || search.trim().isEmpty()) {
            templates = messageTemplateRepository.findAllByStudioId(studioId);
        } else {
            templates = messageTemplateRepository.searchByStudioId(studioId, search.trim());
        }
        return templates.stream()
                .map(MessageTemplateMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MessageTemplateResponse getTemplateById(UUID id) {
        MessageTemplate template = messageTemplateRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Message template not found with id: " + id));
        return MessageTemplateMapper.toResponse(template);
    }

    public MessageTemplateResponse updateTemplate(UUID id, MessageTemplateUpdateRequest request) {
        MessageTemplate template = messageTemplateRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Message template not found with id: " + id));

        if (messageTemplateRepository.existsByStudioIdAndNameIgnoreCaseAndChannelAndIdNot(template.getStudioId(), request.getName(), request.getChannel(), id)) {
            throw new IllegalArgumentException("Template with name '" + request.getName() + "' and channel '" + request.getChannel() + "' already exists for studio: " + template.getStudioId());
        }

        template.setName(request.getName().trim());
        template.setChannel(request.getChannel());
        template.setTemplateType(request.getTemplateType());
        template.setSubject(request.getSubject() != null ? request.getSubject().trim() : null);
        template.setBody(request.getBody().trim());
        template.setActive(request.getActive());

        MessageTemplate updated = messageTemplateRepository.save(template);
        return MessageTemplateMapper.toResponse(updated);
    }

    public void deleteTemplate(UUID id) {
        MessageTemplate template = messageTemplateRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Message template not found with id: " + id));
        messageTemplateRepository.delete(template);
    }
}
