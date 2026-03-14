'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@cp/ui';
import { useConfig } from '@/modules/_core';
import { useRelations, type Relation } from '../composables';
import { RELATION_TYPES } from '../registry';

interface EditRelationFormProps {
    dataSourceId: number;
    relationName: string; // This is the localKey / column name
}

export const EditRelationForm = ({ dataSourceId, relationName }: EditRelationFormProps) => {
    const router = useRouter();
    const { labels, icons: Icons } = useConfig();
    const L = labels.mod.dataSources;
    const C = labels.common;

    const { relations, loading, updateRelation } = useRelations(dataSourceId);

    // Find the relation being edited
    const [relation, setRelation] = useState<Relation | null>(null);
    const [form, setForm] = useState({
        type: 'belongs_to' as Relation['type'],
        alias: '',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && relations.length > 0) {
            // Find by localKey (column name)
            const found = relations.find(r => r.localKey === relationName);
            if (found) {
                setRelation(found);
                setForm({
                    type: found.type,
                    alias: found.alias,
                });
            } else {
                // Not found, maybe redirect or show error
                // console.warn('Relation not found', relationName);
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
        return <div className="p-12 text-center animate-pulse">{L.messages.relations.loadingRelations || "Loading relation details..."}</div>;
    }

    if (!relation) {
        return (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <Icons.warning className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700">{C.messages.notFound || "Relation Not Found"}</h3>
                <p className="text-slate-500 mb-6">{C.messages.notFoundDesc || "Could not find relation for column:"} <code className="font-mono bg-slate-200 px-1 rounded">{relationName}</code></p>
                <Button onClick={() => router.back()}>{C.actions.goBack || "Go Back"}</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                        <Icons.edit className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{L.titles.editResource || "Edit Relation"}</h1>
                        <p className="text-slate-500 mt-1 text-lg">{L.messages.relations.updateMetadata || "Update metadata for"} <strong className="text-slate-800">{relation.target?.name}</strong></p>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column: Locked Info */}
                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm h-fit opacity-80">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500"><Icons.lock className="w-5 h-5" /></div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{L.messages.relations.targetConfig || "Target Configuration"}</h2>
                            <p className="text-sm text-slate-500">{L.messages.relations.fixedProps || "Fixed physical properties"}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <label className="text-xs font-bold uppercase text-slate-400 block mb-1">{L.messages.relations.targetTable || "Target Table"}</label>
                            <div className="flex items-center gap-3">
                                <Icons.table className="w-5 h-5 text-indigo-500" />
                                <div>
                                    <div className="font-bold text-slate-700">{relation.target?.name}</div>
                                    <div className="text-xs font-mono text-slate-400">{relation.target?.tableName}</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <label className="text-xs font-bold uppercase text-slate-400 block mb-1">{L.messages.relations.fkColumn || "Foreign Key Column"}</label>
                            <div className="flex items-center gap-3">
                                <Icons.key className="w-5 h-5 text-amber-500" />
                                <div className="font-mono font-bold text-slate-700">{relation.localKey}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Editable Info */}
                <div className="space-y-6">
                    {/* Relation Type */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Icons.settings className="w-5 h-5" /></div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">{L.messages.relations.relationType}</h2>
                                <p className="text-sm text-slate-500">{L.messages.relations.defineRel || "Define how the tables relate"}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {RELATION_TYPES.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, type: type.value as Relation['type'] }))}
                                    className={`
                                        p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden flex items-start gap-4
                                        ${form.type === type.value
                                            ? 'border-indigo-500 bg-indigo-50/30'
                                            : 'border-slate-100 hover:border-slate-200 bg-white'}
                                    `}
                                >
                                    <div className={`text-2xl p-2 rounded-lg ${form.type === type.value ? 'bg-indigo-100' : 'bg-slate-50'}`}>
                                        {type.icon}
                                    </div>
                                    <div>
                                        <span className={`font-bold block ${form.type === type.value ? 'text-indigo-900' : 'text-slate-700'}`}>
                                            {type.label}
                                        </span>
                                        <span className="text-xs text-slate-500 leading-tight mt-1 block">{type.desc}</span>
                                    </div>
                                    {form.type === type.value && <div className="ml-auto text-indigo-500"><Icons.check className="w-5 h-5" /></div>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Alias Config */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600"><Icons.edit className="w-5 h-5" /></div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">{L.messages.relations.aliasOptional}</h2>
                                <p className="text-sm text-slate-500">{L.messages.relations.customName || "Custom name for API responses"}</p>
                            </div>
                        </div>

                        <div>
                            <input
                                type="text"
                                value={form.alias}
                                onChange={(e) => setForm(prev => ({ ...prev, alias: e.target.value }))}
                                placeholder={L.messages.relations.aliasPlaceholder}
                                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all font-medium"
                            />
                            <p className="text-xs text-slate-400 mt-3 flex items-center gap-2">
                                <Icons.info className="w-4 h-4" />
                                {L.messages.relations.aliasDescription}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="sticky bottom-4 z-10">
                <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200 shadow-2xl flex items-center justify-between max-w-4xl mx-auto">
                    <Button variant="ghost" onClick={() => router.back()} className="text-slate-500 hover:text-slate-800">
                        {C.actions.cancel}
                    </Button>
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleSubmit}
                            isLoading={submitting}
                            size="lg"
                            className="px-8 shadow-lg shadow-indigo-500/20"
                        >
                            {C.actions.saveChanges || "Save Changes"}
                        </Button>
                    </div>
                </div>
            </div>
            <div className="h-8"></div>
        </div>
    );
};
