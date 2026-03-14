export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    roleLevel?: number;
    roleIsSuper?: boolean;
    roleDisplayName?: string;
    permissions?: string[];
}

export interface Role {
    id: number;
    name: string;
    displayName: string;
    level: number;
    description: string | null;
    isSuper: boolean;
    permissions?: string; // JSON string
}

export interface Permission {
    id: number;
    name: string;
    description: string | null;
    group: string | null;
}

export interface UserListOptions {
    search?: string;
    role?: string;
    status?: 'active' | 'inactive' | 'all';
    sort?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface RolesListOptions {
    sort?: 'asc' | 'desc';
}

export interface UserUpdateData {
    username?: string;
    email?: string;
    passwordHash?: string;
    role?: string;
    isActive?: boolean;
}
