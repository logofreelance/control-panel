'use client';

import { useParams } from 'next/navigation';
import { CreateRelationForm } from '../components/CreateRelationForm';

export const CreateRelationPage = () => {
    const params = useParams();
    // Resolve IDs from URL params
    const rawTableId = Array.isArray(params.tableId) ? params.tableId[0] : params.tableId;
    const rawNodeId = Array.isArray(params.id) ? params.id[0] : params.id;
    const tableId = rawTableId || rawNodeId;

    if (!tableId) return null;

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <CreateRelationForm DatabaseTableId={tableId} />
        </div>
    );
};
