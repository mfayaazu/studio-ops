import React from 'react';
import { RouterProvider } from './router';
import { AuthProvider } from '../features/auth/AuthProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <RouterProvider>
        {children}
      </RouterProvider>
    </AuthProvider>
  );
};
