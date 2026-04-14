'use client';

/**
 * ColumnBuilder - Flat Luxury UI Refactor
 * Defined columns for database schema with consistent design system
 */

import { useState } from 'react';
import { 
    Button, 
    Input, 
    Card, 
    CardContent, 
    Select, 
    Checkbox, 
    Label, 
    Badge,
    Field,
    FieldLabel
} from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { useConfig } from '@/modules/_core';
import { cn } from '@/lib/utils';
import { COLUMN_TYPES } from '../registry';
import { ColumnDefinition } from '../types';

interface ColumnBuilderProps {
    columns: ColumnDefinition[];
    onChange: (columns: ColumnDefinition[]) => void;
    availableSources?: { label: string; value: string }[];
}

export const ColumnBuilder = ({ columns, onChange, availableSources = [] }: ColumnBuilderProps) => {
    const { icons: Icons, labels } = useConfig();
    const L = labels.mod.databaseSchema;
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
        <div className="space-y-10">

            {columns.length === 0 ? (
                <div 
                    className="text-center py-24 border border-dashed rounded-xl cursor-pointer hover:bg-muted/5 transition-all" 
                    onClick={addColumn}
                >
                    <Icons.sparkles className="size-12 text-muted-foreground/20 mx-auto mb-4" />
                    <TextHeading size="h6" className="mb-2 text-base font-semibold">{L.forms.startBuildingSchema}</TextHeading>
                    <p className="text-sm text-muted-foreground mb-8">{L.forms.addColumnsToDefine}</p>
                    <Button type="button" variant="outline">
                        {L.forms.addFirstColumn}
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    {columns.map((col, index) => {
                        const typeInfo = getTypeInfo(col.type);
                        const isFocused = focusedIndex === index;

                        return (
                            <Card
                                key={index}
                                className={cn(
                                    "group border-none shadow-sm transition-all duration-300 bg-card",
                                    isFocused && "ring-1 ring-primary/30 shadow-md"
                                )}
                                onFocus={() => setFocusedIndex(index)}
                                onBlur={(e) => {
                                    if (!e.currentTarget.contains(e.relatedTarget)) {
                                        setFocusedIndex(null);
                                    }
                                }}
                            >
                                <CardContent className="px-5 py-4">
                                    <div className="flex flex-col md:flex-row gap-x-8 gap-y-4 md:items-start">
                                        <div className="flex items-center justify-between md:flex-col gap-4">
                                        <div className={cn(
                                            "size-12 rounded-xl flex items-center justify-center shrink-0",
                                            isFocused ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                        )}>
                                            {typeInfo?.Icon ? <typeInfo.Icon className="size-6" /> : <Icons.fileText className="size-6" />}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Button size="icon-xs" variant="ghost" onClick={() => moveColumn(index, 'up')} disabled={index === 0}>
                                                <Icons.chevronUp className="size-4" />
                                            </Button>
                                            <Button size="icon-xs" variant="ghost" onClick={() => moveColumn(index, 'down')} disabled={index === columns.length - 1}>
                                                <Icons.chevronDown className="size-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-2">
                                            <div className="md:col-span-4">
                                                <Input
                                                    label="Column Name"
                                                    value={col.name}
                                                    onChange={(e) => updateColumn(index, 'name', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                    placeholder="e.g. user_id"
                                                />
                                            </div>

                                            <Field className="md:col-span-4">
                                                <FieldLabel>Data Type</FieldLabel>
                                                <Select
                                                    value={col.type}
                                                    onChange={(e) => updateColumn(index, 'type', e.target.value)}
                                                    fullWidth
                                                    options={COLUMN_TYPES.map(t => ({ label: t.label, value: t.value }))}
                                                />
                                            </Field>

                                            <div className="md:col-span-4 flex items-end gap-6 pb-2.5">
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`required-${index}`}
                                                        checked={!!col.required}
                                                        onCheckedChange={(val: boolean) => updateColumn(index, 'required', val)}
                                                    />
                                                    <Label htmlFor={`required-${index}`} className="text-sm font-medium cursor-pointer">REQUIRED</Label>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`unique-${index}`}
                                                        checked={!!col.unique}
                                                        onCheckedChange={(val: boolean) => updateColumn(index, 'unique', val)}
                                                    />
                                                    <Label htmlFor={`unique-${index}`} className="text-sm font-medium cursor-pointer">UNIQUE</Label>
                                                </div>
                                            </div>
                                        </div>

                                        {(typeInfo?.requiresValues || typeInfo?.requiresTarget || col.type === 'string') && (
                                            <div className="pt-0 space-y-2">
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-2">
                                                    {typeInfo?.requiresValues && (
                                                        <div className="md:col-span-8">
                                                            <Input
                                                                label={L.forms.allowedValues}
                                                                value={(col.values || []).join(', ')}
                                                                onChange={(e) => updateColumn(index, 'values', e.target.value.split(',').map(v => v.trim()).filter(Boolean))}
                                                                placeholder="e.g. active, pending, archive"
                                                            />
                                                        </div>
                                                    )}

                                                    {typeInfo?.requiresTarget && (
                                                        <div className="md:col-span-4">
                                                            <Field>
                                                                <FieldLabel>{L.forms.targetTable}</FieldLabel>
                                                                <Select
                                                                    value={col.target || ''}
                                                                    onChange={(e) => updateColumn(index, 'target', e.target.value)}
                                                                    fullWidth
                                                                    options={[
                                                                        { label: 'Select target table...', value: '' },
                                                                        ...availableSources.map(s => ({ label: s.label, value: s.value }))
                                                                    ]}
                                                                />
                                                            </Field>
                                                        </div>
                                                    )}

                                                    {col.type === 'string' && (
                                                        <div className="md:col-span-2">
                                                            <Input
                                                                label="Length"
                                                                type="number"
                                                                value={col.length || 255}
                                                                onChange={(e) => updateColumn(index, 'length', parseInt(e.target.value) || 255)}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-2 flex items-center justify-between gap-4">
                                    <div className="px-1">
                                        <p className="text-xs text-muted-foreground/60 italic">
                                            {col.type === 'slug' && L.forms.slugHint}
                                            {col.type === 'string' && L.forms.stringHint}
                                            {col.type === 'relation' && L.forms.relationHint}
                                        </p>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                        onClick={() => removeColumn(index)}
                                    >
                                        <Icons.trash className="size-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                <div className="pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 border-dashed hover:border-solid transition-all"
                        onClick={addColumn}
                    >
                        <Icons.plus className="size-5 sm:mr-2" />
                        <span className="hidden sm:inline">{L.forms.addColumn}</span>
                    </Button>
                </div>
                </div>
            )}
        </div>
    );
};

