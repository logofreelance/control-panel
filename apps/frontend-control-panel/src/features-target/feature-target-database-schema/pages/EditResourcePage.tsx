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
import { Button, Badge } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { useConfig } from '@/modules/_core';
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
            try {
                const headers: Record<string, string> = {};
                if (nodeId) {
                    headers['x-target-id'] = nodeId;
                }

                // Fetch Source
                const sourceRes = await fetch(api.databaseSchema.detail(tableId), { headers });
                const sourceData = await sourceRes.json();

                // Fetch Resources
                const resRes = await fetch(api.databaseSchema.resources(tableId), { headers });
                const resData = await resRes.json();

                if (sourceData.status === API_STATUS.SUCCESS) {
                    setDatabaseTable(sourceData.data);
                }

                if (resData.status === API_STATUS.SUCCESS) {
                    // Resource IDs are usually still numbers in the DB, but they might be strings in params
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
            <div className="p-12 text-center text-muted-foreground">
                <Icons.loading className="w-6 h-6 animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">{L.labels.loadingDetails}</p>
            </div>
        );
    }

    // Error state
    if (error || !DatabaseTable || !resource) {
        return (
            <div className="p-12 text-center text-red-500">
                <Icons.warning className="w-8 h-8 mx-auto mb-2" />
                {error || L.messages.error.resourceNotFound}
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
                    <TextHeading size="h2" as="h2">{L.titles.editResource}</TextHeading>
                    <Badge variant="default">
                        {resource.name}
                    </Badge>
                </div>
            </div>

            <ResourceForm DatabaseTable={DatabaseTable} resource={resource} />
        </div>
    );
}

export default EditResourcePage;
