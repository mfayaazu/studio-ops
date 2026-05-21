import { ApiClient } from '../../../lib/api-client';
import type { EmployeeResponse, EmployeeCreateRequest, EmployeeUpdateRequest } from '../types';

export const employeesApi = {
  list: (search?: string): Promise<EmployeeResponse[]> => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return ApiClient.get<EmployeeResponse[]>(`/api/employees${query}`);
  },
  
  getById: (id: string): Promise<EmployeeResponse> => {
    return ApiClient.get<EmployeeResponse>(`/api/employees/${id}`);
  },
  
  create: (data: EmployeeCreateRequest): Promise<EmployeeResponse> => {
    return ApiClient.post<EmployeeResponse>('/api/employees', data);
  },
  
  update: (id: string, data: EmployeeUpdateRequest): Promise<EmployeeResponse> => {
    return ApiClient.put<EmployeeResponse>(`/api/employees/${id}`, data);
  },
  
  delete: (id: string): Promise<void> => {
    return ApiClient.delete<void>(`/api/employees/${id}`);
  },
};
