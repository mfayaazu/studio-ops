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
  loginEmail?: string;
  userRole?: string;
  loginEnabled?: boolean;
  inviteWarning?: string;
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
  createLogin?: boolean;
  loginEmail?: string;
  userRole?: string;
  temporaryPassword?: string;
  sendInviteEmail?: boolean;
}

export interface EmployeeUpdateRequest {
  userId?: string;
  fullName: string;
  email: string;
  phone?: string;
  primaryRole: string;
  skills?: string;
  status: EmployeeStatus;
  createLogin?: boolean;
  loginEmail?: string;
  userRole?: string;
  temporaryPassword?: string;
  sendInviteEmail?: boolean;
}
