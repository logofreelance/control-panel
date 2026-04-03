/**
 * database-schema/index.ts
 * 
 * Database Schema module exports
 * 
 * ✅ PURE DI: All config from useConfig() hook
 * ✅ SELF-CONTAINED: Pages, components, composables, types, registry, api
 */

// ============================================
// PAGES (Full-page components for app/ routing)
// ============================================
export * from './pages';

// ============================================
// COMPONENTS (Reusable UI components)
// ============================================
export * from './components/DatabaseSchemaView';
export * from './components/ColumnBuilder';
export * from './components/CreateSchemaForm';
export * from './components/ResourceForm';
export * from './components/DataViewer';
export * from './components/ImportDataModal';
export * from './components/SchemaEditor';
export * from './components/RelationBuilder';
export * from './components/DatabaseSchemaTrashView';

// ============================================
// TYPES
// ============================================
export * from './types';

// ============================================
// REGISTRY (Module-specific options/lists)
// ============================================
export * from './registry';

// ============================================
// API (Endpoints - used by ConfigProvider)
// ============================================
export * from './api';

// ============================================
// COMPOSABLES (Business logic hooks)
// ============================================
export * from './composables';
