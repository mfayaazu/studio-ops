package com.studioops.client;

import com.studioops.client.dto.ClientCreateRequest;
import com.studioops.client.dto.ClientResponse;
import com.studioops.client.dto.ClientUpdateRequest;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @PostMapping
    public ResponseEntity<ClientResponse> createClient(@Valid @RequestBody ClientCreateRequest request) {
        ClientResponse response = clientService.createClient(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ClientResponse>> listClients(
            @RequestParam(value = "search", required = false) String search) {
        List<ClientResponse> responses = clientService.listClients(search);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientResponse> getClientById(@PathVariable("id") UUID id) {
        ClientResponse response = clientService.getClientById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientResponse> updateClient(
            @PathVariable("id") UUID id,
            @Valid @RequestBody ClientUpdateRequest request) {
        ClientResponse response = clientService.updateClient(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable("id") UUID id) {
        clientService.deleteClient(id);
        return ResponseEntity.noContent().build();
    }
}
