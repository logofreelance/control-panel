'use client';

// CreateSourceForm - Full page form for creating data sources
// Pure UI component - all data operations via useCreateSource composable
// CreateSchemaForm - Full page form for creating data sources
// Pure UI component - all data operations via useCreateSchema composable
// ✅ PURE DI: Uses useConfig() hook for all config, labels, icons

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Badge, Heading, Text, Stack, Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ColumnBuilder } from './ColumnBuilder';
import { useCreateSchema } from '../composables';
import { useConfig } from '@/modules/_core';
import type { ColumnDefinition } from '../types';

const USER_TABLE_PREFIX = 'usr_';

interface Template {
    id: string;
    icon: React.ReactNode;
    name: string;
    description: string;
    schema: {
        columns: ColumnDefinition[];
        timestamps?: boolean;
    };
}

export const CreateSchemaForm = () => {
    const router = useRouter();
    // ✅ Pure DI: Get all dependencies from context
    const { labels, icons: Icons, defaults } = useConfig();
    const L = labels.mod.databaseSchema;
    const C = labels.common;

    // All data operations from composable
    const {
        submitting,
        validating,
        validationResult,
        templates,
        loadingTemplates,
        availableSources,
        validate,
        create,
        generateTableName,
        defaultOptions,
    } = useCreateSchema();

    // Form state (UI only)
    const [form, setForm] = useState({
        name: '',
        tableName: '',
        description: '',
    });

    const [columns, setColumns] = useState<ColumnDefinition[]>([
        { name: 'title', type: 'string', required: true },
        { name: 'slug', type: 'slug', unique: true, target: 'title' },
        { name: 'status', type: 'status', values: ['draft', 'published', 'archived'] }
    ]);

    const [options, setOptions] = useState<{ timestamps: boolean; softDelete: boolean }>({
        timestamps: defaultOptions.timestamps,
        softDelete: defaultOptions.softDelete,
    });

    // Debounced validation when form changes
    useEffect(() => {
        if (!form.tableName) return;

        const timer = setTimeout(() => {
            validate(form.tableName, columns, options);
        }, defaults.debounceMs);

        return () => clearTimeout(timer);
    }, [form.tableName, columns, options, validate, defaults]);

    // Auto-generate table name from display name
    const handleNameChange = (val: string) => {
        const newForm = { ...form, name: val };
        if (!form.tableName && val) {
            newForm.tableName = generateTableName(val);
        }
        setForm(newForm);
    };

    const { id: targetId } = useParams() as { id: string };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // DEBUG: Log the payload being sent
        const payload = {
            name: form.name,
            tableName: form.tableName,
            description: form.description,
            schema: {
                columns,
                timestamps: options.timestamps,
                softDelete: options.softDelete,
            },
        };


        const result = await create(payload);
        
        if (result) {
            router.refresh();
            const path = targetId ? `/target/${targetId}/database-schema` : '/database-schema';
            router.push(path);
        }
    };

    const applyTemplate = (tpl: Template) => {
        setForm({
            name: form.name || tpl.name,
            tableName: form.tableName || '',
            description: tpl.description,
        });
        setColumns(tpl.schema.columns);
        setOptions(prev => ({
            ...prev,
            timestamps: tpl.schema.timestamps ?? true,
        }));
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Section 0: Template Gallery */}
            <Card >
                <div className="p-6 md:p-8">
                    <Stack direction="row" gap={4} align="center" className="mb-8">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Icons.sparkles className="w-6 h-6" /></div>
                        <div>
                            <Heading level={5}>{L.forms.startFromTemplate}</Heading>
                            <Text variant="muted" className="mt-1">{L.forms.choosePrebuilt}</Text>
                        </div>
                    </Stack>

                    {loadingTemplates ? (
                        <div className="flex gap-4 overflow-x-auto pb-4">
                            {[1, 2, 3].map(i => <div key={i} className="w-64 h-40 bg-muted rounded-xl animate-pulse shrink-0"></div>)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {templates.map(tpl => (
                                <button
                                    key={tpl.id}
                                    type="button"
                                    onClick={() => applyTemplate(tpl)}
                                    className="bg-card hover:bg-muted/50 transition-all p-5 rounded-xl text-left border border-border hover:border-primary/40 flex flex-col h-full group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Icons.arrowRight className="w-4 h-4 text-primary/60" />
                                    </div>
                                    <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform origin-left">{tpl.icon}</span>
                                    <Heading level={5}>{tpl.name}</Heading>
                                    <Text variant="muted" className="text-xs leading-relaxed mb-4 flex-1">{tpl.description}</Text>
                                    <div className="mt-auto flex items-center gap-2 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-1.5 rounded-lg w-fit">
                                        <span>{L.forms.useTemplate}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Basic Info */}
                <Card >
                    <div className="p-6 md:p-8">
                        <Stack direction="row" gap={3} align="center" className="mb-8 pb-4 border-b border-border">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Icons.info className="w-5 h-5" /></div>
                            <Heading level={5}>{L.forms.basicInformation}</Heading>
                        </Stack>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    {L.forms.displayName} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder={L.forms.displayNamePlaceholder}
                                    className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-sm"
                                    required
                                />
                                <Text variant="muted" className="text-xs mt-2 ml-1">{L.forms.displayNameHint}</Text>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    {L.forms.tableNameSql} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={form.tableName}
                                        onChange={(e) => setForm({ ...form, tableName: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                        placeholder={L.forms.tableNameSqlPlaceholder}
                                        className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all font-mono text-sm ${validationResult?.errors?.some(e => e.includes('Table') || e.includes('reserved prefix'))
                                            ? 'border-red-300 focus:ring-2 focus:ring-red-100'
                                            : validationResult && !validating
                                                ? 'border-green-300 focus:ring-2 focus:ring-green-100'
                                                : 'border-border focus:ring-2 focus:ring-primary/10 focus:border-primary'
                                            }`}
                                        required
                                    />
                                    {validating && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <div className="w-4 h-4 border-2 border-border border-t-transparent animate-spin rounded-full"></div>
                                        </div>
                                    )}
                                    {!validating && validationResult && !validationResult.errors?.some(e => e.includes('Table') || e.includes('reserved prefix')) && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                                            <Icons.check className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                                {validationResult?.sanitizedTableName && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <Badge variant="outline">{USER_TABLE_PREFIX}{validationResult.sanitizedTableName}</Badge>
                                        <Text variant="muted" className="text-xs">{L.forms.finalDatabaseTableName}</Text>
                                    </div>
                                )}
                                {validationResult?.errors && validationResult.errors.filter(e => e.includes('Table') || e.includes('reserved prefix')).length > 0 && (
                                    <Text className="text-sm text-red-500 mt-2 font-medium">
                                        {validationResult.errors.filter(e => e.includes('Table') || e.includes('reserved prefix'))[0]}
                                    </Text>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-foreground mb-2">{L.forms.description}</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder={L.forms.descriptionPlaceholder}
                                    className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm min-h-[100px] resize-y"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Section 2: Schema */}
                <Card >
                    <div className="p-6 md:p-8">
                        <Stack direction="row" gap={3} align="center" className="mb-8 pb-4 border-b border-border">
                            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600"><Icons.clipboardList className="w-5 h-5" /></div>
                            <div>
                                <Heading level={5}>{L.forms.schemaDefinition}</Heading>
                                <Text variant="muted" className="mt-1">{L.forms.schemaDefinitionSubtitle}</Text>
                            </div>
                        </Stack>

                        <div className="-mx-4 sm:mx-0">
                            <ColumnBuilder
                                columns={columns}
                                onChange={setColumns}
                                availableSources={availableSources}
                            />
                            {validationResult?.errors && validationResult.errors.filter(e => !e.includes('Table') && !e.includes('reserved prefix')).length > 0 && (
                                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm flex items-start gap-3">
                                    <Icons.warning className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold">{L.forms.schemaValidationErrors}</p>
                                        <ul className="list-disc pl-4 mt-1 space-y-1">
                                            {validationResult.errors.filter(e => !e.includes('Table') && !e.includes('reserved prefix')).map((err, i) => (
                                                <li key={i}>{err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Section 3: Options */}
                <Card  className="mb-24">
                    <div className="p-6 md:p-8">
                        <Stack direction="row" gap={3} align="center" className="mb-8 pb-4 border-b border-border">
                            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600"><Icons.settings className="w-5 h-5" /></div>
                            <Heading level={5}>{L.forms.configuration}</Heading>
                        </Stack>

                        <div className="grid md:grid-cols-2 gap-4">
                            <label className={cn(
                                "flex items-start gap-4 p-5 rounded-xl border transition-all cursor-pointer group",
                                options.timestamps
                                    ? 'bg-primary/[0.03] border-primary/20 ring-1 ring-primary/20'
                                    : 'bg-card border-border hover:border-border'
                            )}>
                                <div className="pt-1">
                                    <input
                                        type="checkbox"
                                        checked={options.timestamps}
                                        onChange={(e) => setOptions({ ...options, timestamps: e.target.checked })}
                                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <span className={cn(
                                        "block font-semibold text-base mb-1",
                                        options.timestamps ? 'text-primary' : 'text-foreground'
                                    )}>{L.forms.timestamps}</span>
                                    <Text variant="muted" className="leading-relaxed group-hover:text-foreground">
                                        {L.forms.timestampsDescription}
                                    </Text>
                                </div>
                            </label>

                            <label className={cn(
                                "flex items-start gap-4 p-5 rounded-xl border transition-all cursor-pointer group",
                                options.softDelete
                                    ? 'bg-primary/[0.03] border-primary/20 ring-1 ring-primary/20'
                                    : 'bg-card border-border hover:border-border'
                            )}>
                                <div className="pt-1">
                                    <input
                                        type="checkbox"
                                        checked={options.softDelete}
                                        onChange={(e) => setOptions({ ...options, softDelete: e.target.checked })}
                                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <span className={cn(
                                        "block font-semibold text-base mb-1",
                                        options.softDelete ? 'text-primary' : 'text-foreground'
                                    )}>{L.forms.softDelete}</span>
                                    <Text variant="muted" className="leading-relaxed group-hover:text-foreground">
                                        {L.forms.softDeleteDescription}
                                    </Text>
                                </div>
                            </label>
                        </div>
                    </div>
                </Card>

                <div className="h-24"></div>

                {/* Fixed Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-50">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <Stack direction="row" gap={2} align="center">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.back()}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                {C.actions.cancel}
                            </Button>
                            {validationResult?.valid === false && (
                                <span className="hidden sm:inline-block text-sm text-red-500 font-medium animate-pulse ml-2">
                                    {L.forms.pleaseFixValidation}
                                </span>
                            )}
                        </Stack>

                        <Stack direction="row" gap={4} align="center">
                            <Button
                                type="submit"
                                size="lg"
                                isLoading={submitting}
                                disabled={validationResult?.valid === false || submitting}
                                className="min-w-[200px]"
                            >
                                {L.buttons.createSchema}
                            </Button>
                        </Stack>
                    </div>
                </div>
            </form>
        </div>
    );
};
