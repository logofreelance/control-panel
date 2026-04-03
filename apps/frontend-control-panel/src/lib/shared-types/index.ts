/**
 * @repo/shared-types
 * 
 * Shared TypeScript types for frontend and backend
 */

// API response types
export type {
    ApiResponse,
    PaginatedResult,
    CrudEndpoints,
} from './api';

// Common field types
export type {
    ID,
    Timestamps,
    SoftDelete,
    BaseEntity,
    SortParams,
    PaginationParams,
    ListParams,
    SelectOption,
} from './common';

// Re-export types for convenience
export type { ApiResponse as ApiRes } from './api';

