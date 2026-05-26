import { ApiClient } from '../../../lib/api-client';
import type { Quotation, QuotationCreateRequest, QuotationUpdateRequest, QuotationStatus } from '../types';

export const fetchQuotations = (status?: QuotationStatus): Promise<Quotation[]> => {
  const query = status ? `?status=${status}` : '';
  return ApiClient.get<Quotation[]>(`/api/quotations${query}`);
};

export const fetchQuotation = (id: string): Promise<Quotation> => {
  return ApiClient.get<Quotation>(`/api/quotations/${id}`);
};

export const createQuotation = (data: QuotationCreateRequest): Promise<Quotation> => {
  return ApiClient.post<Quotation>('/api/quotations', data);
};

export const updateQuotation = (id: string, data: QuotationUpdateRequest): Promise<Quotation> => {
  return ApiClient.put<Quotation>(`/api/quotations/${id}`, data);
};

export const updateQuotationStatus = (id: string, status: QuotationStatus): Promise<Quotation> => {
  return ApiClient.post<Quotation>(`/api/quotations/${id}/status`, { status });
};

export const deleteQuotation = (id: string): Promise<void> => {
  return ApiClient.delete<void>(`/api/quotations/${id}`);
};

export const quotationsApi = {
  list: fetchQuotations,
  getById: fetchQuotation,
  create: createQuotation,
  update: updateQuotation,
  updateStatus: updateQuotationStatus,
  delete: deleteQuotation,
};
