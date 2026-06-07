import { ApiClient } from '../../../lib/api-client';
import type { LoginResponse, CurrentUserResponse, SignupResponse, UserEffectivePermissionResponse } from '../types';

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
 * Retrieves the current authenticated user's page permissions.
 */
export async function getCurrentUserPermissions(): Promise<UserEffectivePermissionResponse> {
  return ApiClient.get<UserEffectivePermissionResponse>('/api/auth/me/permissions');
}

/**
 * Retrieves a specific user's page permissions.
 */
export async function getUserPermissions(userId: string): Promise<UserEffectivePermissionResponse> {
  return ApiClient.get<UserEffectivePermissionResponse>(`/api/users/${userId}/permissions`);
}

/**
 * Updates a specific user's page permissions.
 */
export async function updateUserPermissions(
  userId: string,
  permissions: { pageKey: string; accessLevel: string }[]
): Promise<void> {
  return ApiClient.put<void>(`/api/users/${userId}/permissions`, permissions);
}

/**
 * Attempts to log out by calling the backend custom logout endpoint (POST /api/auth/logout)
 * with credentials included. If it fails, catches the error and allows the frontend to fallback
 * gracefully to clearing local frontend authentication state.
 */
export async function logout(): Promise<void> {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const url = `${baseUrl}/api/auth/logout`;
    const response = await fetch(url, {
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

/**
 * Submits a registration request for a new studio.
 */
export async function signup(data: any): Promise<SignupResponse> {
  return ApiClient.post<SignupResponse>('/api/auth/signup', data);
}

/**
 * Initiates the password recovery flow.
 */
export async function forgotPassword(email: string): Promise<void> {
  return ApiClient.post<void>('/api/auth/forgot-password', { email });
}

/**
 * Resets the password using a reset token.
 */
export async function resetPassword(token: string, password: string): Promise<void> {
  return ApiClient.post<void>('/api/auth/reset-password', { token, password });
}

/**
 * Accepts an invitation and sets a password using an invitation token.
 */
export async function acceptInvite(token: string, password: string): Promise<void> {
  return ApiClient.post<void>('/api/auth/accept-invite', { token, password });
}

