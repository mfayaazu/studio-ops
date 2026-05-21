export interface Client {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Keep ClientResponse as a type alias for compatibility if needed elsewhere
export type ClientResponse = Client;

export interface ClientCreateRequest {
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface ClientUpdateRequest {
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
}
