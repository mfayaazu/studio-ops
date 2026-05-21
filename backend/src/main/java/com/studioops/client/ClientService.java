package com.studioops.client;

import com.studioops.common.exception.ResourceNotFoundException;
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

    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    public ClientResponse createClient(ClientCreateRequest request) {
        Client client = new Client();
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
        List<Client> clients;
        if (search == null || search.trim().isEmpty()) {
            clients = clientRepository.findAll();
        } else {
            clients = clientRepository.searchClients(search.trim());
        }
        return clients.stream()
                .map(ClientMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClientResponse getClientById(UUID id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));
        return ClientMapper.toResponse(client);
    }

    public ClientResponse updateClient(UUID id, ClientUpdateRequest request) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));
        
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

    public void deleteClient(UUID id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));
        clientRepository.delete(client);
    }
}
