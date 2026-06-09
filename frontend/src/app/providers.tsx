import React from 'react';
import { RouterProvider } from './router';
import { AuthProvider } from '../features/auth/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client for TanStack Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disable automatic refetching on window focus for beta stability
      retry: 1, // Retry failed network queries once
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider>
          {children}
        </RouterProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

