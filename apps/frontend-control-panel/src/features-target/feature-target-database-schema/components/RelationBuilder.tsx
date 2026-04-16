'use client';

/**
 * RelationBuilder - Flat Luxury UI Refactor
 * Component for managing data source relations with consistent design system
 */

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
    Button, 
    Badge, 
    Card, 
    CardHeader, 
    CardTitle, 
    CardDescription, 
    CardContent, 
    CardFooter,
    Spinner,
    Empty,
    EmptyHeader,
    EmptyTitle,
    EmptyDescription,
    EmptyMedia,
    Separator,
    TextHeading
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/modules/_core';
import { MODULE_LABELS } from '@/lib/config/client';
import { useRelations } from '../composables';
import { RELATION_TYPES } from '../registry';
import { FEATURE_ICONS as Icons } from '../constants';

const L = MODULE_LABELS.databaseSchema;

interface RelationBuilderProps {
    DatabaseTableId: string | number;
    DatabaseTableName: string;
    onRelationsChange?: () => void;
}

export const RelationBuilder = ({ DatabaseTableId, DatabaseTableName, onRelationsChange }: RelationBuilderProps) => {
    const router = useRouter();
    const params = useParams();
    
    const rawNodeId = Array.isArray(params.id) ? params.id[0] : params.id;
    const nodeId = rawNodeId;
    
    // All data operations from composable
    const {
        relations,
        loading,
        deleteRelation,
    } = useRelations(DatabaseTableId);

    // UI-only state
    const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

    // Handle delete relation
    const handleDeleteRelation = async () => {
        if (!deleteTarget) return;
        const relationId = deleteTarget.localKey || deleteTarget.alias || deleteTarget.target?.name;
        if (!relationId) return;

        const success = await deleteRelation(relationId);
        if (success) {
            setDeleteTarget(null);
            onRelationsChange?.();
        }
    };

    const getTypeLabel = (type: string) => RELATION_TYPES.find(t => t.value === type)?.label || type;
    const getTypeIcon = (type: string) => RELATION_TYPES.find(t => t.value === type)?.icon || '?';

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-6 animate-in fade-in duration-700">
                <Spinner size="lg" />
                <div className="space-y-1 text-center">
                    <p className="text-sm font-semibold tracking-tight">fetching connections</p>
                    <p className="text-xs text-muted-foreground opacity-60">preparing your database relations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm ring-1 ring-primary/20">
                        <Icons.link className="size-5" />
                    </div>
                    <div className="space-y-0.5">
                        <TextHeading size="h5" className="font-semibold tracking-tight">Database Relations</TextHeading>
                        <p className="text-sm text-muted-foreground opacity-70">Define and manage how tables connect with each other</p>
                    </div>
                    <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-bold">{relations.length}</Badge>
                </div>
            </header>

            <Separator className="bg-border/60" />

            {/* Relations List */}
            {relations.length === 0 ? (
                <Empty className="py-24 glass-card border-dashed">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Icons.linkOff className="size-6 opacity-40" />
                        </EmptyMedia>
                        <EmptyTitle>No relations defined</EmptyTitle>
                        <EmptyDescription>
                            Connect your tables to build advanced queries and data structures.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {relations.map(rel => {
                        return (
                            <Card
                                key={rel.id}
                                className="glass-card hover:shadow-md transition-all duration-300"
                            >
                                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                                    <div className="size-10 rounded-lg bg-muted flex items-center justify-center text-lg shadow-sm">
                                        {getTypeIcon(rel.type)}
                                    </div>
                                    <div className="flex-1 space-y-0.5">
                                        <CardTitle className="text-base font-semibold lowercase">
                                            {getTypeLabel(rel.type)}
                                        </CardTitle>
                                        <CardDescription className="text-xs uppercase tracking-tight">
                                            Relationship Type
                                        </CardDescription>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground/60 leading-none">Source Table</span>
                                            <span className="text-sm font-semibold">{DatabaseTableName}</span>
                                        </div>
                                        <Icons.arrowRight className="size-4 text-muted-foreground/30 mx-2" />
                                        <div className="flex flex-col gap-1 text-right">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground/60 leading-none">Target Table</span>
                                            <span className="text-sm font-semibold">{rel.target?.name || 'unknown'}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-secondary/50 border border-border/50">
                                            <Icons.key className="size-3 text-muted-foreground/50" />
                                            <span className="text-xs font-mono font-medium">{rel.localKey}</span>
                                        </div>
                                        {rel.alias && (
                                            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                                                <Icons.code className="size-3 text-primary/60" />
                                                <span className="text-xs font-semibold text-primary">{rel.alias}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="justify-end gap-2 bg-muted/10 border-t border-border/20 pt-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 font-semibold"
                                        onClick={() => {
                                            if (rel.localKey) {
                                                const key = rel.localKey;
                                                const path = nodeId 
                                                    ? `/target/${nodeId}/database-schema/${DatabaseTableId}/relations/${key}/edit` 
                                                    : `/database-schema/${DatabaseTableId}/relations/${key}/edit`;
                                                router.push(path);
                                            }
                                        }}
                                    >
                                        <Icons.edit className="size-3.5 mr-2" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteTarget(rel);
                                        }}
                                    >
                                        <Icons.trash className="size-3.5" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteRelation}
                title="delete relation?"
                message={`are you sure you want to delete this relation "${deleteTarget?.target?.name}"?`.toLowerCase()}
                confirmText="delete"
                variant="danger"
            />
        </div>
    );
};


export default RelationBuilder;
