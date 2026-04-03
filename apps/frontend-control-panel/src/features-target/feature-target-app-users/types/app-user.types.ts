// src/features-target/feature-target-app-users/types/app-user.types.ts
/**
 * AppUser represents a user within the target system (backend system),
 * distinct from Control Panel administrative staff.
 */

export interface AppUser {
    id: number;
    username: string;
    email: string;
    role: string; // Role name from roles table
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    // Role info from LEFT JOIN with roles table
    roleLevel?: number | null;
    roleIsSuper?: boolean | null;
    roleDisplayName?: string | null;
}

// Flexible role type - roles are now dynamic from target database
export type AppUserRole = string;

export interface AppUserRoleInfo {
    name: string;
    display_name: string;
    level: number;
    is_super: boolean;
}

export interface AppUserFormData {
    username: string;
    email: string;
    password: string;
    role: string;
}

export interface AppUsersFilterState {
    search: string;
    status: 'all' | 'active' | 'inactive';
    role: string; // Can be any role from database
    dateOrder: 'newest' | 'oldest';
}

export interface AppUserPaginationState {
    page: number;
    limit: number;
    total: number;
}

export interface AppUserApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    meta?: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
    message?: string;
}
