import type { UserRole } from './types';
import type { AppRoute } from '../../app/router';

export const ROLE_ROUTE_ACCESS: Record<UserRole, AppRoute[]> = {
  OWNER: [
    'dashboard', 'clients', 'projects', 'employees', 'events', 
    'availability', 'deliverables', 'backups', 'follow-up-center', 
    'post-production', 'quotations'
  ],
  ADMIN: [
    'dashboard', 'clients', 'projects', 'employees', 'events', 
    'availability', 'deliverables', 'backups', 'follow-up-center', 
    'post-production', 'quotations'
  ],
  PROJECT_MANAGER: [
    'dashboard', 'clients', 'projects', 'events', 
    'deliverables', 'backups', 'post-production'
  ],
  EDITOR: [
    'events', 'deliverables', 'post-production'
  ],
  EMPLOYEE: [
    'events'
  ]
};

export const canAccessRoute = (role: UserRole, route: AppRoute): boolean => {
  const allowed = ROLE_ROUTE_ACCESS[role];
  return allowed ? allowed.includes(route) : false;
};
