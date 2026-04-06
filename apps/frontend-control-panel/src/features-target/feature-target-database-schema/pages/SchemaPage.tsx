'use client';

/**
 * SchemaPage - Flat Luxury UI Refactor
 * Page wrapper for SchemaEditor module
 */

import { useParams } from 'next/navigation';
import { SchemaEditor } from '../components/SchemaEditor';

export function SchemaPage() {
    const params = useParams();
    const tableId = parseInt((params.tableId as string) || (params.id as string));

    if (!tableId) return null;

    return (
        <SchemaEditor DatabaseTableId={tableId} />
    );
}

export default SchemaPage;
