import React, { useState, useEffect } from 'react';
import { Providers } from './providers';
import { useRouter } from './router';
import { MainLayout } from '../components/layout/MainLayout';

// Page components
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { ClientsPage } from '../features/clients/pages/ClientsPage';
import { ProjectsPage } from '../features/projects/pages/ProjectsPage';
import { EmployeesPage } from '../features/employees/pages/EmployeesPage';
import { EventsPage } from '../features/events/pages/EventsPage';
import { AvailabilityPlannerPage } from '../features/assignments/pages/AvailabilityPlannerPage';
import { BackupCenterPage } from '../features/backups/pages/BackupCenterPage';

interface HealthResponse {
  status: string;
  timestamp: string;
  services?: {
    database: string;
  };
  error?: string;
}

const AppContent: React.FC = () => {
  const { currentRoute } = useRouter();
  
  const [health, setHealth] = useState<{
    status: 'connecting' | 'online' | 'offline';
    latency: number | null;
  }>({
    status: 'connecting',
    latency: null,
  });

  const [checking, setChecking] = useState(false);

  const checkSystemHealth = async () => {
    setChecking(true);
    const startTime = performance.now();
    try {
      const response = await fetch('/api/health');
      const latency = Math.round(performance.now() - startTime);
      
      if (response.ok) {
        const data: HealthResponse = await response.json();
        setHealth({
          status: data.status === 'UP' ? 'online' : 'offline',
          latency,
        });
      } else {
        setHealth({
          status: 'offline',
          latency,
        });
      }
    } catch {
      const latency = Math.round(performance.now() - startTime);
      setHealth({
        status: 'offline',
        latency,
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const renderActivePage = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <DashboardPage />;
      case 'clients':
        return <ClientsPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'employees':
        return <EmployeesPage />;
      case 'events':
        return <EventsPage />;
      case 'availability':
        return <AvailabilityPlannerPage />;
      case 'backups':
        return <BackupCenterPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <MainLayout
      apiStatus={health.status}
      latency={health.latency}
      onRefreshHealth={checkSystemHealth}
      isRefreshing={checking}
    >
      {renderActivePage()}
    </MainLayout>
  );
};

export const App: React.FC = () => {
  return (
    <Providers>
      <AppContent />
    </Providers>
  );
};

export default App;
