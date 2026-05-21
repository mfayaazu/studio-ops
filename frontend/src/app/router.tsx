import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppRoute = 'dashboard' | 'clients' | 'projects' | 'employees' | 'events' | 'availability';

interface RouterContextType {
  currentRoute: AppRoute;
  navigateTo: (route: AppRoute) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('dashboard');

  // Sync hash changes if user uses browser history (optional but useful)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '') as AppRoute;
      const validRoutes: AppRoute[] = ['dashboard', 'clients', 'projects', 'employees', 'events', 'availability'];
      if (validRoutes.includes(hash)) {
        setCurrentRoute(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initialize
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigateTo = (route: AppRoute) => {
    setCurrentRoute(route);
    window.location.hash = `#/${route}`;
  };

  return (
    <RouterContext.Provider value={{ currentRoute, navigateTo }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
