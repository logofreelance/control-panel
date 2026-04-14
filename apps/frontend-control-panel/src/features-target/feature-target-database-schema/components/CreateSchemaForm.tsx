'use client';

/**
 * CreateSchemaForm - Enhanced with Flat Luxury UI
 * Integrated with TargetLayout and consistent Design System
 */

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
    Button, 
    Badge, 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription,
    Input,
    Textarea,
    Label,
    Field,
    FieldLabel
} from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { cn } from '@/lib/utils';
import { TargetLayout } from '@/components/layout/TargetLayout';
import { ColumnBuilder } from './ColumnBuilder';
import { useCreateSchema } from '../composables';
import { useConfig } from '@/modules/_core';
import type { ColumnDefinition } from '../types';

export const CreateSchemaForm = () => {
    const router = useRouter();
    const params = useParams();
    const nodeId = params?.id as string;
    
    const { labels, icons: Icons, defaults } = useConfig();
    const C = labels.common;
    const L = labels.mod.databaseSchema;

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

    useEffect(() => {
        if (!form.tableName) return;
        const timer = setTimeout(() => {
            validate(form.tableName, columns, options);
        }, defaults.debounceMs);
        return () => clearTimeout(timer);
    }, [form.tableName, columns, options, validate, defaults]);

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
        <div className="flex flex-col gap-8 animate-page-enter">
            <header className="space-y-1">
                <TextHeading as="h1" size="h3">{L.titles.createSchema}</TextHeading>
                <p className="text-sm md:text-base text-muted-foreground lowercase">define your database structure and columns</p>
            </header>

            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <Icons.sparkles className="size-5 text-primary" />
                    <TextHeading size="h6" className="text-base font-semibold">{L.forms.startFromTemplate}</TextHeading>
                </div>

                {loadingTemplates ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-muted/40 rounded-xl animate-pulse" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {templates.map(tpl => (
                            <button
                                key={tpl.id}
                                type="button"
                                onClick={() => applyTemplate(tpl)}
                                className="bg-card hover:bg-muted/10 transition-all duration-300 p-6 rounded-xl text-left shadow-sm border flex flex-col h-full group outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform origin-left">{tpl.icon}</span>
                                <TextHeading size="h6" className="text-base font-semibold mb-0.5 tracking-tight">{tpl.name}</TextHeading>
                                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4 opacity-70">{tpl.description}</p>
                                <Badge variant="secondary" className="w-fit">
                                    {L.forms.useTemplate}
                                </Badge>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Icons.info className="size-5 text-primary" />
                            <CardTitle>{L.forms.basicInformation}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label={L.forms.displayName}
                                value={form.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder={L.forms.displayNamePlaceholder}
                                required
                            />

                            <Field>
                                <Input
                                    label={L.forms.tableNameSql}
                                    value={form.tableName}
                                    onChange={(e) => setForm({ ...form, tableName: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                    placeholder={L.forms.tableNameSqlPlaceholder}
                                    required
                                    aria-invalid={validationResult?.errors?.some(e => e.includes('Table') || e.includes('reserved prefix'))}
                                />
                                {validationResult?.sanitizedTableName && (
                                    <div className="flex items-center gap-2 mt-2 px-1">
                                        <Badge variant="secondary">usr_{validationResult.sanitizedTableName}</Badge>
                                        <span className="text-xs text-muted-foreground/60">{L.forms.finalDatabaseTableName}</span>
                                    </div>
                                )}
                                {validationResult?.errors && validationResult.errors.filter(e => e.includes('Table') || e.includes('reserved prefix')).length > 0 && (
                                    <p className="text-xs text-destructive font-semibold mt-1 px-1">
                                        {validationResult.errors.filter(e => e.includes('Table') || e.includes('reserved prefix'))[0]}
                                    </p>
                                )}
                            </Field>

                            <Field className="md:col-span-2">
                                <FieldLabel>{L.forms.description}</FieldLabel>
                                <Textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder={L.forms.descriptionPlaceholder}
                                />
                            </Field>
                        </div>
                    </CardContent>
                </Card>

                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <Icons.clipboardList className="size-5 text-primary" />
                        <div className="space-y-0.5">
                            <TextHeading size="h6" className="text-lg font-semibold tracking-tight">{L.forms.schemaDefinition}</TextHeading>
                            <p className="text-base text-muted-foreground opacity-75">{L.forms.schemaDefinitionSubtitle}</p>
                        </div>
                    </div>

                    <ColumnBuilder
                        columns={columns}
                        onChange={setColumns}
                        availableSources={availableSources}
                    />
                    
                    {validationResult?.errors && validationResult.errors.filter(e => !e.includes('Table') && !e.includes('reserved prefix')).length > 0 && (
                        <div className="mt-10 p-8 bg-destructive/5 text-destructive rounded-xl border border-destructive/10 text-sm space-y-4">
                            <div className="flex items-center gap-3 font-semibold">
                                <Icons.warning className="size-5" />
                                <span>{L.forms.schemaValidationErrors}</span>
                            </div>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 list-disc pl-6">
                                {validationResult.errors.filter(e => !e.includes('Table') && !e.includes('reserved prefix')).map((err: string, i: number) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Icons.settings className="size-5 text-primary" />
                            <CardTitle>{L.forms.configuration}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-8">
                            <CheckboxOption
                                checked={options.timestamps}
                                onChange={(val: boolean) => setOptions({ ...options, timestamps: val })}
                                label={L.forms.timestamps}
                                desc={L.forms.timestampsDescription}
                                icon={Icons.clock}
                            />
                            <CheckboxOption
                                checked={options.softDelete}
                                onChange={(val: boolean) => setOptions({ ...options, softDelete: val })}
                                label={L.forms.softDelete}
                                desc={L.forms.softDeleteDescription}
                                icon={Icons.trash}
                            />
                        </div>
                    </CardContent>
                </Card>
            </form>

            <Card className="mt-8">
                <CardContent className="flex items-center justify-end gap-3">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                        >
                            {C.actions.cancel}
                        </Button>
                        {validationResult?.valid === false && (
                            <div className="hidden sm:flex items-center gap-3 text-destructive animate-pulse">
                                <Icons.warning className="size-5" />
                                <span className="text-xs font-semibold uppercase">
                                    validation issues detected
                                </span>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleSubmit}
                        isLoading={submitting}
                        disabled={validationResult?.valid === false || submitting}
                    >
                        {L.buttons.createSchema}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

const CheckboxOption = ({ checked, onChange, label, desc, icon: Icon }: any) => {
    const { icons: Icons } = useConfig();
    return (
        <Card 
            onClick={() => onChange(!checked)}
            size="sm"
            className={cn(
                "cursor-pointer transition-all",
                checked ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/10'
            )}
        >
            <CardContent className="flex items-start gap-4">
                <div className={cn(
                    "size-12 rounded-xl flex items-center justify-center shrink-0",
                    checked ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                    <Icon className="size-6" />
                </div>
                <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                        <TextHeading size="h6" className={cn(
                            "text-base font-semibold",
                            checked ? 'text-primary' : 'text-foreground'
                        )}>
                            {label}
                        </TextHeading>
                        <div className={cn(
                            "size-6 rounded-lg border flex items-center justify-center transition-all",
                            checked ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/20'
                        )}>
                            {checked && <Icons.check className="size-4 stroke-[3]" />}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
            </CardContent>
        </Card>
    );
};
