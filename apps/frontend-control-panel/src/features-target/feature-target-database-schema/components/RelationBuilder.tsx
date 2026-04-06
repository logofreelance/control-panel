'use client';

/**
 * RelationBuilder - Flat Luxury UI Refactor
 * Component for managing data source relations with consistent design system
 */

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { cn } from '@/lib/utils';
import { ConfirmDialog, useConfig } from '@/modules/_core';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { useRelations } from '../composables';
import { RELATION_TYPES } from '../registry';

const L = MODULE_LABELS.databaseSchema;

interface RelationBuilderProps {
    DatabaseTableId: number;
    DatabaseTableName: string;
    onRelationsChange?: () => void;
}

export const RelationBuilder = ({ DatabaseTableId, DatabaseTableName, onRelationsChange }: RelationBuilderProps) => {
    const router = useRouter();
    const params = useParams();
    const nodeId = params.id as string;
    
    // ✅ Pure DI: Get all dependencies from context
    const { labels, icons: Icons } = useConfig();
    const C = labels.common;

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
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground bg-muted/10 rounded-3xl border border-dashed border-border/20">
                <Icons.loading className="size-8 animate-spin opacity-20" />
                <p className="text-xs font-medium lowercase italic">{L.messages.relations.loadingRelations.toLowerCase()}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shadow-primary/10 transition-transform hover:scale-110">
                        <Icons.link className="size-4" />
                    </div>
                    <div className="space-y-0.5">
                        <TextHeading size="h6" className="text-sm font-semibold lowercase leading-none">{L.messages.relations.title}</TextHeading>
                        <p className="text-[10px] text-muted-foreground lowercase opacity-60">linking tables and defining connections</p>
                    </div>
                    <Badge variant="secondary" className="h-5 px-1.5 rounded-lg bg-muted text-[10px] font-black uppercase tracking-tighter border-none">{relations.length}</Badge>
                </div>
            </header>

            {/* Relations List */}
            {relations.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-20 bg-muted/20 border border-dashed border-border/40 rounded-3xl group">
                    <div className="size-16 rounded-2xl bg-muted/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                        <Icons.linkOff className="size-8 text-muted-foreground/30" />
                    </div>
                    <TextHeading size="h6" className="mb-1 lowercase">{L.messages.relations.noRelations}</TextHeading>
                    <p className="text-xs text-muted-foreground lowercase opacity-60">{L.messages.relations.addToLink.toLowerCase()}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relations.map(rel => {
                        const typeColor = 
                            rel.type === 'belongs_to' ? 'bg-blue-500' :
                            rel.type === 'has_one' ? 'bg-emerald-500' :
                            rel.type === 'has_many' ? 'bg-amber-500' :
                            'bg-violet-500';

                        return (
                            <Card
                                key={rel.id}
                                className="group relative border-none shadow-sm bg-card hover:bg-muted/5 transition-all duration-300 overflow-hidden"
                            >
                                <CardContent className="p-5 flex flex-col gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "size-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-500 shadow-lg group-hover:scale-110 group-hover:rotate-6",
                                            typeColor,
                                            "text-white shadow-emerald-500/10" // Example shadow
                                        )}>
                                            {getTypeIcon(rel.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className="font-bold text-xs lowercase truncate max-w-[120px] text-muted-foreground/40">{DatabaseTableName}</span>
                                                <Icons.arrowRight className="size-3 text-muted-foreground/20" />
                                                <span className="font-bold text-sm lowercase text-foreground truncate">{rel.target?.name || C.status.unknown}</span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <Badge className="h-5 px-2 bg-muted text-[9px] font-black uppercase tracking-tighter text-muted-foreground/60 border-none">
                                                    {getTypeLabel(rel.type)}
                                                </Badge>
                                                <div className="flex items-center gap-1.5 h-5 px-2 bg-muted rounded-lg text-[9px] font-mono text-muted-foreground/60">
                                                    <Icons.key className="size-2.5 opacity-30" />
                                                    {rel.localKey}
                                                </div>
                                                {rel.alias && (
                                                    <div className="flex items-center gap-1.5 h-5 px-2 bg-primary/10 rounded-lg text-[9px] font-bold text-primary lowercase">
                                                        <Icons.code className="size-2.5 opacity-40" />
                                                        {rel.alias}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Reveal */}
                                    <div className="flex items-center gap-1 justify-end pt-4 border-t border-border/5">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted hover:text-primary transition-all"
                                            onClick={() => {
                                                if (rel.localKey) {
                                                    const path = nodeId 
                                                        ? `/target/${nodeId}/database-schema/${DatabaseTableId}/relations/${rel.localKey}/edit` 
                                                        : `/database-schema/${DatabaseTableId}/relations/${rel.localKey}/edit`;
                                                    router.push(path);
                                                }
                                            }}
                                        >
                                            <Icons.edit className="size-3.5 mr-2" /> edit relation
                                        </Button>
                                        <Button
                                            size="icon-sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteTarget(rel);
                                            }}
                                            className="h-8 w-8 rounded-xl hover:bg-rose-500/10 hover:text-rose-600 text-muted-foreground/30 transition-all"
                                        >
                                            <Icons.trash className="size-3.5" />
                                        </Button>
                                    </div>
                                </CardContent>
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
                message={`${C.messages.confirmDelete} "${deleteTarget?.target?.name}"`.toLowerCase()}
                confirmText={C.actions.delete.toLowerCase()}
                variant="danger"
            />
        </div>
    );
};

export default RelationBuilder;
