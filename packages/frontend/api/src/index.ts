/**
 * @repo/frontend-api
 * 
 * Frontend API utilities for React applications
 * 
 * Features:
 * - Automatic snake_case ↔ camelCase transformation
 * - useFetch hook for data fetching
 * - createCrudHook factory for complete CRUD operations
 * - createEndpoints factory for endpoint configuration
 */

// Client
export { apiFetch, apiClient, type FetchOptions } from './client';

// Endpoint factories
export { createEndpoints, createEndpointsAdvanced } from './endpoints';

// React hooks
export { useFetch, createCrudHook } from './hooks';
export type {
    UseFetchOptions,
    UseFetchReturn,
    UseCrudOptions,
    UseCrudReturn,
} from './hooks';
