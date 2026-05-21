export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';

export interface EmployeeResponse {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone?: string;
  primaryRole: string;
  skills?: string;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeCreateRequest {
  userId?: string;
  fullName: string;
  email: string;
  phone?: string;
  primaryRole: string;
  skills?: string;
  status: EmployeeStatus;
}

export interface EmployeeUpdateRequest {
  userId?: string;
  fullName: string;
  email: string;
  phone?: string;
  primaryRole: string;
  skills?: string;
  status: EmployeeStatus;
}
