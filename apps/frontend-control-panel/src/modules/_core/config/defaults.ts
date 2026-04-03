/**
 * _core/config/defaults.ts
 * 
 * CENTRALIZED DEFAULTS - Single Source of Truth
 * All modules import from here
 */

// API Response Status
export const API_STATUS = {
    SUCCESS: 'success',
    ERROR: 'error',
    FAILED: 'failed',
} as const;

export type ApiStatus = typeof API_STATUS[keyof typeof API_STATUS];

// Toast Types
export const TOAST_TYPE = {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning',
} as const;

export type ToastType = typeof TOAST_TYPE[keyof typeof TOAST_TYPE];

export const DEFAULTS = {
    // Pagination
    page_size: 10,
    max_limit: 100,
    pagination_options: [10, 20, 50, 100] as const,

    // Sorting
    sort_order: 'DESC' as const,

    // UI
    debounce_ms: 300,
    toast_duration_ms: 3000,
};

export type SortOrder = 'ASC' | 'DESC';

