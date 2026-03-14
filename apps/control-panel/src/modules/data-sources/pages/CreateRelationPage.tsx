'use client';

import { useParams } from 'next/navigation';
import { CreateRelationForm } from '../components/CreateRelationForm';

export const CreateRelationPage = () => {
    const params = useParams();
    const id = Number(params.id);

    if (!id || isNaN(id)) return null;

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <CreateRelationForm dataSourceId={id} />
        </div>
    );
};
