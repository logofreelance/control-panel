'use client';

/**
 * modules/data-sources/pages/DataPage.tsx
 * 
 * Full page component for viewing data source data
 * 
 * ✅ PURE DI: Uses useConfig() for all dependencies
 * ✅ NO HARDCODED: All strings from labels
 * ✅ SELF-CONTAINED: All logic in module, not in app/
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@cp/ui';
import { useConfig } from '@/modules/_core';
import { DataViewer } from '../components/DataViewer';
import type { DataSource } from '../types';

export function DataPage() {
    const params = useParams();
    const router = useRouter();

    // ✅ Pure DI: Get all dependencies from context
    const { api, labels, icons: Icons, API_STATUS } = useConfig();
    const L = labels.mod.dataSources;

    // State
    const [source, setSource] = useState<DataSource | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data source details
    useEffect(() => {
        if (!params.id) return;

        const fetchSource = async () => {
            try {
                // ✅ Use API from context
                const res = await fetch(`${api.dataSources.detail(Number(params.id))}`);
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
                <Icons.loading className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                <p className="mt-4 text-slate-500">{L.labels.loading}</p>
            </div>
        );
    }

    // Error state
    if (error || !source) {
        return (
            <div className="p-12 text-center">
                <Icons.warning className="w-12 h-12 mx-auto text-red-400" />
                <p className="mt-4 text-red-500">{error || L.messages.error.notFound}</p>
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
                    {L.buttons.backToSources}
                </Button>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2 sm:gap-3 flex-wrap">
                    <Icons.database className="w-8 h-8 text-slate-600" />
                    <span className="break-all">{source.name}</span>
                    <span className="text-slate-400 font-normal text-base sm:text-lg">/ {L.labels.data}</span>
                </h1>
                <p className="text-slate-500 text-sm sm:text-base mt-1">
                    {L.labels.manageRowsFor} {source.tableName}
                </p>
            </div>

            <DataViewer dataSource={source} />
        </div>
    );
}

export default DataPage;
