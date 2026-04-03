/**
 * modules/database-schema/pages/index.ts
 * 
 * Page components barrel export
 * 
 * These are full-page components that should be exported 
 * from app/ route files for Next.js routing.
 * 
 * Usage in app/: 
 * export { DataPage as default } from '@/features-target/feature-target-database-schema/pages';
 */

// List page
export { DatabaseSchemaListPage } from './DatabaseSchemaListPage';

// Data viewing page
export { DataPage } from './DataPage';

// Schema page
export { SchemaPage } from './SchemaPage';

// Schema creation page
export { CreateSchemaPage } from './CreateSchemaPage';

// Resource pages
export { CreateResourcePage } from './CreateResourcePage';
export { EditResourcePage } from './EditResourcePage';

// Relation pages
export { CreateRelationPage } from './CreateRelationPage';
export { EditRelationPage } from './EditRelationPage';
