/**
 * database-schema/composables/index.ts
 * 
 * Barrel exports for all composables
 */

// Core database schema management
export { useDatabaseSchema, useSchemaActions } from './useDatabaseSchema';
export { useSchemaStats } from './useSchemaStats';

// Creation and validation
export { useCreateSchema, type CreateSchemaPayload } from './useCreateSchema';
export type { ValidationResult, Template } from './useCreateSchema';

// Resources CRUD
export { useResources } from './useResources';
export type { UseResourcesOptions, UseResourcesReturn } from './useResources';

// Relations CRUD
export { useRelations } from './useRelations';
export type { Relation, RelationTarget, AddRelationPayload } from './useRelations';

// Column Builder (schema)
export { useColumnBuilder } from './useColumnBuilder';
export type { UseColumnBuilderOptions } from './useColumnBuilder';

// Schema Editor (add/drop columns)
export { useSchemaEditor } from './useSchemaEditor';
export * from './useTrash';
export type { UseSchemaEditorReturn } from './useSchemaEditor';

// Resource Form
export { useResourceForm } from './useResourceForm';
export type {
    ResourceFormValues,
    FieldSelection,
    FilterConfig,
    // Note: JoinConfig is exported from types/index.ts
} from './useResourceForm';

// Data Viewer
export { useDataViewer } from './useDataViewer';
export type { UseDataViewerOptions } from './useDataViewer';

// Import Data
export { useImportData } from './useImportData';
export type { UseImportDataReturn } from './useImportData';

// Resource Submit
export { useResourceSubmit } from './useResourceSubmit';
export type { ResourcePayload } from './useResourceSubmit';



