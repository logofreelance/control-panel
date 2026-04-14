'use client';

/**
 * modules/database-schema/pages/CreateSourcePage.tsx
 * 
 * Full page component for creating a new data source
 */

import { TargetLayout } from '@/components/layout/TargetLayout';
import { CreateSchemaForm } from '../components/CreateSchemaForm';

export function CreateSchemaPage() {
    return (
        <TargetLayout>
             <div className="flex flex-col gap-10 animate-page-enter max-w-5xl mx-auto pb-32">
                <CreateSchemaForm />
            </div>
        </TargetLayout>
    );
}

export default CreateSchemaPage;
