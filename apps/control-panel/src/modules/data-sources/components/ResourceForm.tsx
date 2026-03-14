'use client';

// ResourceForm - Premium full-page form for creating/editing resources
// Pure UI component - all data operations via composables
// ✅ PURE DI: Uses useConfig() hook for all config, labels, icons

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Select } from '@cp/ui';
import { useResourceSubmit, useRelations, type ResourcePayload } from '../composables';
import { useConfig } from '@/modules/_core';
import type { DataSource, Resource } from '../types';

interface ResourceFormProps {
    dataSource: DataSource;
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

export const ResourceForm = ({ dataSource, resource }: ResourceFormProps) => {
    const router = useRouter();
    // ✅ Pure DI: Get all dependencies from context
    const { labels, icons: Icons, defaults } = useConfig();
    const L = labels.mod.dataSources;
    const C = labels.common;

    // All data operations from composable
    const {
        submitting,
        create,
        update,
        fetchAvailableSources,
    } = useResourceSubmit(dataSource.id);

    // Relations Hook
    const {
        relations,
        loading: loadingRelations,
        fetchRelations
    } = useRelations(dataSource.id);

    // Available sources for joins (fetched via composable)
    const [availableSources, setAvailableSources] = useState<DataSource[]>([]);

    useEffect(() => {
        fetchAvailableSources(dataSource.id).then(setAvailableSources);
        fetchRelations();
    }, [dataSource.id, fetchAvailableSources, fetchRelations]);

    // Form State (UI only)
    const [form, setForm] = useState<FormState>({
        name: resource?.name || '',
        slug: resource?.slug || '',
        description: resource?.description || '',
        fields: safeParseJSON(resource?.fieldsJson, []),
        orderBy: resource?.orderBy || defaults.dataSources.resourceForm.orderBy,
        orderDirection: resource?.orderDirection || defaults.dataSources.resourceForm.orderDirection,
        limit: resource?.defaultLimit || defaults.dataSources.resourceForm.defaultLimit,
        isPublic: resource?.isPublic || defaults.dataSources.resourceForm.isPublic,
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

    const columns = dataSource.schema?.columns || [];

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

        const payload: ResourcePayload = {
            data_source_id: dataSource.id,
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
            router.push('/data-sources');
            router.refresh();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section: Basic Info */}
            <div className="bg-white rounded-xl p-5 border border-slate-200">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600"><Icons.edit className="w-5 h-5" /></div>
                    <h2 className="text-lg font-semibold text-slate-800">{L.labels.endpointDetails}</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{L.labels.internalName} <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="e.g. Published Posts"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{L.labels.urlSlug} <span className="text-red-500">*</span></label>
                        <div className="flex">
                            <span className="bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg px-4 flex items-center text-slate-500 text-sm font-mono">{L.labels.apiPrefix}</span>
                            <input
                                type="text"
                                value={form.slug}
                                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '') })}
                                placeholder="published-posts"
                                className="w-full px-4 py-2.5 rounded-r-lg border border-slate-200 focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-mono text-sm"
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">{L.forms.description}</label>
                        <input
                            type="text"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder={L.forms.descriptionPlaceholder}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Section: Fields */}
            <div className="bg-white rounded-xl p-5 border border-slate-200">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><Icons.gem className="w-5 h-5" /></div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">{L.labels.responseFields}</h2>
                        <p className="text-sm text-slate-500">{L.labels.selectFieldsHint}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {columns.length === 0 && <p className="text-slate-400">{L.labels.noColumnsInSchema}</p>}
                    {columns.map(col => {
                        const isSelected = form.fields.length === 0 || form.fields.includes(col.name);
                        return (
                            <button
                                key={col.name}
                                type="button"
                                onClick={() => toggleField(col.name)}
                                className={`
                                    group relative px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-200 flex items-center gap-2.5
                                    ${isSelected
                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                    }
                                `}
                            >
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'bg-slate-100 border-slate-200 group-hover:bg-slate-200'}`}>
                                    {isSelected && <Icons.check className="w-2.5 h-2.5" />}
                                </div>
                                {col.name}
                            </button>
                        );
                    })}
                </div>
                {form.fields.length === 0 && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center text-slate-500 text-xs">
                        <span className="font-semibold"><Icons.sparkles className="w-3.5 h-3.5 inline mr-1" />{L.labels.allFieldsSelected}</span> {L.labels.selectSpecificFields}
                    </div>
                )}
            </div>

            {/* Section: Relations (Eager Loading) */}
            <div className="bg-white rounded-xl p-5 border border-slate-200">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600"><Icons.link className="w-5 h-5" /></div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">{L.labels.relatedData}</h2>
                        <p className="text-sm text-slate-500">{L.labels.relatedDataHint}</p>
                    </div>
                </div>

                {loadingRelations ? (
                    <div className="text-center py-8 text-slate-400">{L.labels.loading}</div>
                ) : relations.length === 0 ? (
                    <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
                        {L.labels.noRelationsDefined} <br />
                        <span className="text-xs">{L.labels.defineRelationsFirst}</span>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {relations.map(rel => {
                            const selectedRel = form.relations?.find(r => r.name === rel.alias);
                            return (
                                <div key={rel.id} className={`p-4 rounded-xl border transition-all ${selectedRel ? 'bg-violet-50/50 border-violet-200' : 'bg-white border-slate-200'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectedRel ? 'bg-violet-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            {selectedRel && <Icons.check className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-800 text-sm">{rel.alias}</h3>
                                            <p className="text-xs text-slate-500">{rel.type} {rel.pivotTable ? `via ${rel.pivotTable}` : ''}</p>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                checked={!!selectedRel}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setForm(prev => ({ ...prev, relations: [...(prev.relations || []), { name: rel.alias, fields: [] }] }));
                                                    } else {
                                                        setForm(prev => ({ ...prev, relations: (prev.relations || []).filter(r => r.name !== rel.alias) }));
                                                    }
                                                }}
                                            />
                                            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${selectedRel ? 'bg-violet-500' : 'bg-slate-200'}`}>
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${selectedRel ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Field Selection for Relation */}
                                    {selectedRel && (
                                        <div className="mt-4 pt-4 border-t border-violet-200/50">
                                            <label className="text-xs font-semibold text-violet-700 block mb-2">{L.labels.includeColumns}</label>
                                            <div className="flex flex-wrap gap-2">
                                                {(() => {
                                                    // Find target source columns
                                                    const targetSource = availableSources.find(s => s.id === rel.targetId);
                                                    // Check for system table (ID 0 or explicitly marked)
                                                    const isSystemTarget = rel.targetId === 0 || targetSource?.isSystem;

                                                    if (isSystemTarget) {
                                                        return (
                                                            <div className="w-full bg-amber-50 border border-amber-200 rounded-lg p-3">
                                                                <div className="flex items-start gap-2">
                                                                    <Icons.lock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                                                                    <div className="text-xs text-amber-800">
                                                                        <span className="font-bold block mb-1">{L.messages.warnings.systemTableRestricted}</span>
                                                                        <p>
                                                                            {L.messages.warnings.restrictedColSelection}
                                                                        </p>
                                                                        <p className="mt-1 text-amber-700/80">
                                                                            {L.messages.warnings.standardFieldsAuto}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    // Extract message construction to variable to satisfy eslint
                                                    if (!targetSource) {
                                                        const notFoundMsg = `${L.messages.error.sourceNotFound || "Target source not found"} (ID: ${rel.targetId})`;
                                                        return <span className="text-xs text-red-400">{notFoundMsg}</span>;
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
                                                                        if (isColSelected) {
                                                                            newRelations[relIndex].fields = existingFields.filter(f => f !== col.name);
                                                                        } else {
                                                                            newRelations[relIndex].fields = [...existingFields, col.name];
                                                                        }
                                                                        setForm(prev => ({ ...prev, relations: newRelations }));
                                                                    }
                                                                }}
                                                                className={`
                                                                    px-2.5 py-1 rounded-md text-xs font-medium border transition-colors
                                                                    ${isColSelected
                                                                        ? 'bg-violet-500 border-violet-500 text-white'
                                                                        : 'bg-white border-slate-200 text-slate-500 hover:border-violet-300'
                                                                    }
                                                                `}
                                                            >
                                                                {col.name}
                                                            </button>
                                                        );
                                                    }) || <span className="text-xs text-slate-400">{L.labels.noColumnsInSchema || "No columns found"}</span>;
                                                })()}
                                            </div>
                                            {selectedRel.fields.length === 0 && (
                                                <p className="text-xs text-violet-500 mt-2 opacity-70">
                                                    {(() => {
                                                        const hintText = `* ${L.labels.allFieldsSelected || "No columns selected (will return all fields)"}`;
                                                        return hintText;
                                                    })()}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )
                }
            </div>

            {/* Section: Computed Fields */}
            <div className="bg-white rounded-xl p-5 border border-slate-200">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600"><Icons.lightning className="w-5 h-5" /></div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">{L.labels.computedFields}</h2>
                        <p className="text-sm text-slate-500">{L.labels.computedFieldsHint}</p>
                    </div>
                </div>

                {!form.computed || form.computed.length === 0 ? (
                    <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500 mb-4">{L.labels.noComputedFields}</p>
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-pink-600 hover:text-pink-700 hover:bg-pink-50"
                            onClick={() => setForm({ ...form, computed: [{ name: '', expression: '' }] })}
                        >
                            + {L.labels.addComputedField}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {form.computed.map((comp, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <span className="text-slate-400 font-mono text-xs">{L.labels.sqlSelect}</span>
                                <input
                                    type="text"
                                    value={comp.expression}
                                    placeholder="price * quantity"
                                    onChange={(e) => {
                                        const newComp = [...form.computed!];
                                        newComp[idx].expression = e.target.value;
                                        setForm({ ...form, computed: newComp });
                                    }}
                                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono outline-none focus:border-pink-500"
                                />
                                <span className="text-slate-400 text-sm font-semibold">{L.labels.sqlAs}</span>
                                <input
                                    type="text"
                                    value={comp.name}
                                    placeholder="total_amount"
                                    onChange={(e) => {
                                        const newComp = [...form.computed!];
                                        newComp[idx].name = e.target.value;
                                        setForm({ ...form, computed: newComp });
                                    }}
                                    className="w-48 px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold outline-none focus:border-pink-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newComp = form.computed!.filter((_, i) => i !== idx);
                                        setForm({ ...form, computed: newComp });
                                    }}
                                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Icons.close className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-pink-600 hover:text-pink-700 hover:bg-pink-50"
                            onClick={() => setForm({ ...form, computed: [...form.computed!, { name: '', expression: '' }] })}
                        >
                            + {L.labels.addAnotherField}
                        </Button>
                    </div>
                )}
            </div>

            {/* Section: Aggregates */}
            <div className="bg-white rounded-xl p-5 border border-slate-200">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600"><Icons.chart className="w-5 h-5" /></div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">{L.labels.aggregates}</h2>
                        <p className="text-sm text-slate-500">{L.labels.aggregatesHint}</p>
                    </div>
                </div>

                {!form.aggregates || form.aggregates.length === 0 ? (
                    <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500 mb-4">{L.labels.noAggregates}</p>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={() => setForm({ ...form, aggregates: [{ function: 'COUNT', column: '*' }] })}
                        >
                            + {L.labels.addAggregate}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {form.aggregates.map((agg, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <div className="w-24">
                                    <Select
                                        value={agg.function}
                                        onChange={(e) => {
                                            const newAggs = [...form.aggregates!];
                                            newAggs[idx].function = e.target.value as 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX';
                                            setForm({ ...form, aggregates: newAggs });
                                        }}
                                        className="font-semibold"
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
                                <span className="text-slate-400">{C.pagination.of}</span>
                                <div className="flex-1">
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
                                            { label: `${C.symbol.asterisk} ${C.symbol.parenthesisOpen}${C.table.selectAll}${C.symbol.parenthesisClose}`, value: '*' },
                                            ...columns.map(c => ({ label: c.name, value: c.name }))
                                        ]}
                                    />
                                </div>
                                <span className="text-slate-400">{L.messages.relations.as}</span>
                                <input
                                    type="text"
                                    value={agg.alias || ''}
                                    placeholder={`${agg.column}_${agg.function}`.toLowerCase()}
                                    onChange={(e) => {
                                        const newAggs = [...form.aggregates!];
                                        newAggs[idx].alias = e.target.value;
                                        setForm({ ...form, aggregates: newAggs });
                                    }}
                                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-500 w-32"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newAggs = form.aggregates!.filter((_, i) => i !== idx);
                                        setForm({ ...form, aggregates: newAggs });
                                    }}
                                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Icons.close className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setForm({ ...form, aggregates: [...form.aggregates!, { function: 'COUNT', column: '*' }] })}
                            className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                        >
                            + {L.labels.addAnotherAggregate}
                        </Button>
                    </div>
                )}
            </div>

            {/* Section: Relations (Joins) */}
            <div className="bg-white rounded-xl p-5 border border-slate-200">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600"><Icons.link className="w-5 h-5" /></div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">{L.labels.relationsJoins}</h2>
                        <p className="text-sm text-slate-500">{L.labels.relationsJoinsHint}</p>
                    </div>
                </div>

                {!form.joins || form.joins.length === 0 ? (
                    <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500 mb-4">{L.labels.noRelationsDefined}</p>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={() => setForm({ ...form, joins: [{ table: availableSources[0]?.tableName || '', alias: '', type: 'LEFT', on: ['', 'id'] }] })}
                            disabled={availableSources.length === 0}
                        >
                            + {L.labels.addRelation}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {form.joins.map((join, idx) => {
                            const targetSource = availableSources.find(s => s.tableName === join.table);
                            const targetColumns = targetSource?.schema?.columns || [];

                            return (
                                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                                    <div className="flex gap-4">
                                        <div className="w-32">
                                            <label className="text-xs font-semibold text-slate-500 block mb-1">{C.table.type}</label>
                                            <div className="w-full">
                                                <Select
                                                    value={join.type}
                                                    onChange={(e) => {
                                                        const newJoins = [...form.joins!];
                                                        newJoins[idx].type = e.target.value as 'LEFT' | 'INNER';
                                                        setForm({ ...form, joins: newJoins });
                                                    }}
                                                    size="sm"
                                                    fullWidth={true}
                                                    className="font-semibold"
                                                    options={[
                                                        { label: 'LEFT JOIN', value: 'LEFT' },
                                                        { label: 'INNER JOIN', value: 'INNER' }
                                                    ]}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs font-semibold text-slate-500 block mb-1">{L.labels.targetTable}</label>
                                            <div className="w-full">
                                                <Select
                                                    value={join.table}
                                                    onChange={(e) => {
                                                        const newJoins = [...form.joins!];
                                                        newJoins[idx].table = e.target.value;
                                                        const newTargetSource = availableSources.find(s => s.tableName === e.target.value);
                                                        const firstTargetCol = newTargetSource?.schema?.columns[0]?.name || 'id';
                                                        newJoins[idx].on = [newJoins[idx].on[0], firstTargetCol];
                                                        setForm({ ...form, joins: newJoins });
                                                    }}
                                                    size="sm"
                                                    fullWidth={true}
                                                    options={availableSources.map(s => ({ label: `${s.name} (${s.tableName})`, value: s.tableName }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="w-48">
                                            <label className="text-xs font-semibold text-slate-500 block mb-1">{L.labels.aliasOptional}</label>
                                            <input
                                                type="text"
                                                value={join.alias}
                                                placeholder={join.table}
                                                onChange={(e) => {
                                                    const newJoins = [...form.joins!];
                                                    newJoins[idx].alias = e.target.value;
                                                    setForm({ ...form, joins: newJoins });
                                                }}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-transparent mb-1">{C.table.actions}</label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newJoins = form.joins!.filter((_, i) => i !== idx);
                                                    setForm({ ...form, joins: newJoins });
                                                }}
                                                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                            >
                                                <Icons.delete className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100">
                                        <span className="text-xs font-semibold text-slate-400">{L.labels.onCondition}</span>
                                        <div className="flex items-center gap-2 flex-1">
                                            <div className="flex-1">
                                                <Select
                                                    value={join.on[0]}
                                                    onChange={(e) => {
                                                        const newJoins = [...form.joins!];
                                                        newJoins[idx].on[0] = e.target.value;
                                                        setForm({ ...form, joins: newJoins });
                                                    }}
                                                    size="sm"
                                                    fullWidth={true}
                                                    options={[
                                                        { label: L.labels.selectSourceColumn || 'Select Column', value: '' },
                                                        ...columns.map(c => ({ label: `${dataSource.tableName}.${c.name}`, value: c.name }))
                                                    ]}
                                                />
                                            </div>
                                            <span className="font-bold text-slate-400">{C.symbol.equals}</span>
                                            <div className="flex-1">
                                                <Select
                                                    value={join.on[1]}
                                                    onChange={(e) => {
                                                        const newJoins = [...form.joins!];
                                                        newJoins[idx].on[1] = e.target.value;
                                                        setForm({ ...form, joins: newJoins });
                                                    }}
                                                    size="sm"
                                                    fullWidth={true}
                                                    options={[
                                                        { label: L.labels.selectTargetColumn || 'Select Column', value: '' },
                                                        ...targetColumns.map(c => ({ label: `${join.alias || join.table}.${c.name}`, value: c.name }))
                                                    ]}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setForm({ ...form, joins: [...form.joins!, { table: availableSources[0]?.tableName || '', alias: '', type: 'LEFT', on: ['', 'id'] }] })}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                            + {L.labels.addAnotherRelation}
                        </Button>
                    </div>
                )}
            </div>

            {/* Section: Default Filters */}
            <div className="bg-white rounded-xl p-5 shadow-sm shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600"><Icons.search className="w-5 h-5" /></div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{L.labels.defaultFilters}</h2>
                        <p className="text-sm text-slate-500">{L.labels.defaultFiltersHint}</p>
                    </div>
                </div>

                {!form.filters || form.filters.length === 0 ? (
                    <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <p className="text-slate-500 mb-4">{L.labels.noDefaultFilters}</p>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={() => setForm({ ...form, filters: [{ field: columns[0]?.name || '', operator: 'eq', value: '' }] })}
                        >
                            + {L.labels.addFilter}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {form.filters.map((filter, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                {idx > 0 && <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">AND</div>}
                                <div className="flex-1 flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                    <div className="w-48">
                                        <Select
                                            value={filter.field}
                                            onChange={(e) => {
                                                const newFilters = [...form.filters!];
                                                newFilters[idx].field = e.target.value;
                                                setForm({ ...form, filters: newFilters });
                                            }}
                                            size="sm"
                                            fullWidth={true}
                                            options={[
                                                { label: L.labels.selectField || 'Select Field', value: '' },
                                                ...columns.map(c => ({ label: c.name, value: c.name }))
                                            ]}
                                        />
                                    </div>

                                    <div className="w-40">
                                        <Select
                                            value={filter.operator}
                                            onChange={(e) => {
                                                const newFilters = [...form.filters!];
                                                newFilters[idx].operator = e.target.value;
                                                setForm({ ...form, filters: newFilters });
                                            }}
                                            size="sm"
                                            fullWidth={true}
                                            options={[
                                                { label: 'Equals (=)', value: 'eq' },
                                                { label: 'Not Equal (!=)', value: 'neq' },
                                                { label: 'Greater (>)', value: 'gt' },
                                                { label: 'Greater/Eq (>=)', value: 'gte' },
                                                { label: 'Less (<)', value: 'lt' },
                                                { label: 'Less/Eq (<=)', value: 'lte' },
                                                { label: 'Contains (LIKE)', value: 'like' },
                                                { label: 'In List (IN)', value: 'in' },
                                                { label: 'Is Null', value: 'null' },
                                                { label: 'Is Not Null', value: 'notNull' }
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
                                            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                        />
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newFilters = form.filters!.filter((_, i) => i !== idx);
                                            setForm({ ...form, filters: newFilters });
                                        }}
                                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Icons.close className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setForm({ ...form, filters: [...form.filters!, { field: columns[0]?.name || '', operator: 'eq', value: '' }] })}
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        >
                            + {L.labels.addFilter}
                        </Button>
                    </div>
                )}
            </div>

            {/* Section: Config */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600"><Icons.settings className="w-5 h-5" /></div>
                    <h2 className="text-xl font-bold text-slate-800">{L.labels.configuration}</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">{L.labels.defaultSortConfig}</label>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Select
                                    value={form.orderBy}
                                    onChange={(e) => setForm({ ...form, orderBy: e.target.value })}
                                    size="sm"
                                    fullWidth={true}
                                    options={columns.map(c => ({ label: c.name, value: c.name }))}
                                />
                            </div>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, orderDirection: 'ASC' })}
                                    className={`px-3 rounded-lg text-xs font-bold transition-all ${form.orderDirection === 'ASC' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}
                                >
                                    ASC
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, orderDirection: 'DESC' })}
                                    className={`px-3 rounded-lg text-xs font-bold transition-all ${form.orderDirection === 'DESC' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}
                                >
                                    DESC
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">{L.labels.limitPerPage}</label>
                        <input
                            type="number"
                            min={1}
                            max={defaults.dataSources.resourceForm.maxLimit}
                            value={form.limit}
                            onChange={(e) => setForm({ ...form, limit: parseInt(e.target.value) || defaults.dataSources.resourceForm.defaultLimit })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                        />
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100">
                    <label className={`
                        flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer
                        ${form.isPublic
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }
                    `}>
                        <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${form.isPublic ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-300'}`}>
                            {form.isPublic && <Icons.check className="w-4 h-4" />}
                        </div>
                        <input
                            type="checkbox"
                            checked={form.isPublic}
                            onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                            className="hidden"
                        />
                        <div>
                            <span className={`block font-bold text-lg ${form.isPublic ? 'text-amber-800' : 'text-slate-800'}`}>
                                {L.labels.publicAccess}
                            </span>
                            <p className="text-sm text-slate-500 mt-1">
                                {form.isPublic
                                    ? `⚠️ ${L.labels.publicAccessWarning}`
                                    : `🔒 ${L.labels.protectedAccessNote}`
                                }
                            </p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="sticky bottom-4 z-10">
                <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200 shadow-2xl flex items-center justify-between">
                    <Button type="button" variant="ghost" onClick={() => router.back()} className="text-slate-500 hover:text-slate-800">
                        {C.actions.cancel}
                    </Button>
                    <Button type="submit" size="lg" isLoading={submitting} className="px-8 shadow-lg shadow-primary/20">
                        {resource ? C.actions.saveChanges : L.buttons.createResource}
                    </Button>
                </div>
            </div>
            <div className="h-4"></div>
        </form >
    );
};
