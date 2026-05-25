package com.studioops.lead;

import com.studioops.lead.dto.LeadCreateRequest;
import com.studioops.lead.dto.LeadMoveStageRequest;
import com.studioops.lead.dto.LeadResponse;
import com.studioops.lead.dto.LeadUpdateRequest;
import com.studioops.lead.dto.LeadConvertToProjectRequest;
import com.studioops.lead.dto.LeadConvertToProjectResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/leads")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @PostMapping
    public ResponseEntity<LeadResponse> createLead(@Valid @RequestBody LeadCreateRequest request) {
        LeadResponse response = leadService.createLead(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<LeadResponse>> listLeads(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "pipelineStage", required = false) LeadPipelineStage pipelineStage,
            @RequestParam(value = "leadSource", required = false) LeadSource leadSource) {
        List<LeadResponse> responses = leadService.listLeads(search, pipelineStage, leadSource);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeadResponse> getLeadById(@PathVariable("id") UUID id) {
        LeadResponse response = leadService.getLeadById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LeadResponse> updateLead(
            @PathVariable("id") UUID id,
            @Valid @RequestBody LeadUpdateRequest request) {
        LeadResponse response = leadService.updateLead(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/move-stage")
    public ResponseEntity<LeadResponse> moveStage(
            @PathVariable("id") UUID id,
            @Valid @RequestBody LeadMoveStageRequest request) {
        LeadResponse response = leadService.moveStage(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLead(@PathVariable("id") UUID id) {
        leadService.deleteLead(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/convert-to-project")
    public ResponseEntity<LeadConvertToProjectResponse> convertToProject(
            @PathVariable("id") UUID id,
            @Valid @RequestBody LeadConvertToProjectRequest request) {
        LeadConvertToProjectResponse response = leadService.convertLeadToProject(id, request);
        return ResponseEntity.ok(response);
    }
}
