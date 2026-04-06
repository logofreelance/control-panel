'use client';

/**
 * DataPage - Flat Luxury UI Refactor
 * Full page component for viewing data source data integrated with TargetLayout
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { useConfig } from '@/modules/_core';
import { TargetLayout } from '@/components/layout/TargetLayout';
import { DataViewer } from '../components/DataViewer';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import type { DatabaseTable } from '../types';

const L = MODULE_LABELS.databaseSchema;

export function DataPage() {
    const params = useParams();
    const router = useRouter();
    const nodeId = params.id as string;

    // ✅ Pure DI: Get all dependencies from context
    const { api, icons: Icons, API_STATUS } = useConfig();

    // State
    const [source, setSource] = useState<DatabaseTable | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data source details
    const fetchSource = async () => {
        const tableId = params.tableId || params.id;
        if (!tableId) return;

        try {
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

    useEffect(() => {
        fetchSource();
    }, [params.id, api, API_STATUS]);

    if (loading) {
        return (
            <TargetLayout>
                <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-40 animate-pulse">
                    <div className="size-16 rounded-3xl bg-muted/60 flex items-center justify-center">
                        <Icons.loading className="size-8 animate-spin" />
                    </div>
                    <p className="text-sm font-black uppercase tracking-widest">{L.labels.loading.toLowerCase()}</p>
                </div>
            </TargetLayout>
        );
    }

    if (error || !source) {
        return (
            <TargetLayout>
                <div className="flex flex-col items-center justify-center py-32 text-center max-w-md mx-auto space-y-8 animate-page-enter">
                    <div className="size-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-500/10">
                        <Icons.warning className="size-10" />
                    </div>
                    <div className="space-y-3">
                         <TextHeading size="h4" className="lowercase text-foreground/80">{error || L.messages.error.notFound}</TextHeading>
                         <p className="text-sm text-muted-foreground lowercase opacity-60">we couldn't find the requested data source. it may have been deleted or moved.</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="h-11 px-8 rounded-xl border-border/40 lowercase font-bold hover:bg-muted"
                    >
                        {L.buttons.goBack}
                    </Button>
                </div>
            </TargetLayout>
        );
    }

    return (
        <TargetLayout>
            <div className="flex flex-col gap-10 animate-page-enter">
                {/* Dynamic Page Header */}
                <header className="flex flex-col sm:flex-row sm:items-end justify-between px-1 gap-6">
                    <div className="space-y-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="h-9 px-0 hover:bg-transparent -ml-1 text-muted-foreground/40 hover:text-foreground transition-colors group lowercase text-xs font-bold"
                        >
                            <Icons.arrowLeft className="size-3.5 mr-2 group-hover:-translate-x-1 transition-transform" />
                            {L.labels.backToDataSources}
                        </Button>
                        <div className="flex items-center gap-4">
                             <div className="size-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-sm shadow-indigo-500/5">
                                <Icons.database className="size-6" />
                             </div>
                             <div className="space-y-0.5">
                                <div className="flex items-center gap-3">
                                    <TextHeading as="h1" size="h4" className="font-bold lowercase leading-tight">{source.name}</TextHeading>
                                    <div className="h-6 w-px bg-border/20 mx-1 hidden sm:block" />
                                    <span className="text-lg font-black uppercase tracking-tighter text-muted-foreground/20 hidden sm:block">DATA</span>
                                </div>
                                <p className="text-xs text-muted-foreground lowercase opacity-60">{L.labels.manageRowsFor} <strong>{source.tableName}</strong></p>
                             </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-muted/20 p-2 rounded-2xl ring-1 ring-border/5">
                        <Button
                            onClick={() => router.push(nodeId ? `/target/${nodeId}/database-schema/${source.id}/edit` : `/database-schema/${source.id}/edit`)}
                            variant="ghost"
                            size="sm"
                            className="h-9 px-6 rounded-xl lowercase font-bold text-muted-foreground hover:bg-muted"
                        >
                            <Icons.edit className="size-3.5 mr-2 opacity-40" /> edit schema
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted"
                            onClick={() => fetchSource()} // Trigger source re-fetch
                        >
                            <Icons.refresh className="size-3.5" />
                        </Button>
                    </div>
                </header>

                <main className="max-w-full overflow-hidden">
                    <DataViewer DatabaseTable={source} />
                </main>
            </div>
        </TargetLayout>
    );
}

export default DataPage;
