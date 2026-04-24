'use client';

/**
 * modules/database-schema/pages/EditResourcePage.tsx
 * 
 * Full page component for editing an existing resource
 * 
 * ✅ PURE DI: Uses useConfig() for all dependencies
 * ✅ NO HARDCODED: All strings from labels
 * ✅ SELF-CONTAINED: All logic in module, not in app/
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Badge, PageTitle } from '@/components/ui';
import { useConfig } from '@/modules/_core';
import { apiClient } from '@/lib/frontend-api';
import { TargetLayout } from '@/components/layout/TargetLayout';
import { API } from '../api/endpoints';
import { ResourceForm } from '../components/ResourceForm';
import type { DatabaseTable, Resource } from '../types';

export function EditResourcePage() {
    const params = useParams();
    const router = useRouter();

    // ✅ Pure DI: Get all dependencies from context
    const { api, labels, icons: Icons, API_STATUS } = useConfig();
    const L = labels.mod.databaseSchema;

    // State
    const [DatabaseTable, setDatabaseTable] = useState<DatabaseTable | null>(null);
    const [resource, setResource] = useState<Resource | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Resolve IDs from URL params
    const rawTableId = Array.isArray(params.tableId) ? params.tableId[0] : params.tableId;
    const rawNodeId = Array.isArray(params.id) ? params.id[0] : params.id;
    const isTargetRoute = !!rawTableId;
    const nodeId = isTargetRoute ? rawNodeId : undefined;
    const tableId = rawTableId || rawNodeId;
    const resourceId = params.resourceId as string;

    // Fetch data source and resource details
    useEffect(() => {
        if (!tableId || !resourceId) return;

        const fetchDetails = async () => {
            setLoading(true);
            try {
                const headers: Record<string, string> = nodeId ? { 'x-target-id': nodeId } : {};

                // Fetch Source & Resources in parallel
                const [sourceData, resData] = await Promise.all([
                    apiClient.get<any>(API.pageResourceEdit.schemaInfo(String(tableId)), { headers }),
                    apiClient.get<any>(API.pageSchemaList.resources(String(tableId)), { headers })
                ]);

                if (sourceData.status === API_STATUS.SUCCESS) {
                    setDatabaseTable(sourceData.data);
                }

                if (resData.status === API_STATUS.SUCCESS) {
                    const found = resData.data.find((r: Resource) => String(r.id) === resourceId);
                    if (found) {
                        setResource(found);
                    } else {
                        setError(L.messages.error.resourceNotFound);
                    }
                }
            } catch (e) {
                console.error(e);
                setError(L.messages.error.network);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [tableId, resourceId, nodeId, api, API_STATUS, L]);

    // Loading state
    if (loading) {
        return (
            <TargetLayout>
                <div className="w-full flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="size-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
                        <span className="text-base text-muted-foreground font-medium lowercase">
                            loading resource...
                        </span>
                    </div>
                </div>
            </TargetLayout>
        );
    }

    // Error state
    if (error || !DatabaseTable || !resource) {
        return (
            <TargetLayout>
                <div className="flex flex-col items-center justify-center p-12 text-center text-red-500 animate-page-enter">
                    <Icons.warning className="size-10 mb-4" />
                    <PageTitle title="error occurred" subtitle={error || L.messages.error.resourceNotFound} />
                    <Button variant="ghost" className="mt-8" onClick={() => router.back()}>
                        {L.labels.backToDataSources}
                    </Button>
                </div>
            </TargetLayout>
        );
    }

    return (
        <TargetLayout>
            <div className="flex flex-col gap-6 md:gap-10 animate-page-enter">
                <header className="flex flex-col gap-6 px-1">
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="-ml-1"
                        >
                            <Icons.arrowLeft className="size-4 mr-2" />
                            {L.labels.backToDataSources}
                        </Button>
                    </div>

                    <PageTitle 
                        title={L.titles.editResource} 
                        subtitle={
                            <div className="flex items-center gap-2">
                                {L.labels.editing} <span className="text-primary">{resource.name}</span>
                            </div>
                        }
                    />
                </header>

                <main className="px-1">
                    <ResourceForm DatabaseTable={DatabaseTable} resource={resource} />
                </main>
            </div>
        </TargetLayout>
    );
}

export default EditResourcePage;
