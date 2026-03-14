'use client';

// SchemaEditor - Pure UI component for editing data source schema
// Uses useSchemaEditor and useDataSources composables
// ✅ PURE DI: Uses useConfig() hook for all config, labels, icons

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@cp/ui';
import { useToast, useConfig } from '@/modules/_core';
import { ColumnBuilder } from './ColumnBuilder';
// RelationBuilder removed
import { useDataSources, useSchemaEditor } from '../composables';
import type { ColumnDefinition, DataSource } from '../types';

interface SchemaEditorProps {
    dataSourceId: number;
}

export const SchemaEditor = ({ dataSourceId }: SchemaEditorProps) => {
    const router = useRouter();
    const { addToast } = useToast();
    // ✅ Pure DI: Get all dependencies from context
    const { labels, icons: Icons } = useConfig();
    const L = labels.mod.dataSources;
    const C = labels.common;

    // Data from composables
    const { items: allSources, fetchOne } = useDataSources();
    const { addColumn, dropColumn, loading: schemaLoading } = useSchemaEditor(dataSourceId);

    // Local state for UI
    const [source, setSource] = useState<DataSource | null>(null);
    const [columns, setColumns] = useState<ColumnDefinition[]>([]);
    const [originalColumns, setOriginalColumns] = useState<ColumnDefinition[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Compute available sources for relation picker
    const availableSources = useMemo(() => {
        return allSources.map((s) => ({
            label: s.name,
            value: s.tableName,
        }));
    }, [allSources]);

    // Fetch source details
    useEffect(() => {
        const loadSource = async () => {
            setLoading(true);
            const data = await fetchOne(dataSourceId);
            if (data) {
                setSource(data);
                const schema = data.schemaJson ? JSON.parse(data.schemaJson) : { columns: [] };
                setColumns(schema.columns);
                setOriginalColumns(JSON.parse(JSON.stringify(schema.columns)));
            }
            setLoading(false);
        };

        if (dataSourceId) {
            loadSource();
        }
    }, [dataSourceId, fetchOne]);

    // Handle save - detect changes and apply them
    const handleSave = async () => {
        setSaving(true);

        const originalMap = new Map(originalColumns.map(c => [c.name, c]));
        const newMap = new Map(columns.map(c => [c.name, c]));

        const toAdd: ColumnDefinition[] = [];
        const toDrop: string[] = [];

        // Identify Added
        for (const col of columns) {
            if (!originalMap.has(col.name)) {
                toAdd.push(col);
            }
        }

        // Identify Dropped
        for (const orgCol of originalColumns) {
            if (!newMap.has(orgCol.name)) {
                toDrop.push(orgCol.name);
            }
        }

        if (toAdd.length === 0 && toDrop.length === 0) {
            addToast(C.validation.noChanges, 'info');
            setSaving(false);
            return;
        }

        let hasError = false;

        // Execute changes using composable
        for (const colName of toDrop) {
            const success = await dropColumn(colName);
            if (!success) hasError = true;
        }

        for (const col of toAdd) {
            const success = await addColumn(col);
            if (!success) hasError = true;
        }

        if (!hasError) {
            // Update original columns to reflect current state
            setOriginalColumns(JSON.parse(JSON.stringify(columns)));
        }

        setSaving(false);
    };



    // Loading state
    if (loading) {
        return (
            <div className="p-8 text-center text-slate-400">
                {C.status.loading}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-page-enter">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{L.buttons.editSchema}</h2>
                    <p className="text-slate-500">{C.actions.edit} {source?.name}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => router.back()}>{C.actions.cancel}</Button>
                    <Button
                        onClick={handleSave}
                        isLoading={saving || schemaLoading}
                        disabled={saving || schemaLoading}
                    >
                        {C.actions.save}
                    </Button>
                </div>
            </div>

            {/* Columns Section */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                <ColumnBuilder
                    columns={columns}
                    onChange={setColumns}
                    availableSources={availableSources}
                />
            </div>

            {/* Relations Section Removed */}

            {/* Warning Banner */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex gap-3 text-amber-800 text-sm">
                <Icons.warning className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-bold">{C.actions.warning}: {L.buttons.editSchema}</p>
                    <p className="opacity-90 mt-1">
                        {L.messages.confirm.dropColumn}
                    </p>
                </div>
            </div>
        </div>
    );
};
