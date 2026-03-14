'use client';

import { useParams } from 'next/navigation';
import { EndpointDetailView } from '@/modules/api-management/components/EndpointDetailView';

export default function EndpointDetailPage() {
    const params = useParams();
    const id = parseInt(params.id as string);

    return <EndpointDetailView endpointId={id} />;
}
