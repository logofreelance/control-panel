/**
 * @modular/contracts - DTO Types
 */

export interface UserListOptions {
    page?: number | string;
    limit?: number | string;
    search?: string;
    role?: string;
    status?: string;
    sort?: 'asc' | 'desc';
}

export interface CreateUserDTO {
    username: string;
    email: string;
    password?: string;
    role?: string;
}

export interface UpdateUserDTO {
    username?: string;
    email?: string;
    password?: string;
    role?: string;
    isActive?: boolean;
}

export interface CreateApiKeyDTO {
    name: string;
    roles?: string;
    permissions?: string;
}

export interface DataRowInput {
    [key: string]: unknown;
}

