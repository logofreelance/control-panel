/**
 * @repo/shared-types
 * 
 * Common field types used across entities
 */

/**
 * Generic ID type (can be number or string UUID)
 */
export type ID = number | string;

/**
 * Standard timestamp fields
 */
export interface Timestamps {
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

/**
 * Soft delete fields
 */
export interface SoftDelete {
    deletedAt?: string | Date | null;
    isArchived?: boolean;
}

/**
 * Base entity with ID and timestamps
 */
export interface BaseEntity extends Timestamps {
    id: ID;
}

/**
 * Sortable query parameters
 */
export interface SortParams {
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

/**
 * Pagination query parameters
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
}

/**
 * Combined list query parameters
 */
export interface ListParams extends SortParams, PaginationParams {
    search?: string;
    filter?: Record<string, any>;
}

/**
 * Select option for dropdowns
 */
export interface SelectOption<T = string> {
    label: string;
    value: T;
    icon?: string;
    description?: string;
    disabled?: boolean;
}

