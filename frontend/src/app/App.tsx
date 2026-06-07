import React, { useState, useEffect } from 'react';
import { Providers } from './providers';
import { useRouter } from './router';
import type { AppRoute } from './router';
import { MainLayout } from '../components/layout/MainLayout';
import { useAuth } from '../features/auth/AuthProvider';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { PendingApprovalPage } from '../features/auth/pages/PendingApprovalPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';
import { AcceptInvitePage } from '../features/auth/pages/AcceptInvitePage';
import { Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { canAccessRoute } from '../features/auth/permissions';

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
import { QuotationsPage } from '../features/quotations/pages/QuotationsPage';

interface HealthResponse {
  status: string;
  timestamp: string;
  services?: {
    database: string;
  };
  error?: string;
}

interface AccessRestrictedPageProps {
  role: string;
  route: string;
  allowedRoutes: string[];
  onNavigate: (route: any) => void;
}

const AccessRestrictedPage: React.FC<AccessRestrictedPageProps> = ({ role, route, allowedRoutes, onNavigate }) => {
  const firstAllowedRoute = allowedRoutes[0] || 'events';
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-[#0d1424] border border-slate-800/80 rounded-2xl shadow-xl max-w-xl mx-auto space-y-6">
      <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
        <ShieldAlert className="h-8 w-8" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-xl font-heading font-bold text-white tracking-wide">
          Access Restricted
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-md">
          Your account role (<span className="text-slate-200 font-semibold">{role}</span>) does not have permission to view the <span className="text-slate-250 font-mono font-semibold">/{route}</span> module.
        </p>
      </div>

      <div className="pt-4 w-full">
        <button
          onClick={() => onNavigate(firstAllowedRoute)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-semibold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-violet-500/20 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Access Area ({firstAllowedRoute})</span>
        </button>
      </div>
    </div>
  );
};

const RedirectToTemplatesTab: React.FC = () => {
  const { navigateTo } = useRouter();
  useEffect(() => {
    window.location.hash = '#/follow-up-center?tab=templates';
    navigateTo('follow-up-center');
  }, [navigateTo]);
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
      <Loader2 className="h-6 w-6 text-violet-500 animate-spin" />
      <span className="text-slate-400 text-xs font-semibold">Redirecting to templates...</span>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { currentRoute, navigateTo } = useRouter();
  const { isAuthenticated, isLoading, user, permissions } = useAuth();
  
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
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const url = `${baseUrl}/api/health`;
      const response = await fetch(url);
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
    if (user) {
      const allowed = canAccessRoute(user.role, currentRoute, permissions);
      if (!allowed) {
        const allRoutes: AppRoute[] = [
          'dashboard', 'clients', 'projects', 'employees', 'events',
          'availability', 'backups', 'deliverables', 'follow-up-center',
          'post-production', 'quotations'
        ];
        const allowedRoutes = allRoutes.filter(r => canAccessRoute(user.role, r, permissions));
        return (
          <AccessRestrictedPage
            role={user.role}
            route={currentRoute}
            allowedRoutes={allowedRoutes}
            onNavigate={navigateTo}
          />
        );
      }
    }

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
      case 'message-templates':
        return <RedirectToTemplatesTab />;
      case 'post-production':
        return <PostProductionBoardPage />;
      case 'quotations':
        return <QuotationsPage />;
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
    if (currentRoute === 'forgot-password') {
      return <ForgotPasswordPage />;
    }
    if (currentRoute === 'reset-password') {
      return <ResetPasswordPage />;
    }
    if (currentRoute === 'accept-invite') {
      return <AcceptInvitePage />;
    }
    return <LoginPage />;
  }

  if (user && user.studioStatus === 'PENDING_APPROVAL') {
    return <PendingApprovalPage />;
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
