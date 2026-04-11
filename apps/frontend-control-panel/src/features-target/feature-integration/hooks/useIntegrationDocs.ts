import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { INTEGRATION_API } from '../api';
import type { IntegrationDocs } from '../types/integration.types';

export function useIntegrationDocs() {
    const params = useParams();
    const targetId = (params?.id as string) || '';
    const [docs, setDocs] = useState<IntegrationDocs | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDocs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (!targetId) throw new Error("Target ID not found");
            const res = await apiClient.get<{ status: string; data: IntegrationDocs; message?: string }>(
                INTEGRATION_API.docs, 
                { headers: { 'x-target-id': targetId } }
            );
            if (res.status === 'success' && res.data) {
                setDocs(res.data);
            } else {
                throw new Error(res.message || 'Failed to fetch docs');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while fetching docs.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        docs,
        isLoading,
        error,
        fetchDocs,
    };
}
