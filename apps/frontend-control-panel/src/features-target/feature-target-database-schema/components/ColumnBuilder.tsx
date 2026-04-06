'use client';

/**
 * ColumnBuilder - Flat Luxury UI Refactor
 * Defined columns for database schema with consistent design system
 */

import { useState } from 'react';
import { Button, Select, Badge } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { useConfig } from '@/modules/_core';
import { cn } from '@/lib/utils';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { COLUMN_TYPES } from '../registry';
import { ColumnDefinition } from '../types';

const L = MODULE_LABELS.databaseSchema;

interface ColumnBuilderProps {
    columns: ColumnDefinition[];
    onChange: (columns: ColumnDefinition[]) => void;
    availableSources?: { label: string; value: string }[];
}

export const ColumnBuilder = ({ columns, onChange, availableSources = [] }: ColumnBuilderProps) => {
    const { icons: Icons } = useConfig();
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    const addColumn = () => {
        onChange([...columns, { name: '', type: 'string' }]);
    };

    const updateColumn = (index: number, field: keyof ColumnDefinition, value: ColumnDefinition[keyof ColumnDefinition]) => {
        const updated = [...columns];
        updated[index] = { ...updated[index], [field]: value };

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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/20">
                        {columns.length}
                    </div>
                    <div className="space-y-0.5">
                        <TextHeading size="h6" className="text-sm font-semibold lowercase">{L.forms.definedColumns}</TextHeading>
                        <p className="text-[11px] text-muted-foreground lowercase hidden sm:block">{L.forms.configureSchemaStructure.toLowerCase()}</p>
                    </div>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addColumn}
                    className="h-9 px-4 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 border-none transition-all lowercase font-bold"
                >
                    <Icons.plus className="size-3.5 mr-2" /> {L.forms.addColumn}
                </Button>
            </div>

            {columns.length === 0 ? (
                <div className="text-center py-16 bg-muted/20 border border-dashed border-border/40 rounded-3xl group hover:bg-primary/5 transition-all cursor-pointer" onClick={addColumn}>
                    <div className="size-16 rounded-2xl bg-muted/40 mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icons.sparkles className="size-8 text-muted-foreground/30 group-hover:text-primary/40 transition-colors" />
                    </div>
                    <TextHeading size="h6" className="mb-1 lowercase">{L.forms.startBuildingSchema}</TextHeading>
                    <p className="text-xs text-muted-foreground lowercase mb-6">{L.forms.addColumnsToDefine}</p>
                    <Button type="button" variant="outline" size="sm" className="h-9 rounded-xl border-border/40 lowercase">
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
                                className={cn(
                                    "relative bg-background/60 rounded-2xl transition-all duration-300 border-none ring-1 ring-border/5 group overflow-hidden",
                                    isFocused ? 'ring-primary/40 bg-background shadow-xl scale-[1.01] z-20' : 'hover:ring-primary/10'
                                )}
                                onFocus={() => setFocusedIndex(index)}
                                onBlur={(e) => {
                                    if (!e.currentTarget.contains(e.relatedTarget)) {
                                        setFocusedIndex(null);
                                    }
                                }}
                            >
                                <div className="p-4 md:p-5">
                                    <div className="flex flex-col md:flex-row gap-6 md:items-center">
                                        {/* Type Icon & Mobile Header */}
                                        <div className="flex border-b border-border/5 items-center justify-between pb-px md:justify-start gap-4">
                                            <div className={cn(
                                                "size-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                                                isFocused
                                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 rotate-12'
                                                    : 'bg-muted/40 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-hover:rotate-6'
                                            )}>
                                                {typeInfo?.Icon ? <typeInfo.Icon className="size-6" /> : <Icons.fileText className="size-6" />}
                                            </div>
                                            
                                            <div className="md:hidden flex-1 min-w-0">
                                                <TextHeading size="h6" className={cn(
                                                    "text-sm font-bold truncate lowercase",
                                                    isFocused ? "text-primary" : ""
                                                )}>
                                                    {col.name || L.forms.untitledColumn}
                                                </TextHeading>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{typeInfo?.label || L.forms.unknownType}</p>
                                            </div>

                                            <div className="flex md:hidden items-center gap-1">
                                                <Button size="icon-xs" variant="ghost" className="rounded-lg h-8 w-8" onClick={(e) => { e.stopPropagation(); moveColumn(index, 'up'); }} disabled={index === 0}>
                                                    <Icons.chevronUp className="size-3.5" />
                                                </Button>
                                                <Button size="icon-xs" variant="ghost" className="rounded-lg h-8 w-8" onClick={(e) => { e.stopPropagation(); moveColumn(index, 'down'); }} disabled={index === columns.length - 1}>
                                                    <Icons.chevronDown className="size-3.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Inputs Grid */}
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                                            {/* Column Name */}
                                            <div className="md:col-span-4 space-y-1">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 px-1">name (sql)</label>
                                                <input
                                                    type="text"
                                                    value={col.name}
                                                    onChange={(e) => updateColumn(index, 'name', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                    placeholder={L.forms.columnName}
                                                    className="w-full h-10 px-4 rounded-xl bg-muted/20 border-none font-mono text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/30 lowercase"
                                                />
                                            </div>

                                            {/* Type Selector */}
                                            <div className="md:col-span-4 space-y-1">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 px-1">data type</label>
                                                <Select
                                                    value={col.type}
                                                    onChange={(e) => updateColumn(index, 'type', e.target.value)}
                                                    size="sm"
                                                    fullWidth
                                                    className="h-10 text-xs font-bold lowercase"
                                                    options={COLUMN_TYPES.map(t => ({ label: t.label, value: t.value }))}
                                                />
                                            </div>

                                            {/* Toggles */}
                                            <div className="md:col-span-4 flex items-end gap-3 pb-px">
                                                <CheckboxToggle
                                                    label="REQUIRED"
                                                    checked={!!col.required}
                                                    onChange={(val) => updateColumn(index, 'required', val)}
                                                    activeClass="bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20"
                                                />
                                                <CheckboxToggle
                                                    label="UNIQUE"
                                                    checked={!!col.unique}
                                                    onChange={(val) => updateColumn(index, 'unique', val)}
                                                    activeClass="bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/20"
                                                />
                                            </div>
                                        </div>

                                        {/* Actions (Desktop) */}
                                        <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex flex-col">
                                                <Button size="icon-xs" variant="ghost" className="h-6 w-6 rounded-md" onClick={() => moveColumn(index, 'up')} disabled={index === 0}>
                                                    <Icons.chevronUp className="size-3" />
                                                </Button>
                                                <Button size="icon-xs" variant="ghost" className="h-6 w-6 rounded-md" onClick={() => moveColumn(index, 'down')} disabled={index === columns.length - 1}>
                                                    <Icons.chevronDown className="size-3" />
                                                </Button>
                                            </div>
                                            <div className="w-px h-10 bg-border/40 mx-2" />
                                            <Button
                                                size="icon-sm"
                                                variant="ghost"
                                                onClick={() => removeColumn(index)}
                                                className="h-10 w-10 rounded-xl hover:bg-rose-500/10 hover:text-rose-600 text-muted-foreground/30 transition-all"
                                            >
                                                <Icons.trash className="size-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Advanced Options */}
                                    {(typeInfo?.requiresValues || typeInfo?.requiresTarget || col.type === 'string' || col.type === 'slug') && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:pl-18 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="flex flex-wrap items-end gap-6 md:pl-18">
                                                {/* Enum Values */}
                                                {typeInfo?.requiresValues && (
                                                    <div className="flex-1 min-w-[240px] space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-1">{L.forms.allowedValues}</label>
                                                        <input
                                                            type="text"
                                                            value={(col.values || []).join(', ')}
                                                            onChange={(e) => updateColumn(index, 'values', e.target.value.split(',').map(v => v.trim()).filter(Boolean))}
                                                            placeholder="pending, active, suspended"
                                                            className="w-full h-10 px-4 rounded-xl bg-muted/20 border-none text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all lowercase"
                                                        />
                                                    </div>
                                                )}

                                                {/* Relation Target */}
                                                {typeInfo?.requiresTarget && (
                                                    <div className="flex-1 min-w-[240px] space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-1">{L.forms.targetTable}</label>
                                                        <Select
                                                            value={col.target || ''}
                                                            onChange={(e) => updateColumn(index, 'target', e.target.value)}
                                                            size="sm"
                                                            fullWidth
                                                            className="h-10 text-xs lowercase"
                                                            options={[
                                                                { label: L.forms.selectTable.toLowerCase() || 'select table', value: '' },
                                                                ...availableSources.map(s => ({ label: s.label.toLowerCase(), value: s.value }))
                                                            ]}
                                                        />
                                                    </div>
                                                )}

                                                {/* String Length */}
                                                {col.type === 'string' && (
                                                    <div className="w-[100px] space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-1">LENGTH</label>
                                                        <input
                                                            type="number"
                                                            value={col.length || 255}
                                                            onChange={(e) => updateColumn(index, 'length', parseInt(e.target.value) || 255)}
                                                            className="w-full h-10 px-4 rounded-xl bg-muted/20 border-none text-xs focus:ring-1 focus:ring-primary/20 outline-none transition-all text-center"
                                                        />
                                                    </div>
                                                )}

                                                {/* Hints */}
                                                <p className="text-[10px] text-muted-foreground/40 italic lowercase pb-3">
                                                    {col.type === 'slug' && L.forms.slugHint.toLowerCase()}
                                                    {col.type === 'string' && L.forms.stringHint.toLowerCase()}
                                                    {col.type === 'relation' && L.forms.relationHint.toLowerCase()}
                                                </p>
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

const CheckboxToggle = ({ label, checked, onChange, activeClass }: { label: string, checked: boolean, onChange: (val: boolean) => void, activeClass: string }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
            "h-10 flex-1 flex items-center justify-center gap-2 rounded-xl border-none transition-all text-[10px] font-black tracking-widest",
            checked ? activeClass : "bg-muted/10 text-muted-foreground/30 hover:bg-muted/20"
        )}
    >
        <div className={cn(
            "size-3.5 rounded border transition-all flex items-center justify-center",
            checked ? "bg-white/20 border-transparent" : "bg-muted border-transparent"
        )}>
            {checked && <Icons.check className="size-2.5 stroke-4" />}
        </div>
        {label}
    </button>
);
