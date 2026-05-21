export interface ClientResponse {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

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
