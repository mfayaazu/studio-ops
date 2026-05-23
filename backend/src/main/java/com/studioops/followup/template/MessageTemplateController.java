package com.studioops.followup.template;

import com.studioops.followup.template.dto.MessageTemplateCreateRequest;
import com.studioops.followup.template.dto.MessageTemplateResponse;
import com.studioops.followup.template.dto.MessageTemplateUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/message-templates")
public class MessageTemplateController {

    private final MessageTemplateService messageTemplateService;

    public MessageTemplateController(MessageTemplateService messageTemplateService) {
        this.messageTemplateService = messageTemplateService;
    }

    @PostMapping
    public ResponseEntity<MessageTemplateResponse> createTemplate(@Valid @RequestBody MessageTemplateCreateRequest request) {
        MessageTemplateResponse response = messageTemplateService.createTemplate(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<MessageTemplateResponse>> listTemplates(
            @RequestParam(value = "search", required = false) String search) {
        List<MessageTemplateResponse> responses = messageTemplateService.listTemplates(search);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MessageTemplateResponse> getTemplateById(@PathVariable("id") UUID id) {
        MessageTemplateResponse response = messageTemplateService.getTemplateById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MessageTemplateResponse> updateTemplate(
            @PathVariable("id") UUID id,
            @Valid @RequestBody MessageTemplateUpdateRequest request) {
        MessageTemplateResponse response = messageTemplateService.updateTemplate(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable("id") UUID id) {
        messageTemplateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
}
