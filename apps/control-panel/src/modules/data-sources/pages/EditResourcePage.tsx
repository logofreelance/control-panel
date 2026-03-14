'use client';

/**
 * modules/data-sources/pages/EditResourcePage.tsx
 * 
 * Full page component for editing an existing resource
 * 
 * ✅ PURE DI: Uses useConfig() for all dependencies
 * ✅ NO HARDCODED: All strings from labels
 * ✅ SELF-CONTAINED: All logic in module, not in app/
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@cp/ui';
import { useConfig } from '@/modules/_core';
import { ResourceForm } from '../components/ResourceForm';
import type { DataSource, Resource } from '../types';

export function EditResourcePage() {
    const params = useParams();
    const router = useRouter();

    // ✅ Pure DI: Get all dependencies from context
    const { api, labels, icons: Icons, API_STATUS } = useConfig();
    const L = labels.mod.dataSources;

    // State
    const [dataSource, setDataSource] = useState<DataSource | null>(null);
    const [resource, setResource] = useState<Resource | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data source and resource details
    useEffect(() => {
        if (!params.id || !params.resourceId) return;

        const fetchDetails = async () => {
            try {
                // Fetch Source
                const sourceRes = await fetch(api.dataSources.detail(Number(params.id)));
                const sourceData = await sourceRes.json();

                // Fetch Resources
                const resRes = await fetch(api.dataSources.resources(Number(params.id)));
                const resData = await resRes.json();

                if (sourceData.status === API_STATUS.SUCCESS) {
                    setDataSource(sourceData.data);
                }

                if (resData.status === API_STATUS.SUCCESS) {
                    const found = resData.data.find((r: Resource) => r.id === Number(params.resourceId));
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
    }, [params.id, params.resourceId, api, API_STATUS, L]);

    // Loading state
    if (loading) {
        return (
            <div className="p-12 text-center text-slate-400">
                <Icons.loading className="w-6 h-6 animate-spin mx-auto" />
                <p className="mt-2">{L.labels.loadingDetails}</p>
            </div>
        );
    }

    // Error state
    if (error || !dataSource || !resource) {
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
                    className="mb-4 pl-0 hover:bg-transparent hover:text-slate-900 group"
                >
                    <Icons.arrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    {L.buttons.backToSources}
                </Button>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-slate-900">{L.titles.editResource}</h1>
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-sm font-medium">
                        {resource.name}
                    </span>
                </div>
            </div>

            <ResourceForm dataSource={dataSource} resource={resource} />
        </div>
    );
}

export default EditResourcePage;
