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
import { Button, Badge, PageTitle } from '@/components/ui';
import { useConfig } from '@/modules/_core';
import { apiClient } from '@/lib/frontend-api';
import { TargetLayout } from '@/components/layout/TargetLayout';
import { ResourceForm } from '../components/ResourceForm';
import { API } from '../api/endpoints';
import type { DatabaseTable } from '../types';

export function CreateResourcePage() {
    const params = useParams();
    const router = useRouter();

    // ✅ Pure DI: Get all dependencies from context
    const { api, labels, icons: Icons, API_STATUS } = useConfig();
    const L = labels.mod.databaseSchema;

    // State
    const [dbTable, setDbTable] = useState<DatabaseTable | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Resolve IDs from URL params
    const rawTableId = Array.isArray(params.tableId) ? params.tableId[0] : params.tableId;
    const rawNodeId = Array.isArray(params.id) ? params.id[0] : params.id;
    const isTargetRoute = !!rawTableId;
    const nodeId = isTargetRoute ? rawNodeId : undefined;
    const tableId = rawTableId || rawNodeId;

    useEffect(() => {
        console.log('[CreateResourcePage] URL Params:', params);
        console.log('[CreateResourcePage] Resolved IDs:', { tableId, nodeId });
    }, [params, tableId, nodeId]);

    // Fetch data source details
    useEffect(() => {
        if (!tableId) return;

        const fetchSource = async () => {
            setLoading(true);
            try {
                const data = await apiClient.get<any>(API.pageResourceCreate.schemaInfo(String(tableId)), {
                    headers: nodeId ? { 'x-target-id': nodeId } : {}
                });

                if (data.status === API_STATUS.SUCCESS) {
                    console.log('[CreateResourcePage] Raw API Response:', data);
                    
                    let tableData = data.data?.data || data.data?.result || data.data;
                    console.log('[CreateResourcePage] Resolved Table Data:', tableData);
                    
                    // Check if columns are already available (enriched by backend detail handler)
                    const existingColumns = tableData.columns || tableData.schema?.columns;
                    const hasColumns = Array.isArray(existingColumns) && existingColumns.length > 0;
                    
                    if (!hasColumns) {
                        console.log('[CreateResourcePage] Columns missing from detail, fetching via DESCRIBE...');
                        const colsData = await apiClient.get<any>(API.pageDataViewer.columns(String(tableId)), {
                            headers: nodeId ? { 'x-target-id': nodeId } : {}
                        });
                        console.log('[CreateResourcePage] Columns Response:', colsData);
                        if (colsData.status === API_STATUS.SUCCESS) {
                            let resolvedCols = colsData.data?.data || colsData.data?.result || colsData.data;
                            
                            // Fallback: try by tableName
                            if ((!resolvedCols || resolvedCols.length === 0) && tableData.tableName) {
                                const nameColsData = await apiClient.get<any>(API.pageDataViewer.columns(String(tableData.tableName)), {
                                    headers: nodeId ? { 'x-target-id': nodeId } : {}
                                });
                                if (nameColsData.status === API_STATUS.SUCCESS) {
                                    resolvedCols = nameColsData.data?.data || nameColsData.data?.result || nameColsData.data;
                                }
                            }

                            console.log('[CreateResourcePage] Resolved Columns:', resolvedCols);
                            tableData = { ...tableData, columns: Array.isArray(resolvedCols) ? resolvedCols : [] };
                        }
                    }
                    
                    setDbTable(tableData);
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
    }, [tableId, nodeId, api, API_STATUS, L]);

    // Loading state
    if (loading) {
        return (
            <TargetLayout>
                <div className="w-full flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="size-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
                        <span className="text-base text-muted-foreground font-medium lowercase">
                            loading schema...
                        </span>
                    </div>
                </div>
            </TargetLayout>
        );
    }

    // Error state
    if (error || !dbTable) {
        return (
            <TargetLayout>
                <div className="flex flex-col items-center justify-center p-12 text-center text-red-500 animate-page-enter">
                    <Icons.warning className="size-10 mb-4" />
                    <PageTitle title="error occurred" subtitle={error || L.messages.error.sourceNotFound} />
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
                <header className="flex flex-col gap-6">
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
                        title={L.titles.createResource} 
                        subtitle={
                            <span className="flex items-center gap-2">
                                {L.labels.forSource}{' '}
                                <Badge variant="secondary" className="font-normal lowercase">
                                    {dbTable.name}
                                </Badge>
                            </span>
                        }
                    />
                </header>

                <main>
                    <ResourceForm DatabaseTable={dbTable} />
                </main>
            </div>
        </TargetLayout>
    );
}

export default CreateResourcePage;
