'use client';

/**
 * EditRelationForm - Flat Luxury UI Refactor
 * Form for editing table relations with consistent design system and TargetLayout integration
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { cn } from '@/lib/utils';
import { useConfig } from '@/modules/_core';
import { TargetLayout } from '@/components/layout/TargetLayout';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { useRelations, type Relation } from '../composables';
import { RELATION_TYPES } from '../registry';

const L = MODULE_LABELS.databaseSchema;

interface EditRelationFormProps {
    DatabaseTableId: number;
    relationName: string; // This is the localKey / column name
}

export const EditRelationForm = ({ DatabaseTableId, relationName }: EditRelationFormProps) => {
    const router = useRouter();
    const params = useParams();
    const nodeId = params.id as string;
    
    const { labels, icons: Icons } = useConfig();
    const C = labels.common;

    const { relations, loading, updateRelation } = useRelations(DatabaseTableId);

    // Find the relation being edited
    const [relation, setRelation] = useState<Relation | null>(null);
    const [form, setForm] = useState({
        type: 'belongs_to' as Relation['type'],
        alias: '',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && relations.length > 0) {
            const found = relations.find(r => r.localKey === relationName);
            if (found) {
                setRelation(found);
                setForm({
                    type: found.type,
                    alias: found.alias,
                });
            }
        }
    }, [relations, loading, relationName]);

    const handleSubmit = async () => {
        setSubmitting(true);
        const success = await updateRelation(relationName, form);
        if (success) {
            router.back();
            router.refresh();
        }
        setSubmitting(false);
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

    if (!relation) {
        return (
            <TargetLayout>
                <div className="flex flex-col items-center justify-center py-32 text-center max-w-md mx-auto space-y-8 animate-page-enter">
                    <div className="size-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-500/10">
                        <Icons.warning className="size-10" />
                    </div>
                    <div className="space-y-3">
                         <TextHeading size="h4" className="lowercase text-foreground/80">{C.messages.notFound || "relation not found"}</TextHeading>
                         <p className="text-sm text-muted-foreground lowercase opacity-60">could not find relation for column: <code className="font-mono bg-muted px-1 rounded">{relationName}</code></p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="h-11 px-8 rounded-xl border-border/40 lowercase font-bold hover:bg-muted"
                    >
                        {C.actions.goBack}
                    </Button>
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
                            <Icons.edit className="size-6" />
                         </div>
                         <div className="space-y-0.5">
                            <TextHeading as="h1" size="h4" className="font-bold lowercase leading-tight">edit relation</TextHeading>
                            <p className="text-xs text-muted-foreground lowercase opacity-60 font-medium">update metadata for <strong>{relation.target?.name}</strong></p>
                         </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Read-only Props */}
                    <Card className="lg:col-span-4 border-none shadow-sm bg-card/40 opacity-70">
                        <CardContent className="p-8 space-y-8">
                            <div className="flex items-center gap-3 border-b border-border/5 pb-6 mb-2">
                                <div className="size-10 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground shrink-0"><Icons.lock className="size-5" /></div>
                                <div className="space-y-0.5">
                                    <TextHeading size="h5" className="text-base font-semibold lowercase leading-none">immutable properties</TextHeading>
                                    <p className="text-[10px] text-muted-foreground lowercase mt-1.5">fixed physical link details.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 px-1">target table</label>
                                    <div className="p-4 bg-muted/40 rounded-2xl flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-background flex items-center justify-center text-primary"><Icons.database className="size-5" /></div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold truncate lowercase">{relation.target?.name}</p>
                                            <p className="text-[10px] font-mono text-muted-foreground/40">{relation.target?.tableName}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 px-1">foreign key</label>
                                    <div className="p-4 bg-muted/40 rounded-2xl flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-background flex items-center justify-center text-amber-500"><Icons.key className="size-5" /></div>
                                        <p className="text-sm font-mono font-bold text-foreground lowercase">{relation.localKey}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right: Editable Config */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        <Card className="border-none shadow-sm bg-card/40">
                             <CardContent className="p-8 space-y-10">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/5 pb-6 mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><Icons.settings className="size-5" /></div>
                                        <div className="space-y-0.5">
                                            <TextHeading size="h5" className="text-base font-semibold lowercase leading-none">{L.messages.relations.relationType}</TextHeading>
                                            <p className="text-[11px] text-muted-foreground lowercase mt-1.5 opacity-60">update the relationship behavior.</p>
                                        </div>
                                    </div>

                                    <div className="max-w-xs w-full">
                                        <input
                                            type="text"
                                            value={form.alias}
                                            onChange={(e) => setForm(prev => ({ ...prev, alias: e.target.value }))}
                                            placeholder="custom alias name..."
                                            className="w-full h-10 px-5 rounded-xl bg-muted/20 border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/30 lowercase text-xs font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {RELATION_TYPES.map(type => {
                                        const isSelected = form.type === type.value;
                                        return (
                                            <button
                                                key={type.value}
                                                onClick={() => setForm(prev => ({ ...prev, type: type.value as any }))}
                                                className={cn(
                                                    "p-5 rounded-3xl transition-all duration-300 ring-1 text-left flex items-start gap-4 relative group",
                                                    isSelected 
                                                        ? 'bg-primary/5 ring-primary/40 shadow-xl shadow-primary/5' 
                                                        : 'bg-muted/10 ring-border/5 hover:ring-primary/10 hover:bg-muted/20'
                                                )}
                                            >
                                                <div className={cn(
                                                    "size-12 rounded-xl flex items-center justify-center text-xl transition-all duration-500 shrink-0",
                                                    isSelected ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-background text-muted-foreground/20 group-hover:bg-primary/5'
                                                )}>
                                                    {type.icon}
                                                </div>
                                                <div className="space-y-1 pr-6">
                                                    <TextHeading size="h6" className={cn(
                                                        "text-xs font-bold lowercase leading-none",
                                                        isSelected ? "text-primary" : "text-muted-foreground/60"
                                                    )}>{type.label}</TextHeading>
                                                    <p className="text-[10px] text-muted-foreground/40 lowercase leading-relaxed">{type.desc.toLowerCase()}</p>
                                                </div>
                                                {isSelected && (
                                                    <div className="absolute top-5 right-5 text-primary flex items-center justify-center animate-in zoom-in-75 duration-300">
                                                        <Icons.check className="size-4 stroke-4" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                             </CardContent>
                        </Card>
                    </div>
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
                            className="h-11 min-w-[200px] rounded-xl lowercase shadow-lg shadow-primary/20 font-bold"
                        >
                            {C.actions.saveChanges.toLowerCase()}
                        </Button>
                    </div>
                </div>
            </div>
        </TargetLayout>
    );
};
