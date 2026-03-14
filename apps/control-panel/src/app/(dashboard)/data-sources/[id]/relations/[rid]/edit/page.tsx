'use client';

import { useParams } from 'next/navigation';
import { EditRelationForm } from '@/modules/data-sources/components/EditRelationForm';

export default function EditRelationPage() {
    const params = useParams();
    const id = parseInt(params.id as string);
    const rid = params.rid as string;

    if (isNaN(id) || !rid) return null;

    return <EditRelationForm dataSourceId={id} relationName={rid} />;
}
