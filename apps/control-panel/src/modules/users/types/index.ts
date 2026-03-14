// Users module types

export interface User {
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

// Flexible role type - roles are now dynamic from database
export type UserRole = string;

export interface RoleInfo {
    name: string;
    display_name: string;
    level: number;
    is_super: boolean;
}

export interface UserFormData {
    username: string;
    email: string;
    password: string;
    role: string;
}

export interface UsersFilterState {
    search: string;
    status: 'all' | 'active' | 'inactive';
    role: string; // Can be any role from database
    dateOrder: 'newest' | 'oldest';
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
}

export interface ApiResponse<T> {
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

