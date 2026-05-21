import { ApiClient } from '../../../lib/api-client';
import type { LoginResponse, CurrentUserResponse } from '../types';

/**
 * Sends a login request with credentials.
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  return ApiClient.post<LoginResponse>('/api/auth/login', { email, password });
}

/**
 * Retrieves the current authenticated user's profile based on session cookie.
 */
export async function getCurrentUser(): Promise<CurrentUserResponse> {
  return ApiClient.get<CurrentUserResponse>('/api/auth/me');
}

/**
 * Attempts to log out by calling Spring Security's default logout endpoint (POST /logout)
 * with credentials included. If it fails (e.g. due to proxy path mappings or missing endpoint),
 * catches the error and falls back to clearing local frontend authentication state.
 */
export async function logout(): Promise<void> {
  try {
    const response = await fetch('/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    });
    if (!response.ok) {
      console.warn(
        `Spring Security default logout endpoint /logout returned status ${response.status}. ` +
        `Falling back to clearing local frontend authentication state.`
      );
    } else {
      console.log('Successfully logged out from Spring Security session.');
    }
  } catch (error) {
    console.warn(
      'Spring Security default logout endpoint /logout call failed or is unreachable. ' +
      'Falling back to clearing local frontend authentication state.',
      error
    );
  }
}
