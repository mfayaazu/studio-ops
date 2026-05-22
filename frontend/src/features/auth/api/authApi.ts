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
 * Attempts to log out by calling the backend custom logout endpoint (POST /api/auth/logout)
 * with credentials included. If it fails, catches the error and allows the frontend to fallback
 * gracefully to clearing local frontend authentication state.
 */
export async function logout(): Promise<void> {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) {
      console.warn(
        `Custom logout endpoint /api/auth/logout returned status ${response.status}. ` +
        `Falling back to clearing local frontend authentication state.`
      );
    } else {
      console.log('Successfully logged out from backend session.');
    }
  } catch (error) {
    console.warn(
      'Custom logout endpoint /api/auth/logout call failed or is unreachable. ' +
      'Falling back to clearing local frontend authentication state.',
      error
    );
  }
}
