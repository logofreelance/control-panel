'use client';

/**
 * modules/database-schema/pages/DataPage.tsx
 * 
 * Full page component for viewing data source data
 * 
 * ✅ PURE DI: Uses useConfig() for all dependencies
 * ✅ NO HARDCODED: All strings from labels
 * ✅ SELF-CONTAINED: All logic in module, not in app/
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Heading, Text, Stack } from '@/components/ui';
import { useConfig } from '@/modules/_core';
import { DataViewer } from '../components/DataViewer';
import type { DatabaseTable } from '../types';

export function DataPage() {
    const params = useParams();
    const router = useRouter();

    // ✅ Pure DI: Get all dependencies from context
    const { api, labels, icons: Icons, API_STATUS } = useConfig();
    const L = labels.mod.databaseSchema;

    // State
    const [source, setSource] = useState<DatabaseTable | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data source details
    useEffect(() => {
        const tableId = params.tableId || params.id;
        if (!tableId) return;

        const fetchSource = async () => {
            try {
                // ✅ Use API from context
                const res = await fetch(`${api.databaseSchema.detail(Number(tableId))}`);
                const data = await res.json();

                if (data.status === API_STATUS.SUCCESS) {
                    setSource(data.data);
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
            <div className="p-12 text-center">
                <Icons.loading className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                <Text variant="muted" className="mt-4">{L.labels.loading}</Text>
            </div>
        );
    }

    // Error state
    if (error || !source) {
        return (
            <div className="p-12 text-center">
                <Icons.warning className="w-12 h-12 mx-auto text-red-400" />
                <Text className="mt-4 text-red-500">{error || L.messages.error.notFound}</Text>
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="mt-4"
                >
                    {L.buttons.goBack}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-full overflow-hidden">
            <div>
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-2 pl-0 hover:pl-2 transition-all"
                >
                    <Icons.arrowLeft className="w-4 h-4 mr-2" />
                    {L.labels.backToDataSources}
                </Button>
                <Stack direction="row" align="center" gap={3} wrap>
                    <Icons.database className="w-8 h-8 text-foreground" />
                    <Heading level={2}>
                        <span className="break-all">{source.name}</span>
                        <span className="text-muted-foreground font-normal text-base sm:text-lg"> / {L.labels.data}</span>
                    </Heading>
                </Stack>
                <Text variant="muted" className="mt-1">
                    {L.labels.manageRowsFor} {source.tableName}
                </Text>
            </div>

            <DataViewer DatabaseTable={source} />
        </div>
    );
}

export default DataPage;
