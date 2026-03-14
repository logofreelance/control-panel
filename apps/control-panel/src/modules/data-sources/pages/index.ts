/**
 * modules/data-sources/pages/index.ts
 * 
 * Page components barrel export
 * 
 * These are full-page components that should be exported 
 * from app/ route files for Next.js routing.
 * 
 * Usage in app/: 
 * export { DataPage as default } from '@/modules/data-sources/pages';
 */

// List page
export { DataSourcesListPage } from './DataSourcesListPage';

// Data viewing page
export { DataPage } from './DataPage';

// Schema page
export { SchemaPage } from './SchemaPage';

// Source pages
export { CreateSourcePage } from './CreateSourcePage';

// Resource pages
export { CreateResourcePage } from './CreateResourcePage';
export { EditResourcePage } from './EditResourcePage';
