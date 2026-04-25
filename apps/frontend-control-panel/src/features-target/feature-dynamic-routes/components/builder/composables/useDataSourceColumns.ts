import { useState, useEffect, useCallback } from 'react';
import { useConfig, useToast } from '@/modules/_core';
import { env } from '@/lib/env';

interface Column {
    name: string;
    type: string;
}

export const useDataSourceColumns = (targetId: string, dataSourceId?: string) => {
    const { api } = useConfig();
    const { addToast } = useToast();
    const [columns, setColumns] = useState<Column[]>([]);
    const [relations, setRelations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchSchema = useCallback(async (dsId: string) => {
        setLoading(true);
        try {
            // Fetch Columns
            const colRes = await fetch(api.databaseSchema.pageDataViewer.columns(dsId), { headers: { 'x-target-id': targetId } });
            const colData = await colRes.json();
            
            // Fetch Relations
            const relRes = await fetch(api.databaseSchema.pageRelationEdit.relations(dsId), { headers: { 'x-target-id': targetId } });
            const relData = await relRes.json();

            if (colData.status === 'success') {
                setColumns(colData.data);
            } else {
                setColumns([]);
            }

            if (relData.status === 'success') {
                setRelations(relData.data);
            } else {
                setRelations([]);
            }
        } catch {
            setColumns([]);
            setRelations([]);
            addToast('Failed to load schema information', 'error');
        } finally {
            setLoading(false);
        }
    }, [api.databaseSchema, targetId, addToast]);

    useEffect(() => {
        if (!dataSourceId) {
            setColumns([]);
            setRelations([]);
            return;
        }

        fetchSchema(dataSourceId);
    }, [dataSourceId, fetchSchema]);

    return { columns, relations, loading };
};
