package com.studioops.client;

import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.common.tenant.TenantConstants;
import com.studioops.common.tenant.TenantContext;
import com.studioops.studio.StudioRepository;
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

    @Mock
    private StudioRepository studioRepository;

    @Mock
    private TenantContext tenantContext;

    @InjectMocks
    private ClientService clientService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // By default, assume the studio exists
        when(studioRepository.existsById(any(UUID.class))).thenReturn(true);
        when(tenantContext.getCurrentStudioId()).thenReturn(TenantConstants.DEFAULT_STUDIO_ID);
    }

    @Test
    void createClient_Success() {
        ClientCreateRequest request = new ClientCreateRequest("Jane Doe", "+46701234567", "jane.doe@example.com", "Notes here");
        
        Client client = new Client();
        client.setId(UUID.randomUUID());
        client.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
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
        assertEquals(TenantConstants.DEFAULT_STUDIO_ID, response.getStudioId());
        assertEquals(request.getFullName(), response.getFullName());
        assertEquals(request.getPhone(), response.getPhone());
        assertEquals(request.getEmail(), response.getEmail());
        assertEquals(request.getNotes(), response.getNotes());

        verify(studioRepository, times(1)).existsById(TenantConstants.DEFAULT_STUDIO_ID);
        verify(clientRepository, times(1)).save(any(Client.class));
    }

    @Test
    void createClient_WithStudioId_Success() {
        UUID customStudioId = UUID.randomUUID();
        when(tenantContext.getCurrentStudioId()).thenReturn(customStudioId);
        ClientCreateRequest request = new ClientCreateRequest("Jane Doe", "+46701234567", "jane.doe@example.com", "Notes here", customStudioId);
        
        Client client = new Client();
        client.setId(UUID.randomUUID());
        client.setStudioId(customStudioId);
        client.setFullName(request.getFullName());
        client.setPhone(request.getPhone());
        client.setEmail(request.getEmail());
        client.setNotes(request.getNotes());

        when(clientRepository.save(any(Client.class))).thenReturn(client);

        ClientResponse response = clientService.createClient(request);

        assertNotNull(response);
        assertEquals(customStudioId, response.getStudioId());
        verify(studioRepository, times(1)).existsById(customStudioId);
    }

    @Test
    void createClient_StudioNotFound_ThrowsException() {
        UUID nonExistentStudioId = UUID.randomUUID();
        when(tenantContext.getCurrentStudioId()).thenReturn(nonExistentStudioId);
        ClientCreateRequest request = new ClientCreateRequest("Jane Doe", "+46701234567", "jane.doe@example.com", "Notes here", nonExistentStudioId);

        when(studioRepository.existsById(nonExistentStudioId)).thenReturn(false);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> 
            clientService.createClient(request)
        );
        assertEquals("Studio not found with id: " + nonExistentStudioId, exception.getMessage());
        verify(clientRepository, never()).save(any(Client.class));
    }

    @Test
    void createClient_WithEmptyEmail_ShouldNormalizeToNull() {
        ClientCreateRequest request = new ClientCreateRequest("Jane Doe", "+46701234567", "  ", "Notes");
        
        Client client = new Client();
        client.setId(UUID.randomUUID());
        client.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        client.setFullName(request.getFullName());
        client.setPhone(request.getPhone());
        client.setEmail(null);
        client.setNotes(request.getNotes());

        when(clientRepository.save(any(Client.class))).thenAnswer(invocation -> {
            Client argument = invocation.getArgument(0);
            assertNull(argument.getEmail());
            assertEquals(TenantConstants.DEFAULT_STUDIO_ID, argument.getStudioId());
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
        client.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        client.setFullName("John Smith");
        client.setPhone("123456");

        when(clientRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(client));

        ClientResponse response = clientService.getClientById(id);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals(TenantConstants.DEFAULT_STUDIO_ID, response.getStudioId());
        assertEquals("John Smith", response.getFullName());
    }

    @Test
    void getClientById_NotFound_ThrowsException() {
        UUID id = UUID.randomUUID();
        when(clientRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> clientService.getClientById(id));
    }

    @Test
    void updateClient_Success() {
        UUID id = UUID.randomUUID();
        Client client = new Client();
        client.setId(id);
        client.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        client.setFullName("John Smith");
        client.setPhone("123456");

        ClientUpdateRequest request = new ClientUpdateRequest("John Updated", "654321", "updated@example.com", "Updated Notes");

        when(clientRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(client));
        when(clientRepository.save(any(Client.class))).thenReturn(client);

        ClientResponse response = clientService.updateClient(id, request);

        assertNotNull(response);
        assertEquals("John Updated", response.getFullName());
        assertEquals("654321", response.getPhone());
        assertEquals("updated@example.com", response.getEmail());
        assertEquals(TenantConstants.DEFAULT_STUDIO_ID, response.getStudioId());
    }

    @Test
    void updateClient_NotFound_ThrowsException() {
        UUID id = UUID.randomUUID();
        ClientUpdateRequest request = new ClientUpdateRequest("John Updated", "654321", "updated@example.com", "Updated Notes");

        when(clientRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> clientService.updateClient(id, request));
    }

    @Test
    void deleteClient_Success() {
        UUID id = UUID.randomUUID();
        Client client = new Client();
        client.setId(id);
        client.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(clientRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.of(client));
        doNothing().when(clientRepository).delete(client);

        assertDoesNotThrow(() -> clientService.deleteClient(id));

        verify(clientRepository, times(1)).delete(client);
    }

    @Test
    void deleteClient_NotFound_ThrowsException() {
        UUID id = UUID.randomUUID();
        when(clientRepository.findByIdAndStudioId(id, TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> clientService.deleteClient(id));
    }

    @Test
    void listClients_NoSearch_ReturnsAllForDefaultStudio() {
        Client c1 = new Client();
        c1.setFullName("Client One");
        c1.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        Client c2 = new Client();
        c2.setFullName("Client Two");
        c2.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(clientRepository.findAllByStudioId(TenantConstants.DEFAULT_STUDIO_ID)).thenReturn(List.of(c1, c2));

        List<ClientResponse> responses = clientService.listClients(null);

        assertEquals(2, responses.size());
        verify(clientRepository, times(1)).findAllByStudioId(TenantConstants.DEFAULT_STUDIO_ID);
        verify(clientRepository, never()).findAll();
    }

    @Test
    void listClients_WithSearch_ReturnsMatchingForDefaultStudio() {
        Client c1 = new Client();
        c1.setFullName("Client One");
        c1.setStudioId(TenantConstants.DEFAULT_STUDIO_ID);

        when(clientRepository.searchClientsByStudio(TenantConstants.DEFAULT_STUDIO_ID, "Client")).thenReturn(List.of(c1));

        List<ClientResponse> responses = clientService.listClients("Client");

        assertEquals(1, responses.size());
        assertEquals("Client One", responses.get(0).getFullName());
        verify(clientRepository, times(1)).searchClientsByStudio(TenantConstants.DEFAULT_STUDIO_ID, "Client");
    }

    @Test
    void listClientsForStudio_CustomStudio_ReturnsMatching() {
        UUID customStudioId = UUID.randomUUID();
        when(tenantContext.getCurrentStudioId()).thenReturn(customStudioId);
        Client c1 = new Client();
        c1.setFullName("Client One");
        c1.setStudioId(customStudioId);

        when(clientRepository.findAllByStudioId(customStudioId)).thenReturn(List.of(c1));

        List<ClientResponse> responses = clientService.listClientsForStudio(customStudioId, null);

        assertEquals(1, responses.size());
        assertEquals("Client One", responses.get(0).getFullName());
        assertEquals(customStudioId, responses.get(0).getStudioId());
        verify(clientRepository, times(1)).findAllByStudioId(customStudioId);
    }

    @Test
    void clientTenantIsolationTest() {
        UUID studioA = UUID.randomUUID();
        UUID studioB = UUID.randomUUID();
        UUID clientId = UUID.randomUUID();

        // 1. Authenticate as Studio A
        when(tenantContext.getCurrentStudioId()).thenReturn(studioA);

        Client clientA = new Client();
        clientA.setId(clientId);
        clientA.setStudioId(studioA);
        clientA.setFullName("Client of Studio A");

        // Mock database
        when(clientRepository.findByIdAndStudioId(clientId, studioA)).thenReturn(Optional.of(clientA));
        when(clientRepository.findByIdAndStudioId(clientId, studioB)).thenReturn(Optional.empty());

        // Fetching under Studio A should work
        ClientResponse response = clientService.getClientById(clientId);
        assertEquals("Client of Studio A", response.getFullName());
        assertEquals(studioA, response.getStudioId());

        // 2. Switch context to Studio B
        when(tenantContext.getCurrentStudioId()).thenReturn(studioB);

        // Fetching under Studio B should throw ResourceNotFoundException
        assertThrows(ResourceNotFoundException.class, () -> clientService.getClientById(clientId));

        // Creating client under Studio B but specifying Studio A ID in payload should fail
        ClientCreateRequest request = new ClientCreateRequest("Jane Doe", "+46701234567", "jane@example.com", "Notes", studioA);
        assertThrows(IllegalArgumentException.class, () -> clientService.createClient(request));
    }
}

