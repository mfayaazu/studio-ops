import { ApiClient } from '../../../lib/api-client';
import type { Employee, EmployeeCreateRequest, EmployeeUpdateRequest } from '../types';

export const fetchEmployees = (search?: string): Promise<Employee[]> => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return ApiClient.get<Employee[]>(`/api/employees${query}`);
};

export const createEmployee = (data: EmployeeCreateRequest): Promise<Employee> => {
  return ApiClient.post<Employee>('/api/employees', data);
};

export const updateEmployee = (id: string, data: EmployeeUpdateRequest): Promise<Employee> => {
  return ApiClient.put<Employee>(`/api/employees/${id}`, data);
};

export const deleteEmployee = (id: string): Promise<void> => {
  return ApiClient.delete<void>(`/api/employees/${id}`);
};

// Backward compatible object wrapper if referenced elsewhere
export const employeesApi = {
  list: fetchEmployees,
  getById: (id: string): Promise<Employee> => {
    return ApiClient.get<Employee>(`/api/employees/${id}`);
  },
  create: createEmployee,
  update: updateEmployee,
  delete: deleteEmployee,
};
