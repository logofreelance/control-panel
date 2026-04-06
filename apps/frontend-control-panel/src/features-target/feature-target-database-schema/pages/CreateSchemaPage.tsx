'use client';

/**
 * modules/database-schema/pages/CreateSourcePage.tsx
 * 
 * Full page component for creating a new data source
 * 
 * ✅ PURE DI: Uses useConfig() for all dependencies
 * ✅ NO HARDCODED: All strings from labels
 * ✅ SELF-CONTAINED: All logic in module, not in app/
 */

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { useConfig } from '@/modules/_core';
import { CreateSchemaForm } from '../components/CreateSchemaForm';

export function CreateSchemaPage() {
    const router = useRouter();

    // ✅ Pure DI: Get all dependencies from context
    const { labels, icons: Icons } = useConfig();
    const L = labels.mod.databaseSchema;

    return (
        <div className="max-w-5xl mx-auto py-8">
            <div className="mb-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4 pl-0 hover:bg-transparent hover:text-foreground group"
                >
                    <Icons.arrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    {L.labels.backToDataSources}
                </Button>
                <TextHeading size="h2" as="h2">{L.titles.createSchema}</TextHeading>
                <p className="text-sm text-muted-foreground mt-2">
                    {L.forms.schemaDefinitionSubtitle}
                </p>
            </div>

            <CreateSchemaForm />
        </div>
    );
}

export default CreateSchemaPage;
