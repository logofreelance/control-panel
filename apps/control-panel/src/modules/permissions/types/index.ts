/**
 * permissions/types/index.ts
 * 
 * TypeScript interfaces for permissions module
 */

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

export interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
}
