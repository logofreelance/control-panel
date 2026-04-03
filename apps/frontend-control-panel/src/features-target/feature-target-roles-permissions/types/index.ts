/**
 * feature-target-roles-permissions/types/index.ts
 * 
 * Unified TypeScript interfaces for Roles and Permissions
 */

export interface Role {
    id: number;
    name: string;
    display_name: string | null;
    description: string | null;
    level: number;
    is_super: boolean;
    permissions: string | null; // JSON string of permission names
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
    description: string | null;
}

export interface PermissionForm {
    name: string;
    group: string;
    description: string;
}

export interface GroupedPermissions {
    [group: string]: Permission[];
}

// System role names that cannot be deleted or modified in specific ways
export const SYSTEM_ROLES = ['super_admin', 'admin', 'user'] as const;

export interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
}
