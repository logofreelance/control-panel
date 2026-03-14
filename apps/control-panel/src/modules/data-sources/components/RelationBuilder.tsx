'use client';

// RelationBuilder - Component for managing data source relations
// Pure UI component - all data operations via useRelations composable
// ✅ PURE DI: Uses useConfig() hook for all config, labels, icons

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@cp/ui';
import { ConfirmDialog, useConfig } from '@/modules/_core';
import { useRelations, type Relation } from '../composables';
import { RELATION_TYPES } from '../registry';

interface RelationBuilderProps {
    dataSourceId: number;
    dataSourceName: string;
    onRelationsChange?: () => void;
}

export const RelationBuilder = ({ dataSourceId, dataSourceName, onRelationsChange }: RelationBuilderProps) => {
    // ✅ Pure DI: Get all dependencies from context
    const { labels, icons: Icons } = useConfig();
    const router = useRouter();
    const L = labels.mod.dataSources;
    const C = labels.common;

    // All data operations from composable
    const {
        relations,
        loading,
        deleteRelation,
    } = useRelations(dataSourceId);

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
            <div className="p-6 text-center text-slate-400">
                <div className="animate-spin w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full mx-auto"></div>
                <p className="mt-2 text-sm">{L.messages.relations.loadingRelations}</p>
            </div>
        );
    }

    // Prepare options for Select removed

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icons.link className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-bold text-slate-800">{L.messages.relations.title}</h3>
                    <Badge variant="slate">{relations.length}</Badge>
                </div>
            </div>

            {/* Relations List */}
            {relations.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <Icons.linkOff className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">{L.messages.relations.noRelations}</p>
                    <p className="text-slate-400 text-sm mt-1">{L.messages.relations.addToLink}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {relations.map(rel => {
                        return (
                            <div
                                key={rel.id}
                                className="group bg-white rounded-xl border border-slate-100/75 hover:border-slate-300 transition-all duration-200 overflow-hidden"
                            >
                                <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer" onClick={() => { /* Expand logic if needed */ }}>
                                    {/* Type Badge & Icon */}
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className={`
                                            w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl shrink-0
                                            ${rel.type === 'belongs_to' ? 'bg-blue-50 text-blue-600' : ''}
                                            ${rel.type === 'has_one' ? 'bg-emerald-50 text-emerald-600' : ''}
                                            ${rel.type === 'has_many' ? 'bg-amber-50 text-amber-600' : ''}
                                            ${rel.type === 'many_to_many' ? 'bg-purple-50 text-purple-600' : ''}
                                        `}>
                                            {getTypeIcon(rel.type)}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base mb-1">
                                                <span className="font-semibold text-slate-700 truncate max-w-[100px] sm:max-w-none">{dataSourceName}</span>
                                                <Icons.arrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                                                <span className="font-bold text-indigo-700 truncate">{rel.target?.name || C.status.unknown}</span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                <span className="hidden sm:inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                                    <Icons.info className="w-3 h-3 opacity-50" />
                                                    {getTypeLabel(rel.type)}
                                                </span>
                                                <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 font-mono" title="Foreign Key">
                                                    <Icons.key className="w-3 h-3 opacity-50" />
                                                    {rel.localKey}
                                                </span>
                                                {rel.alias && (
                                                    <span className="flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 text-indigo-700 font-mono font-medium">
                                                        <Icons.code className="w-3 h-3 opacity-50" />
                                                        {rel.alias}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {/* Actions */}
                                    <div className="flex items-center gap-1 justify-end w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-50">
                                        <button
                                            className="p-2 bg-white border border-slate-100 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors shadow-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (rel.localKey) {
                                                    router.push(`/data-sources/${dataSourceId}/relations/${rel.localKey}/edit`);
                                                }
                                            }}
                                        >
                                            <Icons.edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            className="p-2 bg-white border border-slate-100 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors shadow-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteTarget(rel);
                                            }}
                                        >
                                            <Icons.delete className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
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
                variant="danger"
            />
        </div>
    );
};

export default RelationBuilder;
