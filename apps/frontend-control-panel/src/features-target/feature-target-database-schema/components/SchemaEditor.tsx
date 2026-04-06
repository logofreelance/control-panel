'use client';

/**
 * SchemaEditor - Flat Luxury UI Refactor
 * Pure UI component for editing data source schema integrated with TargetLayout
 */

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { cn } from '@/lib/utils';
import { useToast, useConfig } from '@/modules/_core';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { TargetLayout } from '@/components/layout/TargetLayout';
import { ColumnBuilder } from './ColumnBuilder';
import { useDatabaseSchema, useSchemaEditor } from '../composables';
import type { ColumnDefinition, DatabaseTable } from '../types';

const L = MODULE_LABELS.databaseSchema;

interface SchemaEditorProps {
    DatabaseTableId: number;
}

export const SchemaEditor = ({ DatabaseTableId }: SchemaEditorProps) => {
    const router = useRouter();
    const params = useParams();
    const nodeId = params.id as string;
    const { addToast } = useToast();
    const { labels, icons: Icons } = useConfig();
    const C = labels.common;

    // Data from composables
    const { fetchOne } = useDatabaseSchema();
    const { addColumn, dropColumn, loading: schemaLoading } = useSchemaEditor(DatabaseTableId);

    // Local state for UI
    const [source, setSource] = useState<DatabaseTable | null>(null);
    const [columns, setColumns] = useState<ColumnDefinition[]>([]);
    const [originalColumns, setOriginalColumns] = useState<ColumnDefinition[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Compute available sources for relation picker
    const availableSources = useMemo(() => {
        // This would normally come from the composable or props
        return []; 
    }, []);

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

        if (DatabaseTableId) loadSource();
    }, [DatabaseTableId, fetchOne]);

    const handleSave = async () => {
        setSaving(true);
        const originalMap = new Map(originalColumns.map(c => [c.name, c]));
        const newMap = new Map(columns.map(c => [c.name, c]));

        const toAdd: ColumnDefinition[] = [];
        const toDrop: string[] = [];

        for (const col of columns) if (!originalMap.has(col.name)) toAdd.push(col);
        for (const orgCol of originalColumns) if (!newMap.has(orgCol.name)) toDrop.push(orgCol.name);

        if (toAdd.length === 0 && toDrop.length === 0) {
            addToast(C.validation.noChanges, 'info');
            setSaving(false);
            return;
        }

        let hasError = false;
        for (const colName of toDrop) { if (!(await dropColumn(colName))) hasError = true; }
        for (const col of toAdd) { if (!(await addColumn(col))) hasError = true; }

        if (!hasError) setOriginalColumns(JSON.parse(JSON.stringify(columns)));
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-40 animate-pulse">
                <Icons.loading className="size-10 animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest">{C.status.loading.toLowerCase()}</p>
            </div>
        );
    }

    return (
        <TargetLayout>
            <div className="flex flex-col gap-10 animate-page-enter max-w-5xl mx-auto pb-32">
                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-end justify-between px-1 gap-6">
                    <div className="space-y-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="h-9 px-0 hover:bg-transparent -ml-1 text-muted-foreground/40 hover:text-foreground transition-colors group lowercase text-xs font-bold"
                        >
                            <Icons.arrowLeft className="size-3.5 mr-2 group-hover:-translate-x-1 transition-transform" />
                            back to database
                        </Button>
                        <div className="flex items-center gap-4">
                             <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shadow-primary/5">
                                <Icons.database className="size-6" />
                             </div>
                             <div className="space-y-0.5">
                                <div className="flex items-center gap-3">
                                    <TextHeading as="h1" size="h4" className="font-bold lowercase leading-tight">{source?.name}</TextHeading>
                                    <div className="h-6 w-px bg-border/20 mx-1 hidden sm:block" />
                                    <span className="text-lg font-black uppercase tracking-tighter text-muted-foreground/20 hidden sm:block">SCHEMA</span>
                                </div>
                                <p className="text-xs text-muted-foreground lowercase opacity-60">edit structure and columns for <strong>{source?.tableName}</strong></p>
                             </div>
                        </div>
                    </div>
                </header>

                <div className="space-y-12">
                     {/* Column Builder Section */}
                    <Card className="border-none shadow-sm bg-card/40">
                        <CardContent className="p-8">
                             <ColumnBuilder
                                columns={columns}
                                onChange={setColumns}
                                availableSources={availableSources}
                            />
                        </CardContent>
                    </Card>

                    {/* Warning Section */}
                    <div className="flex flex-col md:flex-row gap-6 p-8 rounded-3xl bg-amber-500/5 ring-1 ring-amber-500/20 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="size-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                            <Icons.warning className="size-7" />
                        </div>
                        <div className="space-y-2">
                             <TextHeading size="h6" className="text-sm font-bold text-amber-700/80 lowercase">{C.actions.warning}: {L.buttons.editSchema.toLowerCase()}</TextHeading>
                             <p className="text-xs text-amber-600/60 leading-relaxed lowercase">
                                {L.messages.confirm.dropColumn.toLowerCase()}. {L.messages.confirm.irreversible_action?.toLowerCase() || 'this action is irreversible'}.
                             </p>
                        </div>
                    </div>
                </div>

                {/* Floating Footer Action */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50">
                    <div className="bg-background/80 backdrop-blur-xl border border-border/40 p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.back()}
                            className="h-11 rounded-xl px-8 lowercase font-bold text-muted-foreground hover:bg-muted"
                        >
                            {C.actions.cancel}
                        </Button>
                        <Button
                            onClick={handleSave}
                            isLoading={saving || schemaLoading}
                            className="h-11 min-w-[200px] rounded-xl lowercase shadow-lg shadow-primary/20 font-bold"
                        >
                            {C.actions.save} changes
                        </Button>
                    </div>
                </div>
            </div>
        </TargetLayout>
    );
};
