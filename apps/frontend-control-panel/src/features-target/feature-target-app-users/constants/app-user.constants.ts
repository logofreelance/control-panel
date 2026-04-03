// src/features-target/feature-target-app-users/constants/app-user.constants.ts
import { env } from '@/lib/env';
import { RESOURCE_ROUTES } from '@/lib/constants';

/**
 * Endpoints for App User management in the target system.
 * These rely on the modular backend structured to handle x-target-id.
 */
export const APP_USER_ENDPOINTS = {
    list: `${env.API_URL}/app-users`,
    create: `${env.API_URL}/app-users`,
    update: (id: number) => `${env.API_URL}/app-users/${id}`,
    delete: (id: number) => `${env.API_URL}/app-users/${id}`,
    permissions: (userId: number) => `${env.API_URL}/app-users/${userId}/permissions`,
    roles: `${env.API_URL}/roles`, // Roles are already target-specific
} as const;

export const APP_USER_PAGE_LIMITS = [5, 10, 20, 50] as const;

export const APP_USER_DEFAULT_FILTER = {
    search: '',
    status: 'all' as const,
    role: 'all' as const,
    dateOrder: 'newest' as const,
} as const;

export const APP_USER_DEFAULT_PAGINATION = {
    page: 1,
    limit: 10,
    total: 0,
} as const;
