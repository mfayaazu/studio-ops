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

    const response = await fetch(path, config);

    if (response.status === 204) {
      return {} as T;
    }

    if (!response.ok) {
      let errorBody: ApiError;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = {
          status: response.status,
          message: `HTTP request failed with status ${response.status}`,
        };
      }
      throw errorBody;
    }

    return response.json() as Promise<T>;
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
