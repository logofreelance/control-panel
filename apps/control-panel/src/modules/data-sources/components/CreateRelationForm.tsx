'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@cp/ui';
import { useConfig } from '@/modules/_core';
import { useRelations, type Relation, type AddRelationPayload } from '../composables';
import { RELATION_TYPES } from '../registry';
import { Icons } from '@cp/config/client';

interface CreateRelationFormProps {
    dataSourceId: number;
}

export const CreateRelationForm = ({ dataSourceId }: CreateRelationFormProps) => {
    const router = useRouter();
    const { labels } = useConfig();
    const L = labels.mod.dataSources;
    const C = labels.common;

    const {
        targets,
        loading,
        addRelation
    } = useRelations(dataSourceId);

    const [submitting, setSubmitting] = useState(false);
    const [newRelation, setNewRelation] = useState<AddRelationPayload>({
        targetId: 0,
        type: 'belongs_to',
        alias: '',
    });



    // Handle Selection
    const handleSelectTarget = (id: number) => {
        setNewRelation(prev => {
            // If selecting system table (users, id=0), auto-reset to belongs_to
            if (id === 0 && ['has_one', 'has_many'].includes(prev.type)) {
                return { ...prev, targetId: id, type: 'belongs_to' };
            }
            return { ...prev, targetId: id };
        });
    };

    // Submit
    const handleSubmit = async () => {
        setSubmitting(true);
        const success = await addRelation(newRelation);
        setSubmitting(false);

        if (success) {
            router.push(`/data-sources`); // Go back to list
            router.refresh();
        }
    };

    if (loading) {
        return <div className="p-12 text-center animate-pulse">{L.messages.relations.loadingRelations}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                        <Icons.link className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{L.messages.relations.addRelation}</h1>
                        <p className="text-slate-500 mt-1 text-lg">{L.messages.relations.createRelationship}</p>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column: Target Selection */}
                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm h-fit">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600"><Icons.database className="w-5 h-5" /></div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{L.messages.relations.targetTable}</h2>
                            <p className="text-sm text-slate-500">{L.messages.relations.targetTableDesc || "Select the table to connect to"}</p>
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {targets.length === 0 && (
                            <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 font-medium">{L.messages.relations.noTargets || "No available targets found."}</p>
                            </div>
                        )}
                        {targets.map(t => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => handleSelectTarget(t.id)}
                                className={`
                                    w-full group relative p-4 rounded-xl border-2 text-left transition-all duration-200
                                    ${newRelation.targetId === t.id
                                        ? 'bg-indigo-50/50 border-indigo-500 shadow-md ring-1 ring-indigo-500/20'
                                        : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`
                                        w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                                        ${newRelation.targetId === t.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-indigo-500'}
                                    `}>
                                        <Icons.table className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className={`font-bold text-lg ${newRelation.targetId === t.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                                            {t.name}
                                        </div>
                                        <div className="text-xs text-slate-400 font-mono bg-slate-100/50 px-2 py-0.5 rounded w-fit mt-1">
                                            {t.tableName}
                                        </div>
                                    </div>
                                    {newRelation.targetId === t.id && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 bg-white rounded-full p-1 shadow-sm">
                                            <Icons.check className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Column: Configuration */}
                <div className="space-y-6">
                    {/* Relation Type */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Icons.settings className="w-5 h-5" /></div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">{L.messages.relations.relationType}</h2>
                                <p className="text-sm text-slate-500">{L.messages.relations.relationTypeDesc || "Define how the tables relate"}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {RELATION_TYPES.map(type => {
                                // Disable Has One and Has Many when target is users (id=0)
                                const isSystemTarget = newRelation.targetId === 0;
                                const isDisabled = isSystemTarget && ['has_one', 'has_many'].includes(type.value);

                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => !isDisabled && setNewRelation(prev => ({ ...prev, type: type.value as Relation['type'] }))}
                                        disabled={isDisabled}
                                        className={`
                                            p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden flex items-start gap-4
                                            ${isDisabled
                                                ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-100'
                                                : newRelation.type === type.value
                                                    ? 'border-indigo-500 bg-indigo-50/30'
                                                    : 'border-slate-100 hover:border-slate-200 bg-white'}
                                        `}
                                    >
                                        <div className={`text-2xl p-2 rounded-lg ${newRelation.type === type.value && !isDisabled ? 'bg-indigo-100' : 'bg-slate-50'}`}>
                                            {type.icon}
                                        </div>
                                        <div className="flex-1">
                                            <span className={`font-bold block ${newRelation.type === type.value && !isDisabled ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                {type.label}
                                            </span>
                                            <span className="text-xs text-slate-500 leading-tight mt-1 block">{type.desc}</span>
                                            {isDisabled && (
                                                <span className="text-xs text-amber-600 mt-2 block flex items-center gap-1">
                                                    <Icons.alertTriangle className="w-3 h-3" />
                                                    {C.validation?.systemTableRestriction || "Not available for System Tables - use 'Belongs To'"}
                                                </span>
                                            )}
                                        </div>
                                        {newRelation.type === type.value && !isDisabled && <div className="ml-auto text-indigo-500"><Icons.check className="w-5 h-5" /></div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Alias Config */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600"><Icons.edit className="w-5 h-5" /></div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">{L.messages.relations.aliasOptional}</h2>
                                <p className="text-sm text-slate-500">{L.messages.relations.aliasOptionalDesc || "Custom name for API responses"}</p>
                            </div>
                        </div>

                        <div>
                            <input
                                type="text"
                                value={newRelation.alias}
                                onChange={(e) => setNewRelation(prev => ({ ...prev, alias: e.target.value }))}
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
                        <div className="text-sm text-slate-400 hidden sm:block">
                            {newRelation.targetId ? <span className="text-emerald-500 font-bold flex items-center gap-1"><Icons.check className="w-4 h-4" /> {C.status?.readyToLink || "Ready to link"}</span> : (L.messages.relations.selectTarget || "Select a target")}
                        </div>
                        <Button
                            onClick={handleSubmit}
                            isLoading={submitting}
                            disabled={!newRelation.targetId && newRelation.targetId !== 0} // Allow 0
                            size="lg"
                            className="px-8 shadow-lg shadow-indigo-500/20"
                        >
                            {L.messages.relations.addRelation}
                        </Button>
                    </div>
                </div>
            </div>
            <div className="h-8"></div>
        </div>
    );
};

