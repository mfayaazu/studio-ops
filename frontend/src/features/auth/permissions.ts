import type { UserRole, PageKey, AccessLevel } from './types';
import type { AppRoute } from '../../app/router';

export const ROUTE_TO_PAGE_KEY: Record<AppRoute, PageKey | null> = {
  dashboard: 'DASHBOARD',
  clients: 'CLIENTS',
  projects: 'PROJECTS',
  employees: 'EMPLOYEES',
  events: 'EVENTS',
  availability: 'EVENTS', // availability is linked to events
  backups: 'BACKUP',
  deliverables: 'DELIVERABLES',
  'follow-up-center': 'FOLLOW_UP_CENTER',
  'post-production': 'POST_PRODUCTION',
  quotations: 'QUOTATIONS',
  'message-templates': 'FOLLOW_UP_CENTER',
  'forgot-password': null,
  'reset-password': null,
  'accept-invite': null,
  'my-account': null,
};

export const ROLE_PAGE_DEFAULTS: Record<UserRole, Record<PageKey, AccessLevel>> = {
  OWNER: {
    DASHBOARD: 'EDIT',
    FOLLOW_UP_CENTER: 'EDIT',
    CLIENTS: 'EDIT',
    QUOTATIONS: 'EDIT',
    PROJECTS: 'EDIT',
    EVENTS: 'EDIT',
    DELIVERABLES: 'EDIT',
    BACKUP: 'EDIT',
    POST_PRODUCTION: 'EDIT',
    EMPLOYEES: 'EDIT',
  },
  ADMIN: {
    DASHBOARD: 'EDIT',
    FOLLOW_UP_CENTER: 'EDIT',
    CLIENTS: 'EDIT',
    QUOTATIONS: 'EDIT',
    PROJECTS: 'EDIT',
    EVENTS: 'EDIT',
    DELIVERABLES: 'EDIT',
    BACKUP: 'EDIT',
    POST_PRODUCTION: 'EDIT',
    EMPLOYEES: 'EDIT',
  },
  PROJECT_MANAGER: {
    DASHBOARD: 'EDIT',
    FOLLOW_UP_CENTER: 'EDIT',
    CLIENTS: 'EDIT',
    QUOTATIONS: 'VIEW',
    PROJECTS: 'EDIT',
    EVENTS: 'EDIT',
    DELIVERABLES: 'EDIT',
    BACKUP: 'EDIT',
    POST_PRODUCTION: 'EDIT',
    EMPLOYEES: 'NONE',
  },
  EDITOR: {
    DASHBOARD: 'NONE',
    FOLLOW_UP_CENTER: 'NONE',
    CLIENTS: 'NONE',
    QUOTATIONS: 'NONE',
    PROJECTS: 'NONE',
    EVENTS: 'EDIT',
    DELIVERABLES: 'EDIT',
    BACKUP: 'NONE',
    POST_PRODUCTION: 'EDIT',
    EMPLOYEES: 'NONE',
  },
  EMPLOYEE: {
    DASHBOARD: 'NONE',
    FOLLOW_UP_CENTER: 'NONE',
    CLIENTS: 'NONE',
    QUOTATIONS: 'NONE',
    PROJECTS: 'NONE',
    EVENTS: 'VIEW',
    DELIVERABLES: 'NONE',
    BACKUP: 'NONE',
    POST_PRODUCTION: 'NONE',
    EMPLOYEES: 'NONE',
  },
};

export const getAccessLevel = (
  permissions: Record<PageKey, AccessLevel> | null,
  pageKey: PageKey,
  role?: UserRole
): AccessLevel => {
  if (role === 'OWNER') {
    return 'EDIT';
  }
  if (permissions && pageKey in permissions) {
    return permissions[pageKey];
  }
  if (role && ROLE_PAGE_DEFAULTS[role]) {
    return ROLE_PAGE_DEFAULTS[role][pageKey] || 'NONE';
  }
  return 'NONE';
};

export const canViewPage = (
  permissions: Record<PageKey, AccessLevel> | null,
  pageKey: PageKey,
  role?: UserRole
): boolean => {
  const level = getAccessLevel(permissions, pageKey, role);
  return level === 'VIEW' || level === 'EDIT';
};

export const canEditPage = (
  permissions: Record<PageKey, AccessLevel> | null,
  pageKey: PageKey,
  role?: UserRole
): boolean => {
  const level = getAccessLevel(permissions, pageKey, role);
  return level === 'EDIT';
};

export const canAccessRoute = (
  role: UserRole,
  route: AppRoute,
  permissions?: Record<PageKey, AccessLevel> | null
): boolean => {
  if (route === 'my-account') {
    return true;
  }
  const pageKey = ROUTE_TO_PAGE_KEY[route];
  if (!pageKey) {
    return false;
  }
  return canViewPage(permissions || null, pageKey, role);
};
