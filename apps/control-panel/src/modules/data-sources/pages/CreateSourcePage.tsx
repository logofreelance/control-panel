'use client';

/**
 * modules/data-sources/pages/CreateSourcePage.tsx
 * 
 * Full page component for creating a new data source
 * 
 * ✅ PURE DI: Uses useConfig() for all dependencies
 * ✅ NO HARDCODED: All strings from labels
 * ✅ SELF-CONTAINED: All logic in module, not in app/
 */

import { useRouter } from 'next/navigation';
import { Button } from '@cp/ui';
import { useConfig } from '@/modules/_core';
import { CreateSourceForm } from '../components/CreateSourceForm';

export function CreateSourcePage() {
    const router = useRouter();

    // ✅ Pure DI: Get all dependencies from context
    const { labels, icons: Icons } = useConfig();
    const L = labels.mod.dataSources;

    return (
        <div className="max-w-5xl mx-auto py-8">
            <div className="mb-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4 pl-0 hover:bg-transparent hover:text-slate-900 group"
                >
                    <Icons.arrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    {L.buttons.backToSources}
                </Button>
                <h1 className="text-3xl font-bold text-slate-900">{L.titles.createSource}</h1>
                <p className="text-slate-500 mt-2">
                    {L.forms.schemaDefinitionSubtitle}
                </p>
            </div>

            <CreateSourceForm />
        </div>
    );
}

export default CreateSourcePage;
