'use client';

// SchemaEditor - Pure UI component for editing data source schema
// Uses useSchemaEditor and useDatabaseSchema composables
// ✅ PURE DI: Uses useConfig() hook for all config, labels, icons

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Heading, Text, Stack, Card } from '@/components/ui';
import { useToast, useConfig } from '@/modules/_core';
import { ColumnBuilder } from './ColumnBuilder';
// RelationBuilder removed
import { useDatabaseSchema, useSchemaEditor } from '../composables';
import type { ColumnDefinition, DatabaseTable } from '../types';

interface SchemaEditorProps {
    DatabaseTableId: number;
}

export const SchemaEditor = ({ DatabaseTableId }: SchemaEditorProps) => {
    const router = useRouter();
    const { addToast } = useToast();
    // ✅ Pure DI: Get all dependencies from context
    const { labels, icons: Icons } = useConfig();
    const L = labels.mod.databaseSchema;
    const C = labels.common;

    // Data from composables
    const { items: allSources, fetchOne } = useDatabaseSchema();
    const { addColumn, dropColumn, loading: schemaLoading } = useSchemaEditor(DatabaseTableId);

    // Local state for UI
    const [source, setSource] = useState<DatabaseTable | null>(null);
    const [columns, setColumns] = useState<ColumnDefinition[]>([]);
    const [originalColumns, setOriginalColumns] = useState<ColumnDefinition[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Compute available sources for relation picker
    const availableSources = useMemo(() => {
        return allSources.map((s: any) => ({
            label: s.name,
            value: s.tableName,
        }));
    }, [allSources]);

    // Fetch source details
    useEffect(() => {
        const loadSource = async () => {
            setLoading(true);
            const data = await fetchOne(DatabaseTableId);
            if (data) {
                setSource(data);
                const schema = data.schemaJson ? JSON.parse(data.schemaJson) : { columns: [] };
                setColumns(schema.columns);
                setOriginalColumns(JSON.parse(JSON.stringify(schema.columns)));
            }
            setLoading(false);
        };

        if (DatabaseTableId) {
            loadSource();
        }
    }, [DatabaseTableId, fetchOne]);

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
            <div className="p-8 text-center text-muted-foreground">
                {C.status.loading}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-page-enter">
            {/* Header */}
            <Stack direction="row" justify="between" align="center">
                <div>
                    <Heading level={2}>{L.buttons.editSchema}</Heading>
                    <Text variant="muted">{C.actions.edit} {source?.name}</Text>
                </div>
                <Stack direction="row" gap={2}>
                    <Button variant="ghost" onClick={() => router.back()}>{C.actions.cancel}</Button>
                    <Button
                        onClick={handleSave}
                        isLoading={saving || schemaLoading}
                        disabled={saving || schemaLoading}
                    >
                        {C.actions.save}
                    </Button>
                </Stack>
            </Stack>

            {/* Columns Section */}
            <Card  className="p-8">
                <ColumnBuilder
                    columns={columns}
                    onChange={setColumns}
                    availableSources={availableSources}
                />
            </Card>

            {/* Relations Section Removed */}

            {/* Warning Banner */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-amber-800 text-sm">
                <Stack direction="row" gap={3}>
                    <Icons.warning className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <Heading level={5} className="text-amber-800">{C.actions.warning}: {L.buttons.editSchema}</Heading>
                        <Text className="text-amber-800 opacity-90 mt-1">
                            {L.messages.confirm.dropColumn}
                        </Text>
                    </div>
                </Stack>
            </div>
        </div>
    );
};
