'use client';

/**
 * CreateRelationForm - Flat Luxury UI Refactor
 * Form for creating table relations with consistent design system and TargetLayout integration
 */

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { cn } from '@/lib/utils';
import { useConfig } from '@/modules/_core';
import { TargetLayout } from '@/components/layout/TargetLayout';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { useRelations, type Relation, type AddRelationPayload } from '../composables';
import { RELATION_TYPES } from '../registry';

const L = MODULE_LABELS.databaseSchema;

interface CreateRelationFormProps {
    DatabaseTableId: number;
}

export const CreateRelationForm = ({ DatabaseTableId }: CreateRelationFormProps) => {
    const router = useRouter();
    const params = useParams();
    const nodeId = params.id as string;
    
    const { labels, icons: Icons } = useConfig();
    const C = labels.common;

    const {
        targets,
        loading,
        addRelation
    } = useRelations(DatabaseTableId);

    const [submitting, setSubmitting] = useState(false);
    const [newRelation, setNewRelation] = useState<AddRelationPayload>({
        targetId: -1, // Use -1 as unselected
        type: 'belongs_to',
        alias: '',
    });

    const handleSelectTarget = (id: number) => {
        setNewRelation(prev => {
            if (id === 0 && ['has_one', 'has_many'].includes(prev.type)) {
                return { ...prev, targetId: id, type: 'belongs_to' };
            }
            return { ...prev, targetId: id };
        });
    };

    const handleSubmit = async () => {
        if (newRelation.targetId === -1) return;
        setSubmitting(true);
        const success = await addRelation(newRelation);
        setSubmitting(false);

        if (success) {
            const path = nodeId ? `/target/${nodeId}/database-schema` : `/database-schema`;
            router.push(path);
            router.refresh();
        }
    };

    if (loading) {
        return (
             <TargetLayout>
                <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-40 animate-pulse">
                    <Icons.loading className="size-10 animate-spin" />
                    <p className="text-xs font-black uppercase tracking-widest">{L.messages.relations.loadingRelations.toLowerCase()}</p>
                </div>
            </TargetLayout>
        );
    }

    return (
        <TargetLayout>
            <div className="flex flex-col gap-10 animate-page-enter max-w-5xl mx-auto pb-32">
                {/* Page Header */}
                <header className="px-1 space-y-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="h-9 px-0 hover:bg-transparent -ml-1 text-muted-foreground/40 hover:text-foreground transition-colors group lowercase text-xs font-bold"
                    >
                        <Icons.arrowLeft className="size-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        back to database
                    </Button>
                    <div className="flex items-center gap-4">
                         <div className="size-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-sm shadow-indigo-500/5">
                            <Icons.link className="size-6" />
                         </div>
                         <div className="space-y-0.5">
                            <TextHeading as="h1" size="h4" className="font-bold lowercase leading-tight">{L.messages.relations.addRelation}</TextHeading>
                            <p className="text-xs text-muted-foreground lowercase opacity-60 font-medium">{L.messages.relations.createRelationship.toLowerCase()}</p>
                         </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Target Selection */}
                    <Card className="lg:col-span-12 border-none shadow-sm bg-card/40">
                        <CardContent className="p-8 space-y-10">
                            <div className="flex items-center gap-3 border-b border-border/5 pb-6 mb-2">
                                <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><Icons.database className="size-5" /></div>
                                <div className="space-y-0.5">
                                    <TextHeading size="h5" className="text-base font-semibold lowercase leading-none">{L.messages.relations.targetTable}</TextHeading>
                                    <p className="text-[11px] text-muted-foreground lowercase mt-1.5 opacity-60">select which table you want to establish a link with.</p>
                                </div>
                            </div>

                            {targets.length === 0 ? (
                                <div className="py-20 text-center bg-muted/20 rounded-3xl border border-dashed border-border/40">
                                    <Icons.lock className="size-10 text-muted-foreground/20 mx-auto mb-4" />
                                    <p className="text-sm font-medium lowercase italic text-muted-foreground/40">{L.messages.relations.noTargets || "No targets found."}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {targets.map(t => {
                                        const isSelected = newRelation.targetId === t.id;
                                        return (
                                            <button
                                                key={t.id}
                                                onClick={() => handleSelectTarget(t.id)}
                                                className={cn(
                                                    "group relative p-6 rounded-3xl transition-all duration-300 ring-1 text-left",
                                                    isSelected 
                                                        ? 'bg-primary/5 ring-primary/40 shadow-xl shadow-primary/5 scale-[1.02]' 
                                                        : 'bg-muted/10 ring-border/5 hover:ring-primary/20 hover:bg-muted/20'
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "size-10 rounded-xl flex items-center justify-center transition-all duration-500",
                                                        isSelected ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-background text-muted-foreground/30 group-hover:text-primary group-hover:bg-primary/5'
                                                    )}>
                                                        <Icons.table className="size-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <TextHeading size="h6" className={cn(
                                                            "text-sm font-bold truncate lowercase leading-none",
                                                            isSelected ? "text-primary" : "text-muted-foreground/60"
                                                        )}>{t.name}</TextHeading>
                                                        <p className="text-[10px] font-mono text-muted-foreground/30 mt-1.5">{t.tableName}</p>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="absolute top-4 right-4 bg-primary text-white size-5 rounded-full flex items-center justify-center animate-in zoom-in-75 duration-300">
                                                            <Icons.check className="size-3 stroke-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Configure Relation Type */}
                    <Card className="lg:col-span-12 border-none shadow-sm bg-card/40">
                         <CardContent className="p-8 space-y-10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/5 pb-6 mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><Icons.settings className="size-5" /></div>
                                    <div className="space-y-0.5">
                                        <TextHeading size="h5" className="text-base font-semibold lowercase leading-none">{L.messages.relations.relationType}</TextHeading>
                                        <p className="text-[11px] text-muted-foreground lowercase mt-1.5 opacity-60">define the nature of the relationship.</p>
                                    </div>
                                </div>

                                <div className="max-w-md w-full">
                                    <input
                                        type="text"
                                        value={newRelation.alias}
                                        onChange={(e) => setNewRelation(prev => ({ ...prev, alias: e.target.value }))}
                                        placeholder="optional: custom alias name (e.g. author_profile)"
                                        className="w-full h-10 px-5 rounded-xl bg-muted/20 border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/30 lowercase text-xs font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {RELATION_TYPES.map(type => {
                                    const isSystemTarget = newRelation.targetId === 0;
                                    const isDisabled = isSystemTarget && ['has_one', 'has_many'].includes(type.value);
                                    const isSelected = newRelation.type === type.value;

                                    return (
                                        <button
                                            key={type.value}
                                            disabled={isDisabled}
                                            onClick={() => !isDisabled && setNewRelation(prev => ({ ...prev, type: type.value as any }))}
                                            className={cn(
                                                "p-6 rounded-3xl transition-all duration-300 ring-1 text-left flex items-start gap-6 relative overflow-hidden group",
                                                isDisabled ? 'opacity-30 cursor-not-allowed bg-muted/5 ring-border/5' :
                                                isSelected 
                                                    ? 'bg-primary/5 ring-primary/40 shadow-xl shadow-primary/5' 
                                                    : 'bg-muted/10 ring-border/5 hover:ring-primary/10 hover:bg-muted/20'
                                            )}
                                        >
                                            <div className={cn(
                                                "size-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 shrink-0 shadow-lg",
                                                isDisabled ? 'bg-muted-foreground/10 text-muted-foreground/20' :
                                                isSelected ? 'bg-primary text-white shadow-primary/20 scale-110 rotate-6' : 'bg-background text-muted-foreground/20 group-hover:text-primary group-hover:bg-primary/5'
                                            )}>
                                                {type.icon}
                                            </div>
                                            <div className="space-y-1.5 flex-1 pr-4">
                                                <TextHeading size="h6" className={cn(
                                                    "text-sm font-bold lowercase leading-none",
                                                    isSelected ? "text-primary" : "text-muted-foreground/60"
                                                )}>{type.label}</TextHeading>
                                                <p className="text-[11px] text-muted-foreground/40 lowercase leading-relaxed">{type.desc.toLowerCase()}</p>
                                                
                                                {isDisabled && (
                                                    <div className="mt-3 flex items-center gap-1.5 text-[9px] font-black uppercase text-amber-600/60 tracking-wider">
                                                        <Icons.alertTriangle className="size-3" />
                                                        restricted for system tables
                                                    </div>
                                                )}
                                            </div>
                                            {isSelected && !isDisabled && (
                                                <div className="absolute top-6 right-6 text-primary flex items-center justify-center animate-in zoom-in-75 duration-300">
                                                    <Icons.check className="size-5 stroke-4" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Floating Footer Actions */}
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
                            onClick={handleSubmit}
                            isLoading={submitting}
                            disabled={newRelation.targetId === -1}
                            className="h-11 min-w-[200px] rounded-xl lowercase shadow-lg shadow-primary/20 font-bold"
                        >
                            {L.messages.relations.addRelation.toLowerCase()}
                        </Button>
                    </div>
                </div>
            </div>
        </TargetLayout>
    );
};
