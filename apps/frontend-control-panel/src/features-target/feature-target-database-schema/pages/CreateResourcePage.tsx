'use client';

/**
 * modules/database-schema/pages/CreateResourcePage.tsx
 * 
 * Full page component for creating a new resource
 * 
 * ✅ PURE DI: Uses useConfig() for all dependencies
 * ✅ NO HARDCODED: All strings from labels
 * ✅ SELF-CONTAINED: All logic in module, not in app/
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Badge } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { useConfig } from '@/modules/_core';
import { ResourceForm } from '../components/ResourceForm';
import type { DatabaseTable } from '../types';

export function CreateResourcePage() {
    const params = useParams();
    const router = useRouter();

    // ✅ Pure DI: Get all dependencies from context
    const { api, labels, icons: Icons, API_STATUS } = useConfig();
    const L = labels.mod.databaseSchema;

    // State
    const [DatabaseTable, setDatabaseTable] = useState<DatabaseTable | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data source details
    useEffect(() => {
        if (!params.id) return;

        const fetchSource = async () => {
            try {
                const res = await fetch(api.databaseSchema.detail(Number(params.id)));
                const data = await res.json();

                if (data.status === API_STATUS.SUCCESS) {
                    setDatabaseTable(data.data);
                } else {
                    setError(data.message || L.messages.error.loadFailed);
                }
            } catch (e) {
                console.error(e);
                setError(L.messages.error.network);
            } finally {
                setLoading(false);
            }
        };

        fetchSource();
    }, [params.id, api, API_STATUS, L]);

    // Loading state
    if (loading) {
        return (
            <div className="p-12 text-center text-muted-foreground">
                <Icons.loading className="w-6 h-6 animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">{L.labels.loadingSourceDetails}</p>
            </div>
        );
    }

    // Error state
    if (error || !DatabaseTable) {
        return (
            <div className="p-12 text-center text-red-500">
                <Icons.warning className="w-8 h-8 mx-auto mb-2" />
                {error || L.messages.error.sourceNotFound}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4 pl-0 hover:bg-transparent hover:text-foreground group"
                >
                    <Icons.arrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    {L.labels.backToDataSources}
                </Button>
                <div className="flex flex-row items-center gap-3">
                    <TextHeading size="h2" as="h2">{L.titles.createResource}</TextHeading>
                    <Badge variant="default">
                        {L.labels.forSource} {DatabaseTable.name}
                    </Badge>
                </div>
            </div>

            <ResourceForm DatabaseTable={DatabaseTable} />
        </div>
    );
}

export default CreateResourcePage;
