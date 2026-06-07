import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserResponse, PageKey, AccessLevel } from './types';
import * as authApi from './api/authApi';

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: Record<PageKey, AccessLevel> | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [permissions, setPermissions] = useState<Record<PageKey, AccessLevel> | null>(null);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await authApi.getCurrentUser();
        if (response.authenticated && response.user) {
          setUser(response.user);
          setIsAuthenticated(true);
          try {
            const permsResponse = await authApi.getCurrentUserPermissions();
            setPermissions(permsResponse.effectivePermissions);
          } catch (pErr) {
            console.error('Failed to load permissions on mount', pErr);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setPermissions(null);
        }
      } catch (error) {
        console.debug('No active session found or API check failed:', error);
        setUser(null);
        setIsAuthenticated(false);
        setPermissions(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      if (response.status === 'SUCCESS' && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        try {
          const permsResponse = await authApi.getCurrentUserPermissions();
          setPermissions(permsResponse.effectivePermissions);
        } catch (pErr) {
          console.error('Failed to load permissions on login', pErr);
        }
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setPermissions(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setPermissions(null);
      setIsLoading(false);
    }
  };

  const refreshPermissions = async () => {
    try {
      const permsResponse = await authApi.getCurrentUserPermissions();
      setPermissions(permsResponse.effectivePermissions);
    } catch (error) {
      console.error('Failed to refresh user permissions:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, permissions, login, logout, refreshPermissions }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

