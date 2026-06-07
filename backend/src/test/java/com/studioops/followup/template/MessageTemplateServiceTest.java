package com.studioops.followup.template;

import com.studioops.common.tenant.TenantContext;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.studio.StudioRepository;
import com.studioops.user.UserRepository;
import com.studioops.followup.sequence.FollowUpStepRepository;
import com.studioops.followup.template.dto.MessageTemplateCreateRequest;
import com.studioops.followup.template.dto.MessageTemplateResponse;
import com.studioops.followup.template.dto.MessageTemplateUpdateRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class MessageTemplateServiceTest {

    @Mock
    private TenantContext tenantContext;

    @Mock
    private MessageTemplateRepository messageTemplateRepository;

    @Mock
    private StudioRepository studioRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FollowUpStepRepository followUpStepRepository;

    @Mock
    private com.studioops.user.PermissionService permissionService;

    @InjectMocks
    private MessageTemplateService messageTemplateService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(tenantContext.getCurrentStudioId()).thenReturn(TenantConstants.DEFAULT_STUDIO_ID);
        when(studioRepository.existsById(any(UUID.class))).thenReturn(true);
        when(followUpStepRepository.existsByTemplateId(any(UUID.class))).thenReturn(false);
    }

    @Test
    void createTemplate_Success_DefaultsToDefaultStudioId() {
        MessageTemplateCreateRequest request = new MessageTemplateCreateRequest(
                null, "Standard Welcome", CommunicationChannel.EMAIL, MessageTemplateType.QUOTE_SENT, "Welcome!", "Welcome to our studio, {{client_name}}!", null
        );

        MessageTemplate template = new MessageTemplate();
        template.setId(UUID.randomUUID());
        template.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        template.setName(request.getName());
        template.setChannel(request.getChannel());
        template.setTemplateType(request.getTemplateType());
        template.setSubject(request.getSubject());
        template.setBody(request.getBody());
        template.setActive(true);
        template.setCreatedAt(Instant.now());
        template.setUpdatedAt(Instant.now());

        when(messageTemplateRepository.existsByStudioIdAndNameIgnoreCaseAndChannel(TenantConstants.DEFAULT_STUDIO_ID, request.getName(), request.getChannel()))
                .thenReturn(false);
        when(messageTemplateRepository.save(any(MessageTemplate.class))).thenReturn(template);

        MessageTemplateResponse response = messageTemplateService.createTemplate(request);

        assertNotNull(response);
        assertEquals(template.getId(), response.getId());
        assertEquals(TenantConstants.DEFAULT_STUDIO_ID, response.getStudioId());
        assertEquals(request.getName(), response.getName());
        assertEquals(request.getChannel(), response.getChannel());
        assertEquals(request.getTemplateType(), response.getTemplateType());
        assertEquals(request.getSubject(), response.getSubject());
        assertEquals(request.getBody(), response.getBody());
        assertTrue(response.isActive());

        verify(studioRepository, times(1)).existsById(TenantConstants.DEFAULT_STUDIO_ID);
        verify(messageTemplateRepository, times(1)).save(any(MessageTemplate.class));
    }

    @Test
    void createTemplate_CustomStudioId_Success() {
        UUID customStudioId = UUID.randomUUID();
        when(tenantContext.getCurrentStudioId()).thenReturn(customStudioId);
        MessageTemplateCreateRequest request = new MessageTemplateCreateRequest(
                customStudioId, "Standard Welcome", CommunicationChannel.SMS, MessageTemplateType.CUSTOM, null, "Hello!", false
        );

        MessageTemplate template = new MessageTemplate();
        template.setId(UUID.randomUUID());
        template.setStudioId(customStudioId);
        template.setName(request.getName());
        template.setChannel(request.getChannel());
        template.setTemplateType(request.getTemplateType());
        template.setSubject(null);
        template.setBody(request.getBody());
        template.setActive(false);

        when(messageTemplateRepository.existsByStudioIdAndNameIgnoreCaseAndChannel(customStudioId, request.getName(), request.getChannel()))
                .thenReturn(false);
        when(messageTemplateRepository.save(any(MessageTemplate.class))).thenReturn(template);

        MessageTemplateResponse response = messageTemplateService.createTemplate(request);

        assertNotNull(response);
        assertEquals(customStudioId, response.getStudioId());
        assertFalse(response.isActive());
        verify(studioRepository, times(1)).existsById(customStudioId);
    }

    @Test
    void createTemplate_StudioNotFound_ThrowsException() {
        UUID nonExistentStudioId = UUID.randomUUID();
        when(tenantContext.getCurrentStudioId()).thenReturn(nonExistentStudioId);
        MessageTemplateCreateRequest request = new MessageTemplateCreateRequest(
                nonExistentStudioId, "Welcome", CommunicationChannel.EMAIL, MessageTemplateType.QUOTE_SENT, "Welcome", "Body", true
        );

        when(studioRepository.existsById(nonExistentStudioId)).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                messageTemplateService.createTemplate(request)
        );
        assertEquals("Studio not found with id: " + nonExistentStudioId, exception.getMessage());
        verify(messageTemplateRepository, never()).save(any(MessageTemplate.class));
    }

    @Test
    void createTemplate_DuplicateNameAndChannel_ThrowsException() {
        MessageTemplateCreateRequest request = new MessageTemplateCreateRequest(
                null, "Duplicate Name", CommunicationChannel.EMAIL, MessageTemplateType.QUOTE_SENT, "Welcome", "Body", true
        );

        when(messageTemplateRepository.existsByStudioIdAndNameIgnoreCaseAndChannel(TenantConstants.DEFAULT_STUDIO_ID, request.getName(), request.getChannel()))
                .thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                messageTemplateService.createTemplate(request)
        );
        assertTrue(exception.getMessage().contains("already exists"));
        verify(messageTemplateRepository, never()).save(any(MessageTemplate.class));
    }

    @Test
    void createTemplate_BetaWhatsappOnlyActive_CoercesToWhatsapp() {
        ReflectionTestUtils.setField(messageTemplateService, "betaWhatsappOnly", true);

        MessageTemplateCreateRequest request = new MessageTemplateCreateRequest(
                null, "Welcome Promo", CommunicationChannel.EMAIL, MessageTemplateType.QUOTE_SENT, "Email Subject", "Welcome client!", true
        );

        MessageTemplate template = new MessageTemplate();
        template.setId(UUID.randomUUID());
        template.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        template.setName(request.getName());
        template.setChannel(CommunicationChannel.WHATSAPP);
        template.setTemplateType(request.getTemplateType());
        template.setSubject(null); // subject forced null
        template.setBody(request.getBody());
        template.setActive(true);

        when(messageTemplateRepository.existsByStudioIdAndNameIgnoreCaseAndChannel(TenantConstants.DEFAULT_STUDIO_ID, request.getName(), CommunicationChannel.WHATSAPP))
                .thenReturn(false);
        when(messageTemplateRepository.save(any(MessageTemplate.class))).thenReturn(template);

        MessageTemplateResponse response = messageTemplateService.createTemplate(request);

        assertNotNull(response);
        assertEquals(CommunicationChannel.WHATSAPP, response.getChannel());
        assertNull(response.getSubject());
    }

    @Test
    void getTemplateById_Success() {
        UUID id = UUID.randomUUID();
        MessageTemplate template = new MessageTemplate();
        template.setId(id);
        template.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        template.setName("Check-in");
        template.setChannel(CommunicationChannel.WHATSAPP);
        template.setTemplateType(MessageTemplateType.SOFT_FOLLOW_UP);
        template.setBody("Checking in!");

        when(messageTemplateRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(template));

        MessageTemplateResponse response = messageTemplateService.getTemplateById(id);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals(TenantConstants.DEFAULT_STUDIO_ID, response.getStudioId());
        assertEquals("Check-in", response.getName());
    }

    @Test
    void getTemplateById_NotFound_ThrowsResourceNotFoundException() {
        UUID id = UUID.randomUUID();
        when(messageTemplateRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> messageTemplateService.getTemplateById(id));
    }

    @Test
    void updateTemplate_Success() {
        UUID id = UUID.randomUUID();
        MessageTemplate template = new MessageTemplate();
        template.setId(id);
        template.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        template.setName("Check-in");
        template.setChannel(CommunicationChannel.WHATSAPP);
        template.setTemplateType(MessageTemplateType.SOFT_FOLLOW_UP);
        template.setBody("Checking in!");
        template.setActive(true);

        MessageTemplateUpdateRequest request = new MessageTemplateUpdateRequest(
                "Updated Name", CommunicationChannel.EMAIL, MessageTemplateType.SCARCITY_FOLLOW_UP, "Hurry!", "Only a few slots left!", false
        );

        when(messageTemplateRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(template));
        when(messageTemplateRepository.existsByStudioIdAndNameIgnoreCaseAndChannelAndIdNot(TenantConstants.DEFAULT_STUDIO_ID, request.getName(), request.getChannel(), id))
                .thenReturn(false);
        when(messageTemplateRepository.save(any(MessageTemplate.class))).thenReturn(template);

        MessageTemplateResponse response = messageTemplateService.updateTemplate(id, request);

        assertNotNull(response);
        assertEquals("Updated Name", response.getName());
        assertEquals(CommunicationChannel.EMAIL, response.getChannel());
        assertEquals(MessageTemplateType.SCARCITY_FOLLOW_UP, response.getTemplateType());
        assertEquals("Hurry!", response.getSubject());
        assertEquals("Only a few slots left!", response.getBody());
        assertFalse(response.isActive());
    }

    @Test
    void updateTemplate_DuplicateConflict_ThrowsIllegalArgumentException() {
        UUID id = UUID.randomUUID();
        MessageTemplate template = new MessageTemplate();
        template.setId(id);
        template.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        template.setName("Check-in");

        MessageTemplateUpdateRequest request = new MessageTemplateUpdateRequest(
                "Duplicate Name", CommunicationChannel.EMAIL, MessageTemplateType.SCARCITY_FOLLOW_UP, "Hurry!", "Only a few slots left!", false
        );

        when(messageTemplateRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(template));
        when(messageTemplateRepository.existsByStudioIdAndNameIgnoreCaseAndChannelAndIdNot(TenantConstants.DEFAULT_STUDIO_ID, request.getName(), request.getChannel(), id))
                .thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                messageTemplateService.updateTemplate(id, request)
        );
        assertTrue(exception.getMessage().contains("already exists"));
        verify(messageTemplateRepository, never()).save(any(MessageTemplate.class));
    }

    @Test
    void updateTemplate_BetaWhatsappOnlyActive_CoercesToWhatsapp() {
        ReflectionTestUtils.setField(messageTemplateService, "betaWhatsappOnly", true);
        UUID id = UUID.randomUUID();

        MessageTemplate template = new MessageTemplate();
        template.setId(id);
        template.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        template.setName("Check-in");
        template.setChannel(CommunicationChannel.WHATSAPP);
        template.setTemplateType(MessageTemplateType.SOFT_FOLLOW_UP);
        template.setBody("Checking in!");
        template.setActive(true);

        MessageTemplateUpdateRequest request = new MessageTemplateUpdateRequest(
                "Updated Name", CommunicationChannel.EMAIL, MessageTemplateType.SCARCITY_FOLLOW_UP, "Subject", "Body body", true
        );

        when(messageTemplateRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(template));
        when(messageTemplateRepository.existsByStudioIdAndNameIgnoreCaseAndChannelAndIdNot(TenantConstants.DEFAULT_STUDIO_ID, request.getName(), CommunicationChannel.WHATSAPP, id))
                .thenReturn(false);
        when(messageTemplateRepository.save(any(MessageTemplate.class))).thenReturn(template);

        MessageTemplateResponse response = messageTemplateService.updateTemplate(id, request);

        assertNotNull(response);
        assertEquals(CommunicationChannel.WHATSAPP, response.getChannel());
        assertNull(response.getSubject());
    }

    @Test
    void deleteTemplate_Success() {
        UUID id = UUID.randomUUID();
        MessageTemplate template = new MessageTemplate();
        template.setId(id);
        template.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(messageTemplateRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(template));
        when(followUpStepRepository.existsByTemplateId(id)).thenReturn(false);
        doNothing().when(messageTemplateRepository).delete(template);

        assertDoesNotThrow(() -> messageTemplateService.deleteTemplate(id));
        verify(messageTemplateRepository, times(1)).delete(template);
    }

    @Test
    void deleteTemplate_UsedInSequence_ThrowsException() {
        UUID id = UUID.randomUUID();
        MessageTemplate template = new MessageTemplate();
        template.setId(id);
        template.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(messageTemplateRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(template));
        when(followUpStepRepository.existsByTemplateId(id)).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                messageTemplateService.deleteTemplate(id)
        );
        assertTrue(exception.getMessage().contains("used in a follow-up sequence"));
        verify(messageTemplateRepository, never()).delete(any(MessageTemplate.class));
    }

    @Test
    void listTemplates_NoSearch_ReturnsAllForStudio() {
        MessageTemplate t1 = new MessageTemplate();
        t1.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        MessageTemplate t2 = new MessageTemplate();
        t2.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(messageTemplateRepository.findAllByStudioId(TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(List.of(t1, t2));

        List<MessageTemplateResponse> responses = messageTemplateService.listTemplates(null);

        assertEquals(2, responses.size());
        verify(messageTemplateRepository, times(1)).findAllByStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        verify(messageTemplateRepository, never()).searchByStudioId(any(), any());
    }

    @Test
    void listTemplates_WithSearch_ReturnsMatching() {
        MessageTemplate t1 = new MessageTemplate();
        t1.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        t1.setName("Special Promo");

        when(messageTemplateRepository.searchByStudioId(TenantConstants.DEFAULT_STUDIO_ID, "Promo")).thenReturn(List.of(t1));

        List<MessageTemplateResponse> responses = messageTemplateService.listTemplates("Promo");

        assertEquals(1, responses.size());
        assertEquals("Special Promo", responses.get(0).getName());
        verify(messageTemplateRepository, times(1)).searchByStudioId(TenantConstants.DEFAULT_STUDIO_ID, "Promo");
    }
}
