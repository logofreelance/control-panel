import { useState, useEffect, useCallback } from 'react';
import { useConfig } from '@/modules/_core';

interface Column {
    name: string;
    type: string;
}

export const useDataSourceColumns = (targetId: string, dataSourceId?: string) => {
    const { api } = useConfig();
    const [columns, setColumns] = useState<Column[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchColumns = useCallback(async (dsId: string) => {
        setLoading(true);
        try {
            const res = await fetch(api.databaseSchema.columns(dsId), { headers: { 'x-target-id': targetId } });
            const data = await res.json();
            if (data.status === 'success') {
                setColumns(data.data);
            } else {
                setColumns([]);
            }
        } catch {
            setColumns([]);
        } finally {
            setLoading(false);
        }
    }, [api.databaseSchema, targetId]);

    useEffect(() => {
        if (!dataSourceId) {
            setColumns([]);
            return;
        }

        fetchColumns(dataSourceId);
    }, [dataSourceId, fetchColumns]);

    return { columns, loading };
};
