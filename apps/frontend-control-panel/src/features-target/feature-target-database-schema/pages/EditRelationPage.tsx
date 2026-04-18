'use client';

/**
 * modules/database-schema/pages/EditRelationPage.tsx
 * 
 * Full page component for editing an existing relation
 * 
 * ✅ PURE DI: Uses useConfig() for all dependencies
 * ✅ NO HARDCODED: All strings from labels
 * ✅ SELF-CONTAINED: All logic in module, not in app/
 */

import { useParams } from 'next/navigation';
import { EditRelationForm } from '../components/EditRelationForm';

export const EditRelationPage = () => {
    const params = useParams();
    // Resolve IDs from URL params
    const rawTableId = Array.isArray(params.tableId) ? params.tableId[0] : params.tableId;
    const rawNodeId = Array.isArray(params.id) ? params.id[0] : params.id;
    const tableId = rawTableId || rawNodeId;
    const relationId = params.localKey as string;

    if (!tableId || !relationId) return null;

    return <EditRelationForm DatabaseTableId={tableId} relationId={relationId} />;
};

export default EditRelationPage;
