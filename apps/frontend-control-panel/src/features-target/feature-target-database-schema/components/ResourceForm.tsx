'use client';

/**
 * ResourceForm - Enhanced with Flat Luxury UI
 * Integrated with TargetLayout and consistent Design System
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Select, Card, CardContent, Badge } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { cn } from '@/lib/utils';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { TargetLayout } from '@/components/layout/TargetLayout';
import { useResourceSubmit, useRelations } from '../composables';
import { useConfig } from '@/modules/_core';
import type { DatabaseTable, Resource } from '../types';

const L = MODULE_LABELS.databaseSchema;

interface ResourceFormProps {
    DatabaseTable: DatabaseTable;
    resource?: Resource;
}

// Parse JSON safely
const safeParseJSON = <T,>(json: string | undefined | null, fallback: T): T => {
    if (!json) return fallback;
    try {
        return JSON.parse(json);
    } catch {
        return fallback;
    }
};

interface FormState {
    name: string;
    slug: string;
    description: string;
    fields: string[];
    orderBy: string;
    orderDirection: 'ASC' | 'DESC';
    limit: number;
    isPublic: boolean;
    aggregates?: { function: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX'; column: string; alias?: string }[];
    computed?: { name: string; expression: string }[];
    filters?: { field?: string; operator?: string; value?: string | string[]; logic?: 'AND' | 'OR' }[];
    joins?: { table: string; alias: string; type: 'LEFT' | 'INNER'; on: [string, string] }[];
    relations?: { name: string; fields: string[] }[];
}

export const ResourceForm = ({ DatabaseTable, resource }: ResourceFormProps) => {
    const router = useRouter();
    const params = useParams();
    const nodeId = params.id as string;
    
    // ✅ Pure DI: Get all dependencies from context
    const { labels, icons: Icons, defaults } = useConfig();
    const C = labels.common;

    // All data operations from composable
    const {
        submitting,
        create,
        update,
        fetchAvailableSources,
    } = useResourceSubmit(DatabaseTable.id);

    // Relations Hook
    const {
        relations,
        loading: loadingRelations,
        fetchRelations
    } = useRelations(DatabaseTable.id);

    // Available sources for joins (fetched via composable)
    const [availableSources, setAvailableSources] = useState<DatabaseTable[]>([]);

    useEffect(() => {
        fetchAvailableSources(DatabaseTable.id).then(setAvailableSources);
        fetchRelations();
    }, [DatabaseTable.id, fetchAvailableSources, fetchRelations]);

    // Form State (UI only)
    const [form, setForm] = useState<FormState>({
        name: resource?.name || '',
        slug: resource?.slug || '',
        description: resource?.description || '',
        fields: safeParseJSON(resource?.fieldsJson, []),
        orderBy: resource?.orderBy || defaults.databaseSchema.resourceForm.orderBy,
        orderDirection: resource?.orderDirection || defaults.databaseSchema.resourceForm.orderDirection,
        limit: resource?.defaultLimit || defaults.databaseSchema.resourceForm.defaultLimit,
        isPublic: resource?.isPublic || defaults.databaseSchema.resourceForm.isPublic,
        aggregates: safeParseJSON(resource?.aggregatesJson, []),
        computed: safeParseJSON(resource?.computedJson, []),
        filters: (() => {
            const f = safeParseJSON<Record<string, unknown> | null>(resource?.filtersJson, null);
            if (f && typeof f === 'object' && 'logic' in f && Array.isArray((f as Record<string, unknown>).filters)) {
                return (f as { filters: FormState['filters'] }).filters;
            }
            return Array.isArray(f) ? f as FormState['filters'] : [];
        })(),
        joins: safeParseJSON(resource?.joinsJson, []),
        relations: safeParseJSON(resource?.relationsJson, []),
    });

    const columns = DatabaseTable.schema?.columns || [];

    // Auto-generate slug
    const handleNameChange = (val: string) => {
        const updates: Partial<typeof form> = { name: val };
        if (!resource && !form.slug && val) {
            updates.slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        }
        setForm(prev => ({ ...prev, ...updates }));
    };

    const toggleField = (colName: string) => {
        setForm(prev => {
            const exists = prev.fields.includes(colName);
            if (exists) return { ...prev, fields: prev.fields.filter(f => f !== colName) };
            return { ...prev, fields: [...prev.fields, colName] };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            data_source_id: DatabaseTable.id,
            name: form.name,
            slug: form.slug,
            description: form.description,
            fields_json: JSON.stringify(form.fields),
            order_by: form.orderBy,
            order_direction: form.orderDirection,
            default_limit: form.limit,
            is_public: form.isPublic,
            aggregates_json: JSON.stringify(form.aggregates),
            computed_json: JSON.stringify(form.computed),
            filters_json: JSON.stringify({
                logic: 'AND',
                filters: form.filters
            }),
            joins_json: JSON.stringify(form.joins),
            relations_json: JSON.stringify(form.relations),
        };

        const result = resource
            ? await update(resource.id, payload)
            : await create(payload);

        if (result) {
            const path = nodeId ? `/target/${nodeId}/database-schema` : '/database-schema';
            router.push(path);
            router.refresh();
        }
    };

    return (
        <TargetLayout>
            <div className="flex flex-col gap-10 animate-page-enter max-w-5xl mx-auto pb-32">
                {/* Header */}
                <header className="px-1 space-y-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Icons.api className="size-5" />
                        </div>
                        <TextHeading as="h1" size="h3">{resource ? L.titles.editResource : L.titles.createResource}</TextHeading>
                    </div>
                    <p className="text-sm text-muted-foreground lowercase px-1">define api endpoint for <strong>{DatabaseTable.name}</strong></p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Section: Basic Info */}
                    <Card className="border-none shadow-sm bg-card/40">
                        <CardContent className="p-8 space-y-8">
                            <div className="flex items-center gap-3 border-b border-border/5 pb-6 mb-2">
                                <div className="size-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600"><Icons.edit className="size-5" /></div>
                                <TextHeading size="h5" className="text-base font-semibold lowercase">{L.labels.endpointDetails}</TextHeading>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground lowercase px-1">{L.labels.internalName}</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        placeholder="e.g. published posts"
                                        className="w-full h-12 px-5 rounded-2xl bg-muted/20 border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all font-medium text-sm lowercase"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground lowercase px-1">{L.labels.urlSlug}</label>
                                    <div className="flex h-12 bg-muted/20 rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                                        <span className="px-5 flex items-center text-muted-foreground/40 text-[10px] uppercase font-black tracking-tighter border-r border-border/5">{L.labels.apiPrefix}</span>
                                        <input
                                            type="text"
                                            value={form.slug}
                                            onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '') })}
                                            placeholder="published-posts"
                                            className="flex-1 px-5 bg-transparent border-none outline-none font-mono text-sm lowercase"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground lowercase px-1">{L.forms.description}</label>
                                    <input
                                        type="text"
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder={L.forms.descriptionPlaceholder}
                                        className="w-full h-12 px-5 rounded-2xl bg-muted/20 border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all text-sm lowercase"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section: Fields */}
                    <Card className="border-none shadow-sm bg-card/40">
                        <CardContent className="p-8 space-y-8">
                            <div className="flex items-center gap-3 border-b border-border/5 pb-6 mb-2">
                                <div className="size-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600"><Icons.gem className="size-5" /></div>
                                <div className="space-y-0.5">
                                    <TextHeading size="h5" className="text-base font-semibold lowercase">{L.labels.responseFields}</TextHeading>
                                    <p className="text-[11px] text-muted-foreground lowercase">{L.labels.selectFieldsHint.toLowerCase()}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2.5">
                                {columns.length === 0 && <p className="text-sm text-muted-foreground lowercase italic">{L.labels.noColumnsInSchema}</p>}
                                {columns.map(col => {
                                    const isSelected = form.fields.length === 0 || form.fields.includes(col.name);
                                    return (
                                        <button
                                            key={col.name}
                                            type="button"
                                            onClick={() => toggleField(col.name)}
                                            className={cn(
                                                "group h-10 px-4 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-3 border-none",
                                                isSelected
                                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                                    : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                                            )}
                                        >
                                            <div className={cn(
                                                "size-4 rounded-full flex items-center justify-center border transition-all",
                                                isSelected ? 'bg-white border-white text-blue-500 shadow-sm' : 'bg-muted-foreground/10 border-transparent'
                                            )}>
                                                {isSelected && <Icons.check className="size-2.5 stroke-4" />}
                                            </div>
                                            <span className="lowercase">{col.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {form.fields.length === 0 && (
                                <div className="mt-4 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-center text-[11px] text-blue-600/80 lowercase font-medium">
                                    <Icons.sparkles className="size-3.5 inline mr-2 opacity-50" />
                                    <strong>{L.labels.allFieldsSelected}</strong> — {L.labels.selectSpecificFields.toLowerCase()}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section: Relations (Eager Loading) */}
                    <Card className="border-none shadow-sm bg-card/40">
                        <CardContent className="p-8 space-y-8">
                            <div className="flex items-center gap-3 border-b border-border/5 pb-6 mb-2">
                                <div className="size-10 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-600"><Icons.link className="size-5" /></div>
                                <div className="space-y-0.5">
                                    <TextHeading size="h5" className="text-base font-semibold lowercase">{L.labels.relatedData}</TextHeading>
                                    <p className="text-[11px] text-muted-foreground lowercase">{L.labels.relatedDataHint.toLowerCase()}</p>
                                </div>
                            </div>

                            {loadingRelations ? (
                                <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
                                    <Icons.loading className="size-5 animate-spin" />
                                    <span className="text-sm lowercase">loading relations...</span>
                                </div>
                            ) : relations.length === 0 ? (
                                <div className="text-center py-12 px-4 bg-muted/20 rounded-3xl border border-dashed border-border/40 text-muted-foreground space-y-2">
                                    <div className="size-12 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-4">
                                        <Icons.link className="size-6 opacity-20" />
                                    </div>
                                    <p className="text-sm font-medium lowercase italic">{L.labels.noRelationsDefined}</p>
                                    <p className="text-[11px] lowercase opacity-60">{L.labels.defineRelationsFirst.toLowerCase()}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {relations.map(rel => {
                                        const selectedRel = form.relations?.find(r => r.name === rel.alias);
                                        return (
                                            <div 
                                                key={rel.id} 
                                                className={cn(
                                                    "p-6 rounded-2xl transition-all duration-300 border-none",
                                                    selectedRel ? 'bg-violet-500/5 ring-1 ring-violet-500/20 shadow-sm' : 'bg-muted/10 hover:bg-muted/20'
                                                )}
                                            >
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "size-10 rounded-xl flex items-center justify-center transition-all",
                                                            selectedRel ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' : 'bg-muted/40 text-muted-foreground'
                                                        )}>
                                                            <Icons.database className="size-5" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <TextHeading size="h6" className="text-sm font-bold lowercase leading-none">{rel.alias}</TextHeading>
                                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter opacity-60">
                                                                {rel.type} {rel.pivotTable ? `via ${rel.pivotTable}` : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (selectedRel) {
                                                                setForm(prev => ({ ...prev, relations: (prev.relations || []).filter(r => r.name !== rel.alias) }));
                                                            } else {
                                                                setForm(prev => ({ ...prev, relations: [...(prev.relations || []), { name: rel.alias, fields: [] }] }));
                                                            }
                                                        }}
                                                        className={cn(
                                                            "w-10 h-6 rounded-full p-1 transition-all duration-300 relative",
                                                            selectedRel ? 'bg-violet-500' : 'bg-muted-foreground/20'
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "size-4 rounded-full bg-white shadow-sm transition-transform duration-300",
                                                            selectedRel ? 'translate-x-4' : 'translate-x-0'
                                                        )} />
                                                    </button>
                                                </div>

                                                {selectedRel && (
                                                    <div className="space-y-4 pt-4 border-t border-violet-500/10 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        <TextHeading size="h6" className="text-[10px] font-black uppercase tracking-widest text-violet-500/60 block">include columns</TextHeading>
                                                        <div className="flex flex-wrap gap-2">
                                                            {(() => {
                                                                const targetSource = availableSources.find(s => s.id === rel.targetId);
                                                                const isSystemTarget = rel.targetId === 0 || targetSource?.isSystem;

                                                                if (isSystemTarget) {
                                                                   return (
                                                                        <div className="w-full bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 flex gap-4 items-start">
                                                                            <Icons.lock className="size-4 text-amber-600/60 mt-0.5" />
                                                                            <div className="space-y-1">
                                                                                <TextHeading size="h6" className="text-[10px] font-bold text-amber-700/80 lowercase">{L.messages.warnings.systemTableRestricted}</TextHeading>
                                                                                <p className="text-[10px] text-amber-600/60 lowercase leading-relaxed">
                                                                                    {L.messages.warnings.restrictedColSelection.toLowerCase()}. {L.messages.warnings.standardFieldsAuto.toLowerCase()}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }

                                                                if (!targetSource) {
                                                                    return <span className="text-[10px] text-rose-500 font-bold lowercase">source not found (id: {rel.targetId})</span>;
                                                                }

                                                                return targetSource.schema?.columns.map(col => {
                                                                    const isColSelected = selectedRel.fields.includes(col.name);
                                                                    return (
                                                                        <button
                                                                            key={col.name}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const newRelations = [...(form.relations || [])];
                                                                                const relIndex = newRelations.findIndex(r => r.name === rel.alias);
                                                                                if (relIndex > -1) {
                                                                                    const existingFields = newRelations[relIndex].fields;
                                                                                    newRelations[relIndex].fields = isColSelected 
                                                                                        ? existingFields.filter(f => f !== col.name) 
                                                                                        : [...existingFields, col.name];
                                                                                    setForm(prev => ({ ...prev, relations: newRelations }));
                                                                                }
                                                                            }}
                                                                            className={cn(
                                                                                "px-3 py-1.5 rounded-lg text-[10px] font-bold lowercase transition-all outline-none border-none",
                                                                                isColSelected
                                                                                    ? 'bg-violet-500 text-white shadow-sm'
                                                                                    : 'bg-muted/40 text-muted-foreground hover:bg-violet-500/10 hover:text-violet-600'
                                                                            )}
                                                                        >
                                                                            {col.name}
                                                                        </button>
                                                                    );
                                                                });
                                                            })()}
                                                        </div>
                                                        {selectedRel.fields.length === 0 && (
                                                            <p className="text-[9px] text-violet-500/50 italic lowercase">
                                                                * {L.labels.allFieldsSelected.toLowerCase()} (will return all fields)
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section: Computed Fields */}
                    <Card className="border-none shadow-sm bg-card/40">
                        <CardContent className="p-8 space-y-8">
                            <div className="flex items-center gap-3 border-b border-border/5 pb-6 mb-2">
                                <div className="size-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600"><Icons.lightning className="size-5" /></div>
                                <div className="space-y-0.5">
                                    <TextHeading size="h5" className="text-base font-semibold lowercase">{L.labels.computedFields}</TextHeading>
                                    <p className="text-[11px] text-muted-foreground lowercase">{L.labels.computedFieldsHint.toLowerCase()}</p>
                                </div>
                            </div>

                            {!form.computed || form.computed.length === 0 ? (
                                <div className="text-center py-12 px-4 bg-muted/20 rounded-3xl border border-dashed border-border/40 text-muted-foreground space-y-4">
                                    <p className="text-sm font-medium lowercase italic opacity-60">{L.labels.noComputedFields}</p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-9 px-6 rounded-xl border-rose-500/20 text-rose-600 hover:bg-rose-500/10 hover:border-rose-500/40 text-xs lowercase"
                                        onClick={() => setForm({ ...form, computed: [{ name: '', expression: '' }] })}
                                    >
                                        <Icons.plus className="size-3.5 mr-2" /> {L.labels.addComputedField}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4 max-w-4xl mx-auto">
                                    {form.computed.map((comp, idx) => (
                                        <div key={idx} className="flex flex-col md:flex-row items-center gap-4 bg-muted/20 p-4 md:p-3 rounded-2xl border-none ring-1 ring-border/5 group animate-in slide-in-from-left-2 duration-200">
                                            <div className="px-3 py-1.5 rounded-lg bg-background text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{L.labels.sqlSelect}</div>
                                            <input
                                                type="text"
                                                value={comp.expression}
                                                placeholder="price * quantity"
                                                onChange={(e) => {
                                                    const newComp = [...form.computed!];
                                                    newComp[idx].expression = e.target.value;
                                                    setForm({ ...form, computed: newComp });
                                                }}
                                                className="flex-1 min-w-0 h-10 px-4 rounded-xl bg-background border-none focus:ring-1 focus:ring-rose-500/20 outline-none transition-all font-mono text-xs lowercase"
                                            />
                                            <div className="px-3 py-1.5 rounded-lg bg-background text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{L.labels.sqlAs}</div>
                                            <input
                                                type="text"
                                                value={comp.name}
                                                placeholder="total_amount"
                                                onChange={(e) => {
                                                    const newComp = [...form.computed!];
                                                    newComp[idx].name = e.target.value;
                                                    setForm({ ...form, computed: newComp });
                                                }}
                                                className="w-48 h-10 px-4 rounded-xl bg-background border-none focus:ring-1 focus:ring-rose-500/20 outline-none transition-all font-bold text-xs lowercase"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => {
                                                    const newComp = form.computed!.filter((_, i) => i !== idx);
                                                    setForm({ ...form, computed: newComp });
                                                }}
                                                className="rounded-xl hover:bg-rose-500/10 hover:text-rose-600 text-muted-foreground/40 shrink-0"
                                            >
                                                <Icons.close className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-10 px-6 rounded-xl text-rose-600 hover:bg-rose-500/5 text-xs lowercase font-bold"
                                        onClick={() => setForm({ ...form, computed: [...form.computed!, { name: '', expression: '' }] })}
                                    >
                                        <Icons.plus className="size-4 mr-2" /> {L.labels.addAnotherField}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section: Aggregates */}
                    <Card className="border-none shadow-sm bg-card/40">
                        <CardContent className="p-8 space-y-8">
                            <div className="flex items-center gap-3 border-b border-border/5 pb-6 mb-2">
                                <div className="size-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600"><Icons.chart className="size-5" /></div>
                                <div className="space-y-0.5">
                                    <TextHeading size="h5" className="text-base font-semibold lowercase">{L.labels.aggregates}</TextHeading>
                                    <p className="text-[11px] text-muted-foreground lowercase">{L.labels.aggregatesHint.toLowerCase()}</p>
                                </div>
                            </div>

                            {!form.aggregates || form.aggregates.length === 0 ? (
                                <div className="text-center py-12 px-4 bg-muted/20 rounded-3xl border border-dashed border-border/40 text-muted-foreground space-y-4">
                                    <p className="text-sm font-medium lowercase italic opacity-60">{L.labels.noAggregates}</p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-9 px-6 rounded-xl border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-xs lowercase"
                                        onClick={() => setForm({ ...form, aggregates: [{ function: 'COUNT', column: '*' }] })}
                                    >
                                        <Icons.plus className="size-3.5 mr-2" /> {L.labels.addAggregate}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4 max-w-4xl mx-auto">
                                    {form.aggregates.map((agg, idx) => (
                                        <div key={idx} className="flex flex-col md:flex-row items-center gap-4 bg-muted/20 p-4 md:p-3 rounded-2xl border-none ring-1 ring-border/5 group animate-in slide-in-from-left-2 duration-200">
                                            <div className="w-full md:w-32">
                                                <Select
                                                    value={agg.function}
                                                    onChange={(e) => {
                                                        const newAggs = [...form.aggregates!];
                                                        newAggs[idx].function = e.target.value as any;
                                                        setForm({ ...form, aggregates: newAggs });
                                                    }}
                                                    size="sm"
                                                    fullWidth={true}
                                                    options={[
                                                        { label: 'COUNT', value: 'COUNT' },
                                                        { label: 'SUM', value: 'SUM' },
                                                        { label: 'AVG', value: 'AVG' },
                                                        { label: 'MIN', value: 'MIN' },
                                                        { label: 'MAX', value: 'MAX' }
                                                    ]}
                                                />
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-tighter text-muted-foreground/30">{C.pagination.of}</span>
                                            <div className="flex-1 w-full md:w-auto">
                                                <Select
                                                    value={agg.column}
                                                    onChange={(e) => {
                                                        const newAggs = [...form.aggregates!];
                                                        newAggs[idx].column = e.target.value;
                                                        setForm({ ...form, aggregates: newAggs });
                                                    }}
                                                    size="sm"
                                                    fullWidth={true}
                                                    options={[
                                                        { label: `* ALL`, value: '*' },
                                                        ...columns.map(c => ({ label: c.name, value: c.name }))
                                                    ]}
                                                />
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-tighter text-muted-foreground/30">{L.messages.relations.as}</span>
                                            <input
                                                type="text"
                                                value={agg.alias || ''}
                                                placeholder={`${agg.column}_${agg.function}`.toLowerCase()}
                                                onChange={(e) => {
                                                    const newAggs = [...form.aggregates!];
                                                    newAggs[idx].alias = e.target.value;
                                                    setForm({ ...form, aggregates: newAggs });
                                                }}
                                                className="w-full md:w-48 h-10 px-4 rounded-xl bg-background border-none focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all font-bold text-xs lowercase"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => {
                                                    const newAggs = form.aggregates!.filter((_, i) => i !== idx);
                                                    setForm({ ...form, aggregates: newAggs });
                                                }}
                                                className="rounded-xl hover:bg-rose-500/10 hover:text-rose-600 text-muted-foreground/40 shrink-0"
                                            >
                                                <Icons.close className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-10 px-6 rounded-xl text-emerald-600 hover:bg-emerald-500/5 text-xs lowercase font-bold"
                                        onClick={() => setForm({ ...form, aggregates: [...form.aggregates!, { function: 'COUNT', column: '*' }] })}
                                    >
                                        <Icons.plus className="size-4 mr-2" /> {L.labels.addAnotherAggregate}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section: Relations (Joins) */}
                    {/* Simplified Joins Section using common cards */}
                     <Card className="border-none shadow-sm bg-card/40">
                        <CardContent className="p-8 space-y-8">
                            <div className="flex items-center gap-3 border-b border-border/5 pb-6 mb-2">
                                <div className="size-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600"><Icons.link className="size-5" /></div>
                                <div className="space-y-0.5">
                                    <TextHeading size="h5" className="text-base font-semibold lowercase">{L.labels.relationsJoins}</TextHeading>
                                    <p className="text-[11px] text-muted-foreground lowercase">{L.labels.relationsJoinsHint.toLowerCase()}</p>
                                </div>
                            </div>

                            {!form.joins || form.joins.length === 0 ? (
                                <div className="text-center py-12 px-4 bg-muted/20 rounded-3xl border border-dashed border-border/40 text-muted-foreground space-y-4">
                                    <p className="text-sm font-medium lowercase italic opacity-60">{L.labels.noRelationsDefined}</p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-9 px-6 rounded-xl border-orange-500/20 text-orange-600 hover:bg-orange-500/10 hover:border-orange-500/40 text-xs lowercase"
                                        onClick={() => setForm({ ...form, joins: [{ table: availableSources[0]?.tableName || '', alias: '', type: 'LEFT', on: ['', 'id'] }] })}
                                        disabled={availableSources.length === 0}
                                    >
                                        <Icons.plus className="size-3.5 mr-2" /> {L.labels.addRelation}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6 max-w-4xl mx-auto">
                                    {form.joins.map((join, idx) => {
                                        const targetSource = availableSources.find(s => s.tableName === join.table);
                                        const targetColumns = targetSource?.schema?.columns || [];

                                        return (
                                            <div key={idx} className="bg-muted/10 p-6 rounded-3xl ring-1 ring-border/5 space-y-6 animate-in slide-in-from-left-2 duration-300">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">{C.table.type}</label>
                                                        <Select
                                                            value={join.type}
                                                            onChange={(e) => {
                                                                const newJoins = [...form.joins!];
                                                                newJoins[idx].type = e.target.value as any;
                                                                setForm({ ...form, joins: newJoins });
                                                            }}
                                                            size="sm"
                                                            fullWidth
                                                            options={[
                                                                { label: 'LEFT JOIN', value: 'LEFT' },
                                                                { label: 'INNER JOIN', value: 'INNER' }
                                                            ]}
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5 md:col-span-2 relative">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">{L.labels.targetTable}</label>
                                                        <div className="flex gap-2">
                                                            <div className="flex-1">
                                                                <Select
                                                                    value={join.table}
                                                                    onChange={(e) => {
                                                                        const newJoins = [...form.joins!];
                                                                        newJoins[idx].table = e.target.value;
                                                                        const newTargetSource = availableSources.find(s => s.tableName === e.target.value);
                                                                        newJoins[idx].on = [newJoins[idx].on[0], newTargetSource?.schema?.columns[0]?.name || 'id'];
                                                                        setForm({ ...form, joins: newJoins });
                                                                    }}
                                                                    size="sm"
                                                                    fullWidth
                                                                    options={availableSources.map(s => ({ label: `${s.name} (${s.tableName})`, value: s.tableName }))}
                                                                />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon-sm"
                                                                onClick={() => {
                                                                    const newJoins = form.joins!.filter((_, i) => i !== idx);
                                                                    setForm({ ...form, joins: newJoins });
                                                                }}
                                                                className="h-9 w-9 rounded-xl hover:bg-rose-500/10 hover:text-rose-600 text-muted-foreground/40 shrink-0"
                                                            >
                                                                <Icons.delete className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-background/40 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4 border-none ring-1 ring-border/5">
                                                    <div className="px-3 py-1 bg-muted/60 rounded-lg text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap">{L.labels.onCondition}</div>
                                                    <div className="flex-1 w-full md:w-auto">
                                                        <Select
                                                            value={join.on[0]}
                                                            onChange={(e) => {
                                                                const newJoins = [...form.joins!];
                                                                newJoins[idx].on[0] = e.target.value;
                                                                setForm({ ...form, joins: newJoins });
                                                            }}
                                                            size="sm"
                                                            fullWidth
                                                            options={[
                                                                { label: `SELECT COLUMN...`, value: '' },
                                                                ...columns.map(c => ({ label: `${DatabaseTable.tableName}.${c.name}`, value: c.name }))
                                                            ]}
                                                        />
                                                    </div>
                                                    <Icons.link className="size-4 text-muted-foreground/20 rotate-90 md:rotate-0" />
                                                    <div className="flex-1 w-full md:w-auto">
                                                        <Select
                                                            value={join.on[1]}
                                                            onChange={(e) => {
                                                                const newJoins = [...form.joins!];
                                                                newJoins[idx].on[1] = e.target.value;
                                                                setForm({ ...form, joins: newJoins });
                                                            }}
                                                            size="sm"
                                                            fullWidth
                                                            options={[
                                                                { label: `SELECT COLUMN...`, value: '' },
                                                                ...targetColumns.map(c => ({ label: `${join.alias || join.table}.${c.name}`, value: c.name }))
                                                            ]}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-10 px-6 rounded-xl text-orange-600 hover:bg-orange-500/5 text-xs lowercase font-bold"
                                        onClick={() => setForm({ ...form, joins: [...form.joins!, { table: availableSources[0]?.tableName || '', alias: '', type: 'LEFT', on: ['', 'id'] }] })}
                                    >
                                        <Icons.plus className="size-4 mr-2" /> {L.labels.addAnotherRelation}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section: Default Filters */}
                    <Card className="border-none shadow-sm bg-card/40">
                        <CardContent className="p-8 space-y-8">
                            <div className="flex items-center gap-3 border-b border-border/5 pb-6 mb-2">
                                <div className="size-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600"><Icons.search className="size-5" /></div>
                                <div className="space-y-0.5">
                                    <TextHeading size="h5" className="text-base font-semibold lowercase">{L.labels.defaultFilters}</TextHeading>
                                    <p className="text-[11px] text-muted-foreground lowercase">{L.labels.defaultFiltersHint.toLowerCase()}</p>
                                </div>
                            </div>

                            {!form.filters || form.filters.length === 0 ? (
                                <div className="text-center py-12 px-4 bg-muted/20 rounded-3xl border border-dashed border-border/40 text-muted-foreground space-y-4">
                                    <p className="text-sm font-medium lowercase italic opacity-60">{L.labels.noDefaultFilters}</p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-9 px-6 rounded-xl border-amber-500/20 text-amber-600 hover:bg-amber-500/10 hover:border-amber-500/40 text-xs lowercase"
                                        onClick={() => setForm({ ...form, filters: [{ field: columns[0]?.name || '', operator: 'eq', value: '' }] })}
                                    >
                                        <Icons.plus className="size-3.5 mr-2" /> {L.labels.addFilter}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4 max-w-4xl mx-auto">
                                    {form.filters.map((filter, idx) => (
                                        <div key={idx} className="flex items-center gap-3 animate-in slide-in-from-left-2 duration-200">
                                            {idx > 0 && <div className="px-2 py-1 rounded-md bg-muted text-[10px] font-black uppercase tracking-tighter text-muted-foreground mt-0.5">AND</div>}
                                            <div className="flex-1 flex flex-col md:flex-row items-center gap-4 bg-muted/20 p-3 rounded-2xl ring-1 ring-border/5">
                                                <div className="w-full md:w-48">
                                                    <Select
                                                        value={filter.field}
                                                        onChange={(e) => {
                                                            const newFilters = [...form.filters!];
                                                            newFilters[idx].field = e.target.value;
                                                            setForm({ ...form, filters: newFilters });
                                                        }}
                                                        size="sm"
                                                        fullWidth
                                                        options={[
                                                            { label: `SELECT FIELD...`, value: '' },
                                                            ...columns.map(c => ({ label: c.name, value: c.name }))
                                                        ]}
                                                    />
                                                </div>

                                                <div className="w-full md:w-40">
                                                    <Select
                                                        value={filter.operator}
                                                        onChange={(e) => {
                                                            const newFilters = [...form.filters!];
                                                            newFilters[idx].operator = e.target.value;
                                                            setForm({ ...form, filters: newFilters });
                                                        }}
                                                        size="sm"
                                                        fullWidth
                                                        options={[
                                                            { label: 'EQUALS (=)', value: 'eq' },
                                                            { label: 'NOT EQUAL (!=)', value: 'neq' },
                                                            { label: 'GREATER (>)', value: 'gt' },
                                                            { label: 'GREATER/EQ (>=)', value: 'gte' },
                                                            { label: 'LESS (<)', value: 'lt' },
                                                            { label: 'LESS/EQ (<=)', value: 'lte' },
                                                            { label: 'CONTAINS (LIKE)', value: 'like' },
                                                            { label: 'IN LIST (IN)', value: 'in' },
                                                            { label: 'IS NULL', value: 'null' },
                                                            { label: 'IS NOT NULL', value: 'notNull' }
                                                        ]}
                                                    />
                                                </div>

                                                {!['null', 'notNull'].includes(filter.operator!) && (
                                                    <input
                                                        type="text"
                                                        value={filter.value || ''}
                                                        placeholder={filter.operator === 'in' ? 'val1,val2,val3' : 'Value'}
                                                        onChange={(e) => {
                                                            const newFilters = [...form.filters!];
                                                            newFilters[idx].value = filter.operator === 'in' ? e.target.value.split(',') : e.target.value;
                                                            setForm({ ...form, filters: newFilters });
                                                        }}
                                                        className="flex-1 min-w-0 h-10 px-4 rounded-xl bg-background border-none focus:ring-1 focus:ring-amber-500/20 outline-none transition-all text-xs lowercase"
                                                    />
                                                )}

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() => {
                                                        const newFilters = form.filters!.filter((_, i) => i !== idx);
                                                        setForm({ ...form, filters: newFilters });
                                                    }}
                                                    className="rounded-xl hover:bg-rose-500/10 hover:text-rose-600 text-muted-foreground/40 shrink-0"
                                                >
                                                    <Icons.close className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-10 px-6 rounded-xl text-amber-600 hover:bg-amber-500/5 text-xs lowercase font-bold"
                                        onClick={() => setForm({ ...form, filters: [...form.filters!, { field: columns[0]?.name || '', operator: 'eq', value: '' }] })}
                                    >
                                        <Icons.plus className="size-4 mr-2" /> {L.labels.addFilter}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section: Config */}
                    <Card className="border-none shadow-sm bg-card/40">
                        <CardContent className="p-8 space-y-10">
                            <div className="flex items-center gap-3 border-b border-border/5 pb-6 mb-2">
                                <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Icons.settings className="size-5" /></div>
                                <TextHeading size="h5" className="text-base font-semibold lowercase">{L.labels.configuration}</TextHeading>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">{L.labels.defaultSortConfig}</label>
                                    <div className="flex flex-col gap-3">
                                        <Select
                                            value={form.orderBy}
                                            onChange={(e) => setForm({ ...form, orderBy: e.target.value })}
                                            size="sm"
                                            fullWidth
                                            options={columns.map(c => ({ label: c.name, value: c.name }))}
                                        />
                                        <div className="flex bg-muted/40 p-1 rounded-xl h-10 ring-1 ring-border/5">
                                            <button
                                                type="button"
                                                onClick={() => setForm({ ...form, orderDirection: 'ASC' })}
                                                className={cn(
                                                    "flex-1 rounded-lg text-[10px] font-black transition-all",
                                                    form.orderDirection === 'ASC' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground/40 hover:text-muted-foreground'
                                                )}
                                            >
                                                ASCENDING
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setForm({ ...form, orderDirection: 'DESC' })}
                                                className={cn(
                                                    "flex-1 rounded-lg text-[10px] font-black transition-all",
                                                    form.orderDirection === 'DESC' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground/40 hover:text-muted-foreground'
                                                )}
                                            >
                                                DESCENDING
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">{L.labels.limitPerPage}</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={defaults.databaseSchema.resourceForm.maxLimit}
                                        value={form.limit}
                                        onChange={(e) => setForm({ ...form, limit: parseInt(e.target.value) || defaults.databaseSchema.resourceForm.defaultLimit })}
                                        className="w-full h-10 px-4 rounded-xl bg-muted/40 border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all font-bold text-sm lowercase"
                                    />
                                </div>
                                
                                <div className="lg:col-span-1 space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">{L.labels.publicAccess}</label>
                                    <div 
                                        onClick={() => setForm({ ...form, isPublic: !form.isPublic })}
                                        className={cn(
                                            "p-6 rounded-3xl transition-all duration-300 cursor-pointer flex items-start gap-4 ring-1",
                                            form.isPublic 
                                                ? 'bg-amber-500/5 ring-amber-500/20' 
                                                : 'bg-emerald-500/5 ring-emerald-500/20 hover:bg-emerald-500/10'
                                        )}
                                    >
                                        <div className={cn(
                                            "size-10 rounded-2xl flex items-center justify-center transition-all shrink-0",
                                            form.isPublic ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        )}>
                                            {form.isPublic ? <Icons.unlock className="size-5" /> : <Icons.lock className="size-5" />}
                                        </div>
                                        <div className="space-y-1">
                                            <TextHeading size="h6" className="text-sm font-bold lowercase leading-none">
                                                {form.isPublic ? 'public access' : 'protected access'}
                                            </TextHeading>
                                            <p className="text-[10px] text-muted-foreground/60 lowercase leading-relaxed">
                                                {form.isPublic ? L.labels.publicAccessWarning.toLowerCase() : L.labels.protectedAccessNote.toLowerCase()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>

                {/* Premium Action Bar */}
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

                        <div className="flex items-center gap-4">
                             {resource && (
                                <Badge variant="secondary" className="hidden sm:flex px-3 py-1 h-7 rounded-lg bg-muted text-[10px] font-black uppercase tracking-tighter border-none">
                                    ID: {resource.id}
                                </Badge>
                             )}
                            <Button
                                onClick={handleSubmit}
                                size="lg"
                                isLoading={submitting}
                                className="h-11 min-w-[200px] rounded-xl lowercase shadow-lg shadow-primary/20 font-bold"
                            >
                                {resource ? C.actions.saveChanges : L.buttons.createResource}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </TargetLayout>
    );
};
