'use client';

/**
 * SchemaPage - Flat Luxury UI Refactor
 * Page wrapper for SchemaEditor module
 */

import { useParams } from 'next/navigation';
import { SchemaEditor } from '../components/SchemaEditor';

export function SchemaPage() {
    const params = useParams();
    // Resolve IDs from URL params
    const rawTableId = Array.isArray(params.tableId) ? params.tableId[0] : params.tableId;
    const rawNodeId = Array.isArray(params.id) ? params.id[0] : params.id;
    const tableId = rawTableId || rawNodeId;

    if (!tableId) return null;

    return (
        <SchemaEditor DatabaseTableId={tableId} />
    );
}

export default SchemaPage;
