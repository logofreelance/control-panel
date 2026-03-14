/**
 * Monitor module - barrel export
 * 
 * Architecture: Zero-hardcode modular structure
 * - api/        → Centralized API endpoints
 * - components/ → UI components
 * - composables/→ Business logic hooks
 * - types/      → TypeScript interfaces
 */

export * from './api';
export * from './components/MonitorView';
export * from './composables';
export * from './types';
