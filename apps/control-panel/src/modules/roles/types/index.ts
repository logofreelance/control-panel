/**
 * roles/types/index.ts
 * 
 * TypeScript interfaces for roles module
 */

export interface Role {
    id: number;
    name: string;
    display_name: string | null;
    description: string | null;
    level: number;
    is_super: boolean;
    permissions: string | null;
    is_active: boolean;
    created_at: string;
}

export interface RoleForm {
    name: string;
    displayName: string;
    description: string;
    level: number;
    isSuper: boolean;
    selectedPermissions: string[];
}

export interface Permission {
    id: number;
    name: string;
    group: string | null;
}

export interface GroupedPermissions {
    [group: string]: Permission[];
}

export interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
}

// System role names that cannot be deleted
export const SYSTEM_ROLES = ['super_admin', 'admin', 'user'] as const;
