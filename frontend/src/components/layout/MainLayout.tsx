import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
  apiStatus: 'online' | 'connecting' | 'offline';
  latency: number | null;
  onRefreshHealth: () => void;
  isRefreshing: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  apiStatus,
  latency,
  onRefreshHealth,
  isRefreshing,
}) => {
  return (
    <div className="flex min-h-screen bg-[#090d16] font-sans text-slate-300">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main viewport area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header
          apiStatus={apiStatus}
          latency={latency}
          onRefreshHealth={onRefreshHealth}
          isRefreshing={isRefreshing}
        />
        
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
};
