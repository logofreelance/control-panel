'use client';

/**
 * modules/database-schema/pages/SchemaPage.tsx
 * 
 * Full page component for editing data source schema
 * 
 * ✅ PURE DI: Uses useConfig() for all dependencies
 * ✅ SELF-CONTAINED: All logic in module, not in app/
 */

import { useParams } from 'next/navigation';
import { SchemaEditor } from '../components/SchemaEditor';

export function SchemaPage() {
    const params = useParams();
    const tableId = parseInt((params.tableId as string) || (params.id as string));

    return (
        <div className="max-w-7xl mx-auto">
            <SchemaEditor DatabaseTableId={tableId} />
        </div>
    );
}

export default SchemaPage;
