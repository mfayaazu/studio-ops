package com.studioops.client;

import com.studioops.client.dto.ClientResponse;

public class ClientMapper {

    public static ClientResponse toResponse(Client client) {
        if (client == null) {
            return null;
        }
        ClientResponse response = new ClientResponse();
        response.setId(client.getId());
        response.setFullName(client.getFullName());
        response.setPhone(client.getPhone());
        response.setEmail(client.getEmail());
        response.setNotes(client.getNotes());
        response.setCreatedAt(client.getCreatedAt());
        response.setUpdatedAt(client.getUpdatedAt());
        return response;
    }
}
