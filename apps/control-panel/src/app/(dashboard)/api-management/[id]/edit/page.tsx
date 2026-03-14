'use client';

import { useParams } from 'next/navigation';
import { EndpointEditor } from '@/modules/api-management/components/EndpointEditor';

export default function EditEndpointPage() {
    const params = useParams();
    const id = parseInt(params.id as string);

    return <EndpointEditor endpointId={id} />;
}
