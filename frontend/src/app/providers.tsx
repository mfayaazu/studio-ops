import React from 'react';
import { RouterProvider } from './router';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <RouterProvider>
      {children}
    </RouterProvider>
  );
};
