'use client';

/**
 * CreateSchemaForm - Enhanced with Flat Luxury UI
 * Integrated with TargetLayout and consistent Design System
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { cn } from '@/lib/utils';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { TargetLayout } from '@/components/layout/TargetLayout';
import { ColumnBuilder } from './ColumnBuilder';
import { useCreateSchema } from '../composables';
import { useConfig } from '@/modules/_core';
import type { ColumnDefinition } from '../types';

const L = MODULE_LABELS.databaseSchema;

export const CreateSchemaForm = () => {
    const router = useRouter();
    const params = useParams();
    const nodeId = params.id as string;
    
    // ✅ Pure DI: Get all dependencies from context
    const { labels, icons: Icons, defaults } = useConfig();
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
            const path = nodeId ? `/target/${nodeId}/database-schema` : '/database-schema';
            router.push(path);
            router.refresh();
        }
    };

    const applyTemplate = (tpl: any) => {
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
        window.scrollTo({ top: 400, behavior: 'smooth' });
    };

    return (
        <TargetLayout>
            <div className="flex flex-col gap-10 animate-page-enter max-w-5xl mx-auto pb-32">
                {/* Header */}
                <header className="px-1 space-y-1">
                    <TextHeading as="h1" size="h3">{L.forms.createSchema}</TextHeading>
                    <p className="text-sm text-muted-foreground lowercase">define your database structure and columns</p>
                </header>

                {/* Section 0: Template Gallery */}
                <section className="space-y-6 px-1">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Icons.sparkles className="w-4 h-4" />
                        </div>
                        <TextHeading size="h6" className="text-sm font-semibold lowercase">{L.forms.startFromTemplate}</TextHeading>
                    </div>

                    {loadingTemplates ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-44 bg-muted/40 rounded-2xl animate-pulse" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {templates.map(tpl => (
                                <button
                                    key={tpl.id}
                                    type="button"
                                    onClick={() => applyTemplate(tpl)}
                                    className="bg-card hover:bg-muted/10 transition-all duration-300 p-6 rounded-2xl text-left shadow-sm hover:shadow-md flex flex-col h-full group border-none"
                                >
                                    <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform origin-left">{tpl.icon}</span>
                                    <TextHeading size="h6" className="text-sm font-bold mb-1 lowercase">{tpl.name}</TextHeading>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed lowercase flex-1 mb-4">{tpl.description}</p>
                                    <div className="mt-auto inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-primary bg-primary/10 px-2.5 py-1.5 rounded-lg w-fit group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        {L.forms.useTemplate}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Section 1: Basic Info */}
                    <Card className="border-none shadow-sm bg-card/40">
                        <CardContent className="p-8 space-y-8">
                            <div className="flex items-center gap-3 border-b border-border/5 pb-6 mb-2">
                                <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Icons.info className="size-5" /></div>
                                <TextHeading size="h5" className="text-base font-semibold lowercase">{L.forms.basicInformation}</TextHeading>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground lowercase px-1">
                                        {L.forms.displayName}
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        placeholder={L.forms.displayNamePlaceholder}
                                        className="w-full h-12 px-5 rounded-2xl bg-muted/20 border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all font-medium text-sm lowercase"
                                        required
                                    />
                                    <p className="text-[11px] text-muted-foreground/60 lowercase px-2">{L.forms.displayNameHint}</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground lowercase px-1">
                                        {L.forms.tableNameSql}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={form.tableName}
                                            onChange={(e) => setForm({ ...form, tableName: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                            placeholder={L.forms.tableNameSqlPlaceholder}
                                            className={cn(
                                                "w-full h-12 px-5 pr-12 rounded-2xl bg-muted/20 border-none outline-none transition-all font-mono text-sm lowercase",
                                                validationResult?.errors?.some(e => e.includes('Table') || e.includes('reserved prefix'))
                                                    ? 'focus:ring-1 focus:ring-rose-500/20'
                                                    : 'focus:ring-1 focus:ring-primary/20'
                                            )}
                                            required
                                        />
                                        {validating && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <Icons.loading className="size-4 animate-spin text-muted-foreground/40" />
                                            </div>
                                        )}
                                        {!validating && validationResult && !validationResult.errors?.some(e => e.includes('Table') || e.includes('reserved prefix')) && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                                                <Icons.check className="size-5" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2 mt-2 px-2">
                                        {validationResult?.sanitizedTableName && (
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="px-2 py-0 h-5 font-mono text-[10px] bg-emerald-500/10 text-emerald-600 border-none">usr_{validationResult.sanitizedTableName}</Badge>
                                                <span className="text-[10px] text-muted-foreground/60 lowercase">{L.forms.finalDatabaseTableName}</span>
                                            </div>
                                        )}
                                        {validationResult?.errors && validationResult.errors.filter(e => e.includes('Table') || e.includes('reserved prefix')).length > 0 && (
                                            <p className="text-[11px] text-rose-500 font-medium lowercase">
                                                {validationResult.errors.filter(e => e.includes('Table') || e.includes('reserved prefix'))[0]}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground lowercase px-1">{L.forms.description}</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder={L.forms.descriptionPlaceholder}
                                        className="w-full px-5 py-4 rounded-2xl bg-muted/20 border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all text-sm min-h-[120px] resize-none lowercase"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 2: Schema Builder */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 px-1">
                            <div className="size-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600"><Icons.clipboardList className="w-4 h-4" /></div>
                            <div className="space-y-0.5">
                                <TextHeading size="h6" className="text-sm font-semibold lowercase">{L.forms.schemaDefinition}</TextHeading>
                                <p className="text-[11px] text-muted-foreground lowercase">{L.forms.schemaDefinitionSubtitle.toLowerCase()}</p>
                            </div>
                        </div>

                        <div className="bg-muted/10 rounded-3xl p-2 md:p-4">
                            <ColumnBuilder
                                columns={columns}
                                onChange={setColumns}
                                availableSources={availableSources}
                            />
                            
                            {validationResult?.errors && validationResult.errors.filter(e => !e.includes('Table') && !e.includes('reserved prefix')).length > 0 && (
                                <div className="mt-8 p-6 bg-rose-500/5 text-rose-600 rounded-2xl border border-rose-500/10 text-xs space-y-3">
                                    <div className="flex items-center gap-2 font-black uppercase tracking-tighter">
                                        <Icons.warning className="size-4" />
                                        <span>{L.forms.schemaValidationErrors}</span>
                                    </div>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5 list-disc pl-5 lowercase">
                                        {validationResult.errors.filter(e => !e.includes('Table') && !e.includes('reserved prefix')).map((err: string, i: number) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Section 3: Options */}
                    <Card className="border-none shadow-sm bg-card/40">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-3 border-b border-border/5 pb-6 mb-8">
                                <div className="size-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600"><Icons.settings className="size-5" /></div>
                                <TextHeading size="h5" className="text-base font-semibold lowercase">{L.forms.configuration}</TextHeading>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <CheckboxOption
                                    checked={options.timestamps}
                                    onChange={(val) => setOptions({ ...options, timestamps: val })}
                                    label={L.forms.timestamps}
                                    desc={L.forms.timestampsDescription}
                                    icon={Icons.clock}
                                />
                                <CheckboxOption
                                    checked={options.softDelete}
                                    onChange={(val) => setOptions({ ...options, softDelete: val })}
                                    label={L.forms.softDelete}
                                    desc={L.forms.softDeleteDescription}
                                    icon={Icons.trash}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </form>

                {/* Premium Action Bar */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50">
                    <div className="bg-background/80 backdrop-blur-xl border border-border/40 p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 px-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.back()}
                                className="h-11 rounded-xl px-6 lowercase font-bold text-muted-foreground hover:bg-muted"
                            >
                                {C.actions.cancel}
                            </Button>
                            {validationResult?.valid === false && (
                                <div className="hidden sm:flex items-center gap-2 text-rose-500 animate-pulse">
                                    <Icons.warning className="size-4" />
                                    <span className="text-[11px] font-black uppercase tracking-tighter">
                                        validation pending
                                    </span>
                                </div>
                            )}
                        </div>

                        <Button
                            onClick={handleSubmit}
                            size="lg"
                            isLoading={submitting}
                            disabled={validationResult?.valid === false || submitting}
                            className="h-11 min-w-[180px] rounded-xl lowercase shadow-lg shadow-primary/20"
                        >
                            {L.buttons.createSchema}
                        </Button>
                    </div>
                </div>
            </div>
        </TargetLayout>
    );
};

const CheckboxOption = ({ checked, onChange, label, desc, icon: Icon }: any) => (
    <div 
        onClick={() => onChange(!checked)}
        className={cn(
            "flex items-start gap-5 p-6 rounded-2xl border transition-all duration-300 cursor-pointer group",
            checked
                ? 'bg-primary/5 border-primary/20 shadow-sm'
                : 'bg-muted/10 border-transparent hover:bg-muted/20'
        )}
    >
        <div className={cn(
            "size-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
            checked ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/10' : 'bg-muted text-muted-foreground'
        )}>
            <Icon className="size-5" />
        </div>
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <TextHeading size="h6" className={cn(
                    "text-sm font-bold lowercase",
                    checked ? 'text-primary' : 'text-foreground'
                )}>
                    {label}
                </TextHeading>
                <div className={cn(
                    "size-5 rounded-md border flex items-center justify-center transition-all",
                    checked ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/20 bg-background/50'
                )}>
                    {checked && <Icons.check className="size-3.5 stroke-3" />}
                </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed lowercase">{desc.toLowerCase()}</p>
        </div>
    </div>
);
