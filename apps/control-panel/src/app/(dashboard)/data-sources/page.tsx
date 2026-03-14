/**
 * app/(dashboard)/data-sources/page.tsx
 * 
 * Route: /data-sources
 * 
 * ✅ THIN LAYER: Only routing - all logic in modules
 */

export const dynamic = 'force-dynamic';

export { DataSourcesListPage as default } from '@/modules/data-sources/pages';
