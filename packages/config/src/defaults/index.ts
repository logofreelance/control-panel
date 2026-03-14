/**
 * @cp/config/defaults
 * 
 * Centralized defaults for the entire application
 * Single source of truth for all default values
 * 
 * 🤖 AI INSTRUCTIONS:
 * - Import DEFAULTS from '@cp/config' 
 * - Never hardcode pagination, limits, or timing values
 * - Add new module defaults as nested objects
 */

// ============================================
// API RESPONSE STATUS
// ============================================
export const API_STATUS = {
    SUCCESS: 'success',
    ERROR: 'error',
    FAILED: 'failed',
    // Scopes for error templates
    GLOBAL: 'global',
    ROUTE: 'route',
    CATEGORY: 'category',
} as const;

export type ApiStatus = typeof API_STATUS[keyof typeof API_STATUS];

// ============================================
// TOAST TYPES
// ============================================
export const TOAST_TYPE = {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning',
} as const;

export type ToastType = typeof TOAST_TYPE[keyof typeof TOAST_TYPE];

// ============================================
// CORE DEFAULTS
// ============================================
export const DEFAULTS = {
    // Pagination
    pageSize: 10,
    maxLimit: 100,
    paginationOptions: [10, 20, 50, 100] as const,

    // Sorting
    sortOrder: 'DESC' as const,

    // UI Timing
    debounceMs: 300,
    toastDurationMs: 3000,

    // Data Sources Module
    dataSources: {
        dataViewer: {
            limit: 10,
            maxLimit: 100,
        },
        resourceForm: {
            defaultLimit: 10,
            maxLimit: 100,
            orderBy: 'id',
            orderDirection: 'DESC' as const,
            isPublic: false,
            isActive: true,
        },
        columnBuilder: {
            defaultType: 'string',
            defaultLength: 255,
        },
        schema: {
            timestamps: true,
            softDelete: false,
        },
    },
} as const;

export type SortOrder = 'ASC' | 'DESC';
