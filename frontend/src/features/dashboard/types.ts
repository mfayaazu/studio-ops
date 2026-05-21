export interface DashboardStats {
  totalClients: number;
  activeProjects: number;
  upcomingEventsCount: number;
  successfulBackupsCount: number;
}

export interface DashboardWarning {
  type: string;
  employeeId: string;
  employeeName: string;
  eventId: string;
  eventTitle: string;
  overlappingEventTitle: string;
  conflictTime: string;
}

export interface DashboardBackupChecklist {
  projectId: string;
  projectName: string;
  deliverableId: string;
  deliverableName: string;
  redundantBackupCount: number;
  status: 'WARNING_LOW_REDUNDANCY' | 'SAFE';
  details: string;
}

export interface DashboardSummaryResponse {
  stats: DashboardStats;
  warnings: DashboardWarning[];
  backupChecklists: DashboardBackupChecklist[];
}
