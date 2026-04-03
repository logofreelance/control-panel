'use client';

// ColumnBuilder - Premium responsive column builder
// Redesigned for better mobile experience and visual appeal
// ✅ PURE DI: Uses useConfig() hook for all config, labels, icons

import { useState } from 'react';
import { Button, Select, Heading, Text, Stack } from '@/components/ui';
import { useConfig } from '@/modules/_core';
import { cn } from '@/lib/utils';
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
    const L = labels.mod.databaseSchema;

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
            <Stack direction="row" justify="between" align="center" className="px-2">
                <Stack direction="row" align="center" gap={3}>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {columns.length}
                    </div>
                    <div>
                        <Heading level={5}>{L.forms.definedColumns}</Heading>
                        <Text variant="muted" className="text-xs hidden sm:block">{L.forms.configureSchemaStructure}</Text>
                    </div>
                </Stack>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={addColumn}
                    className="bg-primary/10 text-primary hover:bg-primary/20 border-transparent transition-colors"
                >
                    <span className="mr-2 text-lg font-bold">+</span> {L.forms.addColumn}
                </Button>
            </Stack>

            {columns.length === 0 ? (
                <div className="text-center py-12 bg-card border-2 border-dashed border-border rounded-3xl group hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer" onClick={addColumn}>
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icons.sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <Heading level={5}>{L.forms.startBuildingSchema}</Heading>
                    <Text variant="muted" className="mt-1 mb-4">{L.forms.addColumnsToDefine}</Text>
                    <Button type="button" size="sm" className="bg-card text-primary border border-border">
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
                                    "relative bg-card rounded-xl border transition-all duration-200 group",
                                    isFocused
                                        ? 'border-primary z-10'
                                        : 'border-border hover:border-primary/50'
                                )}
                                onFocus={() => setFocusedIndex(index)}
                                onBlur={(e) => {
                                    if (!e.currentTarget.contains(e.relatedTarget)) {
                                        setFocusedIndex(null);
                                    }
                                }}
                            >
                                {/* Drag Handle (Desktop) */}
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-gradient-to-b from-primary/0 via-primary/0 to-primary/0 group-hover:via-primary/20 transition-all"></div>

                                <div className="p-4 sm:p-5">
                                    <div className="flex flex-col md:flex-row gap-5 items-start">

                                        {/* Icon & Controls */}
                                        <Stack direction="row" align="center" gap={3} className="w-full md:w-auto justify-between md:justify-start">
                                            <Stack direction="row" align="center" gap={3}>
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300",
                                                    isFocused
                                                        ? 'bg-primary text-primary-foreground border-primary rotate-3'
                                                        : 'bg-card text-muted-foreground border-border group-hover:border-primary/50 group-hover:text-primary'
                                                )}>
                                                    {typeInfo?.Icon ? <typeInfo.Icon className="w-5 h-5" /> : <Icons.fileText className="w-5 h-5" />}
                                                </div>
                                                <div className="md:hidden">
                                                    <Heading level={5}>{col.name || L.forms.untitledColumn}</Heading>
                                                    <Text variant="muted" className="text-xs">{typeInfo?.label || L.forms.unknownType}</Text>
                                                </div>
                                            </Stack>

                                            {/* Mobile Actions */}
                                            <div className="flex md:hidden items-center gap-1">
                                                <button type="button" onClick={() => moveColumn(index, 'up')} disabled={index === 0} className="p-2 text-muted-foreground hover:text-primary"><Icons.chevronUp className="w-4 h-4" /></button>
                                                <button type="button" onClick={() => moveColumn(index, 'down')} disabled={index === columns.length - 1} className="p-2 text-muted-foreground hover:text-primary"><Icons.chevronDown className="w-4 h-4" /></button>
                                                <button type="button" onClick={() => removeColumn(index)} className="p-2 text-red-400 hover:text-red-600">
                                                    <Icons.delete className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </Stack>

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
                                                        className="w-full pl-3 pr-3 py-2.5 rounded-xl border border-border bg-muted/50 font-mono text-sm font-medium focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
                                                    />
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-muted-foreground">
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
                                                        {typeInfo?.Icon && <typeInfo.Icon className="w-4 h-4 text-muted-foreground" />}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Toggles */}
                                            <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-3 self-center">
                                                <label className={cn(
                                                    "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer text-xs font-bold uppercase tracking-wider select-none",
                                                    col.required
                                                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                                                        : 'bg-card border-border text-muted-foreground hover:border-border'
                                                )}>
                                                    <input
                                                        type="checkbox"
                                                        checked={col.required || false}
                                                        onChange={(e) => updateColumn(index, 'required', e.target.checked)}
                                                        className="hidden"
                                                    />
                                                    <span>{L.forms.required}</span>
                                                </label>

                                                <label className={cn(
                                                    "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer text-xs font-bold uppercase tracking-wider select-none",
                                                    col.unique
                                                        ? 'bg-purple-50 border-purple-200 text-purple-700'
                                                        : 'bg-card border-border text-muted-foreground hover:border-border'
                                                )}>
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
                                                <button type="button" onClick={() => moveColumn(index, 'up')} disabled={index === 0} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-primary rounded-lg hover:bg-muted disabled:opacity-30"><Icons.chevronUp className="w-4 h-4" /></button>
                                                <button type="button" onClick={() => moveColumn(index, 'down')} disabled={index === columns.length - 1} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-primary rounded-lg hover:bg-muted disabled:opacity-30"><Icons.chevronDown className="w-4 h-4" /></button>
                                            </div>
                                            <div className="w-px h-8 bg-border mx-1"></div>
                                            <button
                                                type="button"
                                                onClick={() => removeColumn(index)}
                                                className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                            >
                                                <Icons.delete className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Configuration Area */}
                                    {(typeInfo?.requiresValues || typeInfo?.requiresTarget || col.type === 'string' || col.type === 'slug') && (
                                        <div className="mt-4 pt-4 border-t border-border pl-0 md:pl-[4.25rem]">
                                            <div className="flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-top-1">
                                                {/* Arrow Pointer */}
                                                <div className="hidden md:block absolute left-[3.5rem] top-[5.5rem] w-4 h-4 border-l border-b border-border -rotate-45 bg-card"></div>

                                                {/* Enum Values */}
                                                {typeInfo?.requiresValues && (
                                                    <div className="flex-1 min-w-[200px]">
                                                        <Text variant="detail" className="mb-1.5 block">{L.forms.allowedValues}</Text>
                                                        <input
                                                            type="text"
                                                            value={(col.values || []).join(', ')}
                                                            onChange={(e) => updateColumn(index, 'values', e.target.value.split(',').map(v => v.trim()).filter(Boolean))}
                                                            placeholder="pending, active, suspended"
                                                            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                        />
                                                    </div>
                                                )}

                                                {/* Relation Target */}
                                                {typeInfo?.requiresTarget && (
                                                    <div className="flex-1 min-w-[200px]">
                                                        <Text variant="detail" className="mb-1.5 block">{L.forms.targetTable}</Text>
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
                                                        <Text variant="detail" className="mb-1.5 block">{L.forms.maxLength}</Text>
                                                        <input
                                                            type="number"
                                                            value={col.length || 255}
                                                            onChange={(e) => updateColumn(index, 'length', parseInt(e.target.value) || 255)}
                                                            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                        />
                                                    </div>
                                                )}

                                                {/* Generic Hints */}
                                                <Text variant="muted" className="text-xs italic">
                                                    {col.type === 'slug' && L.forms.slugHint}
                                                    {col.type === 'string' && L.forms.stringHint}
                                                    {col.type === 'relation' && L.forms.relationHint}
                                                </Text>
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
