'use client';

// RelationBuilder - Component for managing data source relations
// Pure UI component - all data operations via useRelations composable
// ✅ PURE DI: Uses useConfig() hook for all config, labels, icons

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Badge, Heading, Text, Stack, Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ConfirmDialog, useConfig } from '@/modules/_core';
import { useRelations, type Relation } from '../composables';
import { RELATION_TYPES } from '../registry';

interface RelationBuilderProps {
    DatabaseTableId: number;
    DatabaseTableName: string;
    onRelationsChange?: () => void;
}

export const RelationBuilder = ({ DatabaseTableId, DatabaseTableName, onRelationsChange }: RelationBuilderProps) => {
    // ✅ Pure DI: Get all dependencies from context
    const { labels, icons: Icons } = useConfig();
    const router = useRouter();
    const { id: targetId } = useParams();
    const L = labels.mod.databaseSchema;
    const C = labels.common;

    // All data operations from composable
    const {
        relations,
        loading,
        deleteRelation,
    } = useRelations(DatabaseTableId);

    // UI-only state
    const [deleteTarget, setDeleteTarget] = useState<Relation | null>(null);

    // Handle delete relation
    // Handle delete relation
    const handleDeleteRelation = async () => {
        if (!deleteTarget) return;
        // Use localKey (column name) as identifier, fallback to alias or name if needed
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
            <div className="p-6 text-center text-muted-foreground">
                <div className="animate-spin w-6 h-6 border-2 border-border border-t-foreground rounded-full mx-auto"></div>
                <Text variant="muted" className="mt-2">{L.messages.relations.loadingRelations}</Text>
            </div>
        );
    }

    // Prepare options for Select removed

    return (
        <div className="space-y-4">
            <Stack direction="row" justify="between" align="center">
                <Stack direction="row" align="center" gap={2}>
                    <Icons.link className="w-5 h-5 text-primary" />
                    <Heading level={5}>{L.messages.relations.title}</Heading>
                    <Badge variant="outline">{relations.length}</Badge>
                </Stack>
            </Stack>

            {/* Relations List */}
            {relations.length === 0 ? (
                <div className="text-center py-20 bg-muted rounded-4xl border-2 border-dashed border-border">
                    <Icons.linkOff className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <Text className="font-medium">{L.messages.relations.noRelations}</Text>
                    <Text variant="muted" className="mt-1">{L.messages.relations.addToLink}</Text>
                </div>
            ) : (
                <div className="space-y-3">
                    {relations.map(rel => {
                        return (
                            <Card
                                key={rel.id}
                                
                                className="p-6"
                            >
                                <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer" onClick={() => { /* Expand logic if needed */ }}>
                                    {/* Type Badge & Icon */}
                                    <Stack direction="row" align="center" gap={4} className="flex-1 min-w-0">
                                        <div className={cn(
                                            "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl shrink-0",
                                            rel.type === 'belongs_to' ? 'bg-blue-50 text-blue-600' : '',
                                            rel.type === 'has_one' ? 'bg-emerald-50 text-emerald-600' : '',
                                            rel.type === 'has_many' ? 'bg-amber-50 text-amber-600' : '',
                                            rel.type === 'many_to_many' ? 'bg-purple-50 text-purple-600' : ''
                                        )}>
                                            {getTypeIcon(rel.type)}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <Stack direction="row" wrap align="center" gap={2} className="text-sm sm:text-base mb-1">
                                                <span className="font-semibold text-foreground truncate max-w-[100px] sm:max-w-none">{DatabaseTableName}</span>
                                                <Icons.arrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                                                <span className="font-bold text-primary truncate">{rel.target?.name || C.status.unknown}</span>
                                            </Stack>

                                            <Stack direction="row" wrap align="center" gap={2} className="text-xs text-muted-foreground">
                                                <span className="hidden sm:inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded border border-border">
                                                    <Icons.info className="w-3 h-3 opacity-50" />
                                                    {getTypeLabel(rel.type)}
                                                </span>
                                                <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded border border-border font-mono" title="Foreign Key">
                                                    <Icons.key className="w-3 h-3 opacity-50" />
                                                    {rel.localKey}
                                                </span>
                                                {rel.alias && (
                                                    <span className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded border border-primary/20 text-primary font-mono font-medium">
                                                        <Icons.code className="w-3 h-3 opacity-50" />
                                                        {rel.alias}
                                                    </span>
                                                )}
                                            </Stack>
                                        </div>
                                    </Stack>

                                    {/* Actions */}
                                    {/* Actions */}
                                    <Stack direction="row" align="center" gap={1} className="justify-end w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-border">
                                        <button
                                            className="p-2 bg-card border border-border hover:bg-primary/10 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (rel.localKey) {
                                                    router.push(targetId ? `/target/${targetId}/database-schema/${DatabaseTableId}/relations/${rel.localKey}/edit` : `/database-schema/${DatabaseTableId}/relations/${rel.localKey}/edit`);
                                                }
                                            }}
                                        >
                                            <Icons.edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            className="p-2 bg-card border border-border hover:bg-red-50 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteTarget(rel);
                                            }}
                                        >
                                            <Icons.delete className="w-4 h-4" />
                                        </button>
                                    </Stack>
                                </div>
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
                title={L.messages.confirm.deleteRelation}
                message={`${C.messages.confirmDelete} "${deleteTarget?.target?.name}"`}
                confirmText={C.actions.delete}
                variant="destructive"
            />
        </div>
    );
};

export default RelationBuilder;
