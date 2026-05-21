export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';

export interface Employee {
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

// Keep EmployeeResponse as a type alias for compatibility
export type EmployeeResponse = Employee;

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
