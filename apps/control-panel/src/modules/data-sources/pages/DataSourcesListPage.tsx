'use client';

/**
 * modules/data-sources/pages/DataSourcesListPage.tsx
 * 
 * Full page component for listing all data sources
 * 
 * ✅ PURE DI: Component uses useConfig() internally
 * ✅ SELF-CONTAINED: All logic in module, not in app/
 */

export const dynamic = 'force-dynamic';

import { DataSourcesView } from '../components/DataSourcesView';

export function DataSourcesListPage() {
    return <DataSourcesView />;
}

export default DataSourcesListPage;
