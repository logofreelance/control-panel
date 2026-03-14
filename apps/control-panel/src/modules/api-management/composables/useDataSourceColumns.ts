import { useState, useEffect, useCallback } from 'react';
import { useConfig } from '@/modules/_core';

interface Column {
    name: string;
    type: string;
}

export const useDataSourceColumns = (dataSourceId?: number) => {
    const { api } = useConfig();
    const [columns, setColumns] = useState<Column[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchColumns = useCallback(async (dsId: number) => {
        setLoading(true);
        try {
            const res = await fetch(api.dataSources.columns(dsId));
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
    }, [api.dataSources]);

    useEffect(() => {
        if (!dataSourceId) {
            setColumns([]);
            return;
        }

        fetchColumns(dataSourceId);
    }, [dataSourceId, fetchColumns]);

    return { columns, loading };
};
