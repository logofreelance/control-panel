/**
 * @modular/contracts - Common Types
 */

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResult<T> {
    data: T[];
    meta: PaginationMeta;
}

export interface ServiceResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface MutationResult {
    message: string;
    id?: number | string;
}

export interface UserContext {
    id: number;
    username?: string;
    email?: string;
    role: string;
    level?: number;
    permissions?: string[];
    authenticated?: boolean;
    iat?: number;
    exp?: number;
}

