'use client';

// ColumnBuilder - Premium responsive column builder
// Redesigned for better mobile experience and visual appeal
// ✅ PURE DI: Uses useConfig() hook for all config, labels, icons

import { useState } from 'react';
import { Button, Select } from '@cp/ui';
import { useConfig } from '@/modules/_core';
import { ColumnDefinition } from '../types';
import { COLUMN_TYPES } from '../registry';

interface ColumnBuilderProps {
    columns: ColumnDefinition[];
    onChange: (columns: ColumnDefinition[]) => void;
    availableSources?: { label: string; value: string }[];
}

export const ColumnBuilder = ({ columns, onChange, availableSources = [] }: ColumnBuilderProps) => {
    // ✅ Pure DI: Get all dependencies from context
    const { labels, icons: Icons } = useConfig();
    const L = labels.mod.dataSources;

    const addColumn = () => {
        onChange([...columns, { name: '', type: 'string' }]);
    };

    const updateColumn = (index: number, field: keyof ColumnDefinition, value: ColumnDefinition[keyof ColumnDefinition]) => {
        const updated = [...columns];
        updated[index] = { ...updated[index], [field]: value };

        // Clear relation-specific properties when type is changed away from 'relation'
        if (field === 'type' && value !== 'relation' && updated[index].target) {
            delete updated[index].target;
        }

        onChange(updated);
    };

    const removeColumn = (index: number) => {
        onChange(columns.filter((_, i) => i !== index));
    };

    const moveColumn = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= columns.length) return;

        const updated = [...columns];
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        onChange(updated);
    };

    const getTypeInfo = (type: string) => COLUMN_TYPES.find(t => t.value === type);

    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                        {columns.length}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">{L.forms.definedColumns}</h3>
                        <p className="text-xs text-slate-400 hidden sm:block">{L.forms.configureSchemaStructure}</p>
                    </div>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={addColumn}
                    className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-transparent transition-colors"
                >
                    <span className="mr-2 text-lg font-bold">+</span> {L.forms.addColumn}
                </Button>
            </div>

            {columns.length === 0 ? (
                <div className="text-center py-12 bg-white border-2 border-dashed border-slate-200 rounded-3xl group hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5 transition-all cursor-pointer" onClick={addColumn}>
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icons.sparkles className="w-8 h-8 text-indigo-500" />
                    </div>
                    <p className="font-bold text-slate-700 text-lg">{L.forms.startBuildingSchema}</p>
                    <p className="text-sm text-slate-400 mt-1 mb-4">{L.forms.addColumnsToDefine}</p>
                    <Button type="button" size="sm" className="bg-white text-[var(--primary)] border border-slate-200 shadow-sm hover:shadow-md">
                        {L.forms.addFirstColumn}
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {columns.map((col, index) => {
                        const typeInfo = getTypeInfo(col.type);
                        const isFocused = focusedIndex === index;

                        return (
                            <div
                                key={index}
                                className={`
                                    relative bg-white rounded-xl border transition-all duration-200 group
                                    ${isFocused
                                        ? 'border-indigo-300 shadow-md ring-1 ring-indigo-300/50 z-10'
                                        : 'border-slate-200 hover:border-indigo-200 hover:shadow-sm'
                                    }
                                `}
                                onFocus={() => setFocusedIndex(index)}
                                onBlur={(e) => {
                                    if (!e.currentTarget.contains(e.relatedTarget)) {
                                        setFocusedIndex(null);
                                    }
                                }}
                            >
                                {/* Drag Handle (Desktop) */}
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-gradient-to-b from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-hover:via-indigo-500/20 transition-all"></div>

                                <div className="p-4 sm:p-5">
                                    <div className="flex flex-col md:flex-row gap-5 items-start">

                                        {/* Icon & Controls */}
                                        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                                            <div className="flex items-center gap-3">
                                                <div className={`
                                                    w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border
                                                    ${isFocused
                                                        ? 'bg-indigo-600 text-white border-indigo-600 rotate-3'
                                                        : 'bg-white text-slate-600 border-slate-200 group-hover:border-indigo-200 group-hover:text-indigo-600'
                                                    }
                                                    transition-all duration-300
                                                `}>
                                                    {typeInfo?.Icon ? <typeInfo.Icon className="w-5 h-5" /> : <Icons.fileText className="w-5 h-5" />}
                                                </div>
                                                <div className="md:hidden">
                                                    <p className="font-bold text-slate-800 text-sm">{col.name || L.forms.untitledColumn}</p>
                                                    <p className="text-xs text-slate-400">{typeInfo?.label || L.forms.unknownType}</p>
                                                </div>
                                            </div>

                                            {/* Mobile Actions */}
                                            <div className="flex md:hidden items-center gap-1">
                                                <button type="button" onClick={() => moveColumn(index, 'up')} disabled={index === 0} className="p-2 text-slate-400 hover:text-indigo-600"><Icons.chevronUp className="w-4 h-4" /></button>
                                                <button type="button" onClick={() => moveColumn(index, 'down')} disabled={index === columns.length - 1} className="p-2 text-slate-400 hover:text-indigo-600"><Icons.chevronDown className="w-4 h-4" /></button>
                                                <button type="button" onClick={() => removeColumn(index)} className="p-2 text-red-400 hover:text-red-600">
                                                    <Icons.delete className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Inputs Grid */}
                                        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-12 gap-4">

                                            {/* Column Name */}
                                            <div className="md:col-span-4 self-center">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={col.name}
                                                        onChange={(e) => updateColumn(index, 'name', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                        placeholder={L.forms.columnName}
                                                        className="w-full pl-3 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-mono text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                                    />
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-slate-400">
                                                        {L.forms.sqlLabel}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Type Selector */}
                                            <div className="md:col-span-4 self-center">
                                                <div className="relative">
                                                    <Select
                                                        value={col.type}
                                                        onChange={(e) => updateColumn(index, 'type', e.target.value)}
                                                        size="sm"
                                                        fullWidth={true}
                                                        options={COLUMN_TYPES.map(t => ({ label: t.label, value: t.value }))}
                                                        className={typeInfo?.Icon ? "pl-9" : ""}
                                                    />
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        {typeInfo?.Icon && <typeInfo.Icon className="w-4 h-4 text-slate-500" />}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Toggles */}
                                            <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-3 self-center">
                                                <label className={`
                                                    flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer text-xs font-bold uppercase tracking-wider select-none
                                                    ${col.required
                                                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                                                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                                                    }
                                                `}>
                                                    <input
                                                        type="checkbox"
                                                        checked={col.required || false}
                                                        onChange={(e) => updateColumn(index, 'required', e.target.checked)}
                                                        className="hidden"
                                                    />
                                                    <span>{L.forms.required}</span>
                                                </label>

                                                <label className={`
                                                    flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer text-xs font-bold uppercase tracking-wider select-none
                                                    ${col.unique
                                                        ? 'bg-purple-50 border-purple-200 text-purple-700'
                                                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                                                    }
                                                `}>
                                                    <input
                                                        type="checkbox"
                                                        checked={col.unique || false}
                                                        onChange={(e) => updateColumn(index, 'unique', e.target.checked)}
                                                        className="hidden"
                                                    />
                                                    <span>{L.forms.unique}</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Desktop Actions */}
                                        <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                                            <div className="flex flex-col">
                                                <button type="button" onClick={() => moveColumn(index, 'up')} disabled={index === 0} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 disabled:opacity-30"><Icons.chevronUp className="w-4 h-4" /></button>
                                                <button type="button" onClick={() => moveColumn(index, 'down')} disabled={index === columns.length - 1} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 disabled:opacity-30"><Icons.chevronDown className="w-4 h-4" /></button>
                                            </div>
                                            <div className="w-px h-8 bg-slate-100 mx-1"></div>
                                            <button
                                                type="button"
                                                onClick={() => removeColumn(index)}
                                                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                            >
                                                <Icons.delete className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Configuration Area */}
                                    {(typeInfo?.requiresValues || typeInfo?.requiresTarget || col.type === 'string' || col.type === 'slug') && (
                                        <div className="mt-4 pt-4 border-t border-slate-100 pl-0 md:pl-[4.25rem]">
                                            <div className="flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-top-1">
                                                {/* Arrow Pointer */}
                                                <div className="hidden md:block absolute left-[3.5rem] top-[5.5rem] w-4 h-4 border-l border-b border-slate-200 -rotate-45 bg-white"></div>

                                                {/* Enum Values */}
                                                {typeInfo?.requiresValues && (
                                                    <div className="flex-1 min-w-[200px]">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">{L.forms.allowedValues}</label>
                                                        <input
                                                            type="text"
                                                            value={(col.values || []).join(', ')}
                                                            onChange={(e) => updateColumn(index, 'values', e.target.value.split(',').map(v => v.trim()).filter(Boolean))}
                                                            placeholder="pending, active, suspended"
                                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                                        />
                                                    </div>
                                                )}

                                                {/* Relation Target */}
                                                {typeInfo?.requiresTarget && (
                                                    <div className="flex-1 min-w-[200px]">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">{L.forms.targetTable}</label>
                                                        <Select
                                                            value={col.target || ''}
                                                            onChange={(e) => updateColumn(index, 'target', e.target.value)}
                                                            size="sm"
                                                            fullWidth={true}
                                                            options={[
                                                                { label: L.forms.selectTable || 'Select Table', value: '' },
                                                                ...availableSources.map(s => ({ label: s.label, value: s.value }))
                                                            ]}
                                                        />
                                                    </div>
                                                )}

                                                {/* String Length */}
                                                {col.type === 'string' && (
                                                    <div className="w-[120px]">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">{L.forms.maxLength}</label>
                                                        <input
                                                            type="number"
                                                            value={col.length || 255}
                                                            onChange={(e) => updateColumn(index, 'length', parseInt(e.target.value) || 255)}
                                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                                        />
                                                    </div>
                                                )}

                                                {/* Generic Hints */}
                                                <div className="text-xs text-slate-400 italic">
                                                    {col.type === 'slug' && L.forms.slugHint}
                                                    {col.type === 'string' && L.forms.stringHint}
                                                    {col.type === 'relation' && L.forms.relationHint}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
