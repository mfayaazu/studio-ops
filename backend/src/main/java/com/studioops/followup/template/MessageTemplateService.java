package com.studioops.followup.template;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantContext;
import com.studioops.studio.StudioRepository;
import com.studioops.followup.template.dto.MessageTemplateCreateRequest;
import com.studioops.followup.template.dto.MessageTemplateResponse;
import com.studioops.followup.template.dto.MessageTemplateUpdateRequest;
import com.studioops.followup.sequence.FollowUpStepRepository;
import com.studioops.user.User;
import com.studioops.user.UserRepository;
import com.studioops.user.UserRole;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class MessageTemplateService {

    @Value("${studioops.beta.whatsapp-only:true}")
    private boolean betaWhatsappOnly;

    private final MessageTemplateRepository messageTemplateRepository;
    private final StudioRepository studioRepository;
    private final TenantContext tenantContext;
    private final UserRepository userRepository;
    private final FollowUpStepRepository followUpStepRepository;
    private final com.studioops.user.PermissionService permissionService;

    public MessageTemplateService(MessageTemplateRepository messageTemplateRepository,
                                  StudioRepository studioRepository,
                                  TenantContext tenantContext,
                                  UserRepository userRepository,
                                  FollowUpStepRepository followUpStepRepository,
                                  com.studioops.user.PermissionService permissionService) {
        this.messageTemplateRepository = messageTemplateRepository;
        this.studioRepository = studioRepository;
        this.tenantContext = tenantContext;
        this.userRepository = userRepository;
        this.followUpStepRepository = followUpStepRepository;
        this.permissionService = permissionService;
    }

    public MessageTemplateResponse createTemplate(MessageTemplateCreateRequest request) {
        checkOwnerOrAdminAccess();

        UUID currentStudioId = tenantContext.getCurrentStudioId();
        if (request.getStudioId() != null && !request.getStudioId().equals(currentStudioId)) {
            throw new IllegalArgumentException("Mismatched studio ID provided");
        }
        UUID studioId = currentStudioId;

        if (!studioRepository.existsById(studioId)) {
            throw new IllegalArgumentException("Studio not found with id: " + studioId);
        }

        // Coerce channel and subject for beta WhatsApp-only
        CommunicationChannel channel = request.getChannel();
        String subject = request.getSubject() != null ? request.getSubject().trim() : null;
        if (betaWhatsappOnly) {
            channel = CommunicationChannel.WHATSAPP;
            subject = null;
        }

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("name is required");
        }
        if (request.getBody() == null || request.getBody().trim().isEmpty()) {
            throw new IllegalArgumentException("body is required");
        }

        if (messageTemplateRepository.existsByStudioIdAndNameIgnoreCaseAndChannel(studioId, request.getName(), channel)) {
            throw new IllegalArgumentException("Template with name '" + request.getName() + "' and channel '" + channel + "' already exists for studio: " + studioId);
        }

        MessageTemplate template = new MessageTemplate();
        template.setStudioId(studioId);
        template.setName(request.getName().trim());
        template.setChannel(channel);
        template.setTemplateType(request.getTemplateType());
        template.setSubject(subject);
        template.setBody(request.getBody().trim());
        template.setActive(request.getActive() != null ? request.getActive() : true);

        MessageTemplate saved = messageTemplateRepository.save(template);
        return MessageTemplateMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MessageTemplateResponse> listTemplates(String search) {
        checkReadAccess();
        return listTemplatesForStudio(tenantContext.getCurrentStudioId(), search);
    }

    @Transactional(readOnly = true)
    public List<MessageTemplateResponse> listTemplatesForStudio(UUID studioId, String search) {
        checkReadAccess();
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
        checkReadAccess();
        MessageTemplate template = messageTemplateRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Message template not found with id: " + id));
        return MessageTemplateMapper.toResponse(template);
    }

    public MessageTemplateResponse updateTemplate(UUID id, MessageTemplateUpdateRequest request) {
        checkOwnerOrAdminAccess();

        MessageTemplate template = messageTemplateRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Message template not found with id: " + id));

        // Coerce channel and subject for beta WhatsApp-only
        CommunicationChannel channel = request.getChannel();
        String subject = request.getSubject() != null ? request.getSubject().trim() : null;
        if (betaWhatsappOnly) {
            channel = CommunicationChannel.WHATSAPP;
            subject = null;
        }

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("name is required");
        }
        if (request.getBody() == null || request.getBody().trim().isEmpty()) {
            throw new IllegalArgumentException("body is required");
        }

        if (messageTemplateRepository.existsByStudioIdAndNameIgnoreCaseAndChannelAndIdNot(template.getStudioId(), request.getName(), channel, id)) {
            throw new IllegalArgumentException("Template with name '" + request.getName() + "' and channel '" + channel + "' already exists for studio: " + template.getStudioId());
        }

        template.setName(request.getName().trim());
        template.setChannel(channel);
        template.setTemplateType(request.getTemplateType());
        template.setSubject(subject);
        template.setBody(request.getBody().trim());
        template.setActive(request.getActive());

        MessageTemplate updated = messageTemplateRepository.save(template);
        return MessageTemplateMapper.toResponse(updated);
    }

    public void deleteTemplate(UUID id) {
        checkOwnerOrAdminAccess();

        MessageTemplate template = messageTemplateRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Message template not found with id: " + id));

        if (followUpStepRepository.existsByTemplateId(id)) {
            throw new IllegalArgumentException("Cannot delete template because it is used in a follow-up sequence. Please deactivate it instead or remove it from the sequence.");
        }

        messageTemplateRepository.delete(template);
    }

    private void checkOwnerOrAdminAccess() {
        permissionService.checkPermission(com.studioops.user.PageKey.FOLLOW_UP_CENTER, com.studioops.user.AccessLevel.EDIT);
    }

    private void checkReadAccess() {
        permissionService.checkPermission(com.studioops.user.PageKey.FOLLOW_UP_CENTER, com.studioops.user.AccessLevel.VIEW);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }
        if (email == null || email.trim().isEmpty()) {
            return null;
        }
        return userRepository.findByEmail(email).orElse(null);
    }
}
