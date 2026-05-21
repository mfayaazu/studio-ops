package com.studioops.client;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.client.dto.ClientCreateRequest;
import com.studioops.client.dto.ClientResponse;
import com.studioops.client.dto.ClientUpdateRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @InjectMocks
    private ClientService clientService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createClient_Success() {
        ClientCreateRequest request = new ClientCreateRequest("Jane Doe", "+46701234567", "jane.doe@example.com", "Notes here");
        
        Client client = new Client();
        client.setId(UUID.randomUUID());
        client.setFullName(request.getFullName());
        client.setPhone(request.getPhone());
        client.setEmail(request.getEmail());
        client.setNotes(request.getNotes());
        client.setCreatedAt(Instant.now());
        client.setUpdatedAt(Instant.now());

        when(clientRepository.save(any(Client.class))).thenReturn(client);

        ClientResponse response = clientService.createClient(request);

        assertNotNull(response);
        assertEquals(client.getId(), response.getId());
        assertEquals(request.getFullName(), response.getFullName());
        assertEquals(request.getPhone(), response.getPhone());
        assertEquals(request.getEmail(), response.getEmail());
        assertEquals(request.getNotes(), response.getNotes());

        verify(clientRepository, times(1)).save(any(Client.class));
    }

    @Test
    void createClient_WithEmptyEmail_ShouldNormalizeToNull() {
        ClientCreateRequest request = new ClientCreateRequest("Jane Doe", "+46701234567", "  ", "Notes");
        
        Client client = new Client();
        client.setId(UUID.randomUUID());
        client.setFullName(request.getFullName());
        client.setPhone(request.getPhone());
        client.setEmail(null);
        client.setNotes(request.getNotes());

        when(clientRepository.save(any(Client.class))).thenAnswer(invocation -> {
            Client argument = invocation.getArgument(0);
            assertNull(argument.getEmail());
            return client;
        });

        ClientResponse response = clientService.createClient(request);
        assertNotNull(response);
        assertNull(response.getEmail());
    }

    @Test
    void getClientById_Success() {
        UUID id = UUID.randomUUID();
        Client client = new Client();
        client.setId(id);
        client.setFullName("John Smith");
        client.setPhone("123456");

        when(clientRepository.findById(id)).thenReturn(Optional.of(client));

        ClientResponse response = clientService.getClientById(id);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals("John Smith", response.getFullName());
    }

    @Test
    void getClientById_NotFound_ThrowsException() {
        UUID id = UUID.randomUUID();
        when(clientRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> clientService.getClientById(id));
    }

    @Test
    void updateClient_Success() {
        UUID id = UUID.randomUUID();
        Client client = new Client();
        client.setId(id);
        client.setFullName("John Smith");
        client.setPhone("123456");

        ClientUpdateRequest request = new ClientUpdateRequest("John Updated", "654321", "updated@example.com", "Updated Notes");

        when(clientRepository.findById(id)).thenReturn(Optional.of(client));
        when(clientRepository.save(any(Client.class))).thenReturn(client);

        ClientResponse response = clientService.updateClient(id, request);

        assertNotNull(response);
        assertEquals("John Updated", response.getFullName());
        assertEquals("654321", response.getPhone());
        assertEquals("updated@example.com", response.getEmail());
    }

    @Test
    void updateClient_NotFound_ThrowsException() {
        UUID id = UUID.randomUUID();
        ClientUpdateRequest request = new ClientUpdateRequest("John Updated", "654321", "updated@example.com", "Updated Notes");

        when(clientRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> clientService.updateClient(id, request));
    }

    @Test
    void deleteClient_Success() {
        UUID id = UUID.randomUUID();
        Client client = new Client();
        client.setId(id);

        when(clientRepository.findById(id)).thenReturn(Optional.of(client));
        doNothing().when(clientRepository).delete(client);

        assertDoesNotThrow(() -> clientService.deleteClient(id));

        verify(clientRepository, times(1)).delete(client);
    }

    @Test
    void deleteClient_NotFound_ThrowsException() {
        UUID id = UUID.randomUUID();
        when(clientRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> clientService.deleteClient(id));
    }

    @Test
    void listClients_NoSearch_ReturnsAll() {
        Client c1 = new Client();
        c1.setFullName("Client One");
        Client c2 = new Client();
        c2.setFullName("Client Two");

        when(clientRepository.findAll()).thenReturn(List.of(c1, c2));

        List<ClientResponse> responses = clientService.listClients(null);

        assertEquals(2, responses.size());
        verify(clientRepository, times(1)).findAll();
    }

    @Test
    void listClients_WithSearch_ReturnsMatching() {
        Client c1 = new Client();
        c1.setFullName("Client One");

        when(clientRepository.searchClients("Client")).thenReturn(List.of(c1));

        List<ClientResponse> responses = clientService.listClients("Client");

        assertEquals(1, responses.size());
        assertEquals("Client One", responses.get(0).getFullName());
        verify(clientRepository, times(1)).searchClients("Client");
    }
}
