package com.studioops.client;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantContext;
import com.studioops.studio.StudioRepository;
import com.studioops.client.dto.ClientCreateRequest;
import com.studioops.client.dto.ClientResponse;
import com.studioops.client.dto.ClientUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ClientService {

    private final ClientRepository clientRepository;
    private final StudioRepository studioRepository;
    private final TenantContext tenantContext;

    public ClientService(ClientRepository clientRepository, StudioRepository studioRepository, TenantContext tenantContext) {
        this.clientRepository = clientRepository;
        this.studioRepository = studioRepository;
        this.tenantContext = tenantContext;
    }

    public ClientResponse createClient(ClientCreateRequest request) {
        UUID currentStudioId = tenantContext.getCurrentStudioId();
        if (request.getStudioId() != null && !request.getStudioId().equals(currentStudioId)) {
            throw new IllegalArgumentException("Mismatched studio ID provided");
        }
        UUID studioId = currentStudioId;

        if (!studioRepository.existsById(studioId)) {
            throw new IllegalArgumentException("Studio not found with id: " + studioId);
        }

        validateClientUniqueness(studioId, request.getPhone(), request.getEmail(), null);

        Client client = new Client();
        client.setStudioId(studioId);
        client.setFullName(request.getFullName().trim());
        client.setPhone(request.getPhone().trim());
        
        String email = request.getEmail();
        if (email != null && !email.trim().isEmpty()) {
            client.setEmail(email.trim());
        } else {
            client.setEmail(null);
        }
        
        client.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);
        
        Client saved = clientRepository.save(client);
        return ClientMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ClientResponse> listClients(String search) {
        return listClientsForStudio(tenantContext.getCurrentStudioId(), search);
    }

    @Transactional(readOnly = true)
    public List<ClientResponse> listClientsForStudio(UUID studioId, String search) {
        List<Client> clients;
        if (search == null || search.trim().isEmpty()) {
            clients = clientRepository.findAllByStudioId(studioId);
        } else {
            clients = clientRepository.searchClientsByStudio(studioId, search.trim());
        }
        return clients.stream()
                .map(ClientMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClientResponse getClientById(UUID id) {
        Client client = clientRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));
        return ClientMapper.toResponse(client);
    }

    public ClientResponse updateClient(UUID id, ClientUpdateRequest request) {
        Client client = clientRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));
        
        validateClientUniqueness(tenantContext.getCurrentStudioId(), request.getPhone(), request.getEmail(), id);

        client.setFullName(request.getFullName().trim());
        client.setPhone(request.getPhone().trim());
        
        String email = request.getEmail();
        if (email != null && !email.trim().isEmpty()) {
            client.setEmail(email.trim());
        } else {
            client.setEmail(null);
        }
        
        client.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);
        
        Client updated = clientRepository.save(client);
        return ClientMapper.toResponse(updated);
    }

    private void validateClientUniqueness(UUID studioId, String phone, String email, UUID excludeId) {
        String normEmail = email != null ? email.trim().toLowerCase() : null;
        String normPhone = phone != null ? phone.replaceAll("[\\s\\-\\(\\)]", "") : null;

        List<Client> clients = clientRepository.findAllByStudioId(studioId);
        for (Client c : clients) {
            if (excludeId != null && c.getId().equals(excludeId)) {
                continue;
            }
            if (normEmail != null && !normEmail.isEmpty() && c.getEmail() != null) {
                if (c.getEmail().trim().toLowerCase().equals(normEmail)) {
                    throw new IllegalArgumentException("A client with this email or phone number already exists.");
                }
            }
            if (normPhone != null && !normPhone.isEmpty() && c.getPhone() != null) {
                String existingNormPhone = c.getPhone().replaceAll("[\\s\\-\\(\\)]", "");
                if (existingNormPhone.equals(normPhone)) {
                    throw new IllegalArgumentException("A client with this email or phone number already exists.");
                }
            }
        }
    }

    public void deleteClient(UUID id) {
        Client client = clientRepository.findByIdAndStudioId(id, tenantContext.getCurrentStudioId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));
        clientRepository.delete(client);
    }
}
