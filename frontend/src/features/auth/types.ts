export type UserRole = 'OWNER' | 'ADMIN' | 'PROJECT_MANAGER' | 'EMPLOYEE' | 'EDITOR';

export type UserStatus = 'ACTIVE' | 'DISABLED';

export interface UserResponse {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  displayName: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  studioId?: string;
  studioName?: string;
  studioStatus?: string;
}

export interface LoginResponse {
  status: string;
  user: UserResponse;
}

export interface CurrentUserResponse {
  authenticated: boolean;
  user: UserResponse | null;
}

export interface SignupResponse {
  message: string;
  studioId: string;
  studioName: string;
  studioStatus: string;
  ownerEmail: string;
}

