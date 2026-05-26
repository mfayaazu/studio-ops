import React, { useState, useEffect } from 'react';
import { Providers } from './providers';
import { useRouter } from './router';
import { MainLayout } from '../components/layout/MainLayout';
import { useAuth } from '../features/auth/AuthProvider';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { Loader2 } from 'lucide-react';

// Page components
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { ClientsPage } from '../features/clients/pages/ClientsPage';
import { ProjectsPage } from '../features/projects/pages/ProjectsPage';
import { EmployeesPage } from '../features/employees/pages/EmployeesPage';
import { EventsPage } from '../features/events/pages/EventsPage';
import { AvailabilityPlannerPage } from '../features/assignments/pages/AvailabilityPlannerPage';
import { BackupCenterPage } from '../features/backups/pages/BackupCenterPage';
import { DeliverablesPage } from '../features/deliverables/pages/DeliverablesPage';
import { FollowUpCenterPage } from '../features/followup/pages/FollowUpCenterPage';
import { PostProductionBoardPage } from '../features/postproduction/pages/PostProductionBoardPage';

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
  const { isAuthenticated, isLoading } = useAuth();
  
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
      case 'deliverables':
        return <DeliverablesPage />;
      case 'follow-up-center':
        return <FollowUpCenterPage />;
      case 'post-production':
        return <PostProductionBoardPage />;
      default:
        return <DashboardPage />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
        <span className="text-slate-400 text-xs font-medium tracking-wide">Initializing workspace...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

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
