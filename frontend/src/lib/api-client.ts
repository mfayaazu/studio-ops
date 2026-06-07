/**
 * Lightweight API client for StudioOps backend.
 * Provides a standardized fetch wrapper with error handling.
 */

export interface ApiError {
  status: number;
  message: string;
  error?: string;
  timestamp?: string;
}

export class ApiClient {
  private static async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };

    const baseUrl = import.meta.env.VITE_API_URL || '';
    const url = path.startsWith('http') ? path : `${baseUrl}${path}`;
    const response = await fetch(url, config);

    if (response.status === 204) {
      return {} as T;
    }

    const text = await response.text();
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    let data: any = null;
    if (text && isJson) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn('Failed to parse response body as JSON', e);
      }
    }

    if (!response.ok) {
      const errorBody: ApiError = data || {
        status: response.status,
        message: text || `HTTP request failed with status ${response.status}`,
      };
      throw errorBody;
    }

    if (!text) {
      return {} as T;
    }

    return (data !== null ? data : text) as T;
  }

  static get<T>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  static post<T>(path: string, data: any, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static put<T>(path: string, data: any, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static delete<T>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}
