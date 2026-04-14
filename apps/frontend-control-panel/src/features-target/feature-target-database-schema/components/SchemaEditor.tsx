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
    const nodeId = params?.id as string;
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
        // This could be fetched if needed, for now using a dummy or keeping it empty
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
                setColumns(schema.columns || []);
                setOriginalColumns(JSON.parse(JSON.stringify(schema.columns || [])));
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
            addToast(C.validation.noChanges || 'No changes to save', 'info');
            setSaving(false);
            return;
        }

        let hasError = false;
        try {
            for (const colName of toDrop) { 
                if (!(await dropColumn(colName))) hasError = true; 
            }
            for (const col of toAdd) { 
                if (!(await addColumn(col))) hasError = true; 
            }
        } catch (e) {
            hasError = true;
        }

        if (!hasError) {
            setOriginalColumns(JSON.parse(JSON.stringify(columns)));
            addToast(L.messages.success.schemaUpdated, 'success');
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <TargetLayout>
                <div className="flex flex-col items-center justify-center py-40 gap-6 opacity-40 animate-pulse">
                    <Icons.loading className="size-10 animate-spin" />
                    <p className="text-xs font-black uppercase tracking-widest">{C.status.loading.toLowerCase()}</p>
                </div>
            </TargetLayout>
        );
    }

    return (
        <TargetLayout>
            <div className="flex flex-col gap-10 animate-page-enter max-w-5xl mx-auto pb-48">
                {/* Header Section */}
                <header className="flex flex-col gap-6 px-1">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="w-fit h-9 px-0 hover:bg-transparent -ml-1 text-muted-foreground/40 hover:text-foreground transition-colors group lowercase text-xs font-bold"
                    >
                        <Icons.arrowLeft className="size-3.5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        back to database list
                    </Button>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="size-14 rounded-[24px] bg-primary/10 flex items-center justify-center text-primary shadow-sm shadow-primary/5 transition-transform hover:rotate-6">
                                <Icons.database className="size-7" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <TextHeading as="h1" size="h3" className="font-bold lowercase leading-none">{source?.name}</TextHeading>
                                    <Badge variant="secondary" className="bg-muted/50 border-none text-[10px] uppercase font-black tracking-tighter h-5 px-2">SCHEMA</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground lowercase opacity-60">
                                    editing table structure for <code className="text-primary font-mono bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">{source?.tableName}</code>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => router.push(nodeId ? `/target/${nodeId}/database-schema` : '/database-schema')}
                                className="h-10 rounded-xl px-4 lowercase text-xs font-bold border-border/40 hover:bg-muted"
                            >
                                <Icons.close className="size-3.5 mr-2 opacity-40" /> cancel
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Warning Section */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    <div className="md:col-span-8 space-y-8">
                        {/* Column Builder Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <Icons.config className="size-4 text-muted-foreground/30" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">structure definition</span>
                            </div>
                            <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm rounded-[32px] overflow-hidden">
                                <CardContent className="p-6 md:p-10">
                                    <ColumnBuilder
                                        columns={columns}
                                        onChange={setColumns}
                                        availableSources={availableSources}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="md:col-span-4 space-y-6">
                         {/* Warning Card */}
                        <div className="p-6 rounded-[28px] bg-amber-500/5 ring-1 ring-amber-500/20 space-y-4 animate-in slide-in-from-right-4 duration-700">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                                    <Icons.warning className="size-5" />
                                </div>
                                <TextHeading size="h6" className="text-sm font-bold text-amber-700/80 lowercase">critical warning</TextHeading>
                            </div>
                            <div className="space-y-3">
                                <p className="text-xs text-amber-600/70 leading-relaxed lowercase">
                                    {L.messages.confirm.dropColumn.toLowerCase()}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-amber-600/40">
                                    <Icons.shield className="size-3" />
                                    {L.messages.confirm.irreversible_action?.toLowerCase() || 'irreversible action'}
                                </div>
                            </div>
                        </div>

                        {/* Tips Card */}
                        <div className="p-6 rounded-[28px] bg-primary/5 ring-1 ring-primary/10 space-y-4 transition-all hover:ring-primary/20 cursor-default">
                             <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Icons.lightbulb className="size-5" />
                                </div>
                                <TextHeading size="h6" className="text-sm font-bold text-primary/80 lowercase">naming tips</TextHeading>
                            </div>
                            <p className="text-[11px] text-primary/60 leading-relaxed lowercase">
                                use <code className="font-mono bg-primary/10 px-1 rounded text-primary">snake_case</code> for column names. standard timestamps (created_at, updated_at) are managed automatically by the middleware.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Floating Action Bar */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-50">
                    <div className="bg-background/40 backdrop-blur-3xl border border-white/10 p-3 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between gap-4 ring-1 ring-white/10">
                        <div className="flex items-center gap-4 pl-4">
                            <div className={cn(
                                "size-2 rounded-full animate-pulse",
                                columns.length !== originalColumns.length ? "bg-amber-500 shadow-lg shadow-amber-500/50" : "bg-muted-foreground/20"
                            )} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                                {columns.length !== originalColumns.length ? 'UNSAVED CHANGES DETECTED' : 'SCHEMA IS UP TO DATE'}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                             <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.back()}
                                className="h-12 rounded-[22px] px-8 lowercase font-bold text-muted-foreground hover:bg-muted/50"
                            >
                                {C.actions.cancel}
                            </Button>
                            <Button
                                onClick={handleSave}
                                isLoading={saving || schemaLoading}
                                disabled={columns.length === originalColumns.length}
                                className={cn(
                                    "h-12 min-w-[180px] rounded-[22px] lowercase font-bold transition-all",
                                    columns.length !== originalColumns.length ? "shadow-xl shadow-primary/20" : "opacity-50 grayscale cursor-not-allowed"
                                )}
                            >
                                <Icons.save className="size-4 mr-2" />
                                {C.actions.save} changes
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </TargetLayout>
    );
};
