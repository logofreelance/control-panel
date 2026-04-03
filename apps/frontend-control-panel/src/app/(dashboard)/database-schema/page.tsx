/**
 * app/(dashboard)/data-sources/page.tsx
 * 
 * Route: /data-sources
 * 
 * ✅ THIN LAYER: Only routing - all logic in modules
 */

export const dynamic = 'force-dynamic';

export { DatabaseSchemaListPage as default } from '@/features-target/feature-target-database-schema/pages';
