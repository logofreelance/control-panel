// Users module constants
import { env } from '@/lib/env';
import { RESOURCE_ROUTES } from '@cp/constants';

export const USERS_ENDPOINTS = {
    list: `${env.API_BASE}${RESOURCE_ROUTES.USERS}`,
    create: `${env.API_BASE}${RESOURCE_ROUTES.USERS}`,
    update: (id: number) => `${env.API_BASE}${RESOURCE_ROUTES.USERS}/${id}`,
    delete: (id: number) => `${env.API_BASE}${RESOURCE_ROUTES.USERS}/${id}`,
    permissions: (userId: number) => `${env.API_BASE}${RESOURCE_ROUTES.USERS}/${userId}/permissions`,
    roles: `${env.API_BASE}${RESOURCE_ROUTES.ROLES}`,
} as const;

// REMOVED: ROLES, ROLE_COLORS, ROLE_LABELS
// These are now fetched dynamically from /orange/roles

export const PAGE_LIMITS = [5, 10, 20, 50] as const;

export const DEFAULT_FILTER = {
    search: '',
    status: 'all' as const,
    role: 'all' as const,
    dateOrder: 'newest' as const,
};

export const DEFAULT_PAGINATION = {
    page: 1,
    limit: 10,
    total: 0,
};
