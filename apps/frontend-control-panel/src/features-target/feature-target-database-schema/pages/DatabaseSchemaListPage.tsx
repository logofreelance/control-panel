'use client';

/**
 * modules/database-schema/pages/databaseSchemaListPage.tsx
 * 
 * Full page component for listing all data sources
 * 
'use client';

/**
 * modules/database-schema/pages/databaseSchemaListPage.tsx
 * 
 * Full page component for listing all data sources
 * 
 * ✅ PURE DI: Component uses useConfig() internally
 * ✅ SELF-CONTAINED: All logic in module, not in app/
 */

export const dynamic = 'force-dynamic';

import { DatabaseSchemaView } from '../components/DatabaseSchemaView';

export function DatabaseSchemaListPage() {
    return <DatabaseSchemaView />;
}

export default DatabaseSchemaListPage;
