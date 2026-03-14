'use client';

// CreateSourceForm - Full page form for creating data sources
// Pure UI component - all data operations via useCreateSource composable
// ✅ PURE DI: Uses useConfig() hook for all config, labels, icons

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Badge } from '@cp/ui';
import { ColumnBuilder } from './ColumnBuilder';
import { useCreateSource } from '../composables';
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

export const CreateSourceForm = () => {
    const router = useRouter();
    // ✅ Pure DI: Get all dependencies from context
    const { labels, icons: Icons, defaults } = useConfig();
    const L = labels.mod.dataSources;
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
    } = useCreateSource();

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
            router.push('/data-sources');
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
            <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 ring-1 ring-indigo-100"><Icons.sparkles className="w-6 h-6" /></div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{L.forms.startFromTemplate}</h2>
                        <p className="text-slate-500 text-sm mt-1">{L.forms.choosePrebuilt}</p>
                    </div>
                </div>

                {loadingTemplates ? (
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {[1, 2, 3].map(i => <div key={i} className="w-64 h-40 bg-slate-50 rounded-xl animate-pulse flex-shrink-0"></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {templates.map(tpl => (
                            <button
                                key={tpl.id}
                                type="button"
                                onClick={() => applyTemplate(tpl)}
                                className="bg-white hover:bg-slate-50/50 transition-all p-5 rounded-xl text-left border border-slate-200 hover:border-indigo-300 flex flex-col h-full group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Icons.arrowRight className="w-4 h-4 text-indigo-400" />
                                </div>
                                <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform origin-left">{tpl.icon}</span>
                                <h3 className="font-semibold text-slate-900 text-sm mb-2">{tpl.name}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1">{tpl.description}</p>
                                <div className="mt-auto flex items-center gap-2 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-1.5 rounded-lg w-fit">
                                    <span>{L.forms.useTemplate}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Basic Info */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><Icons.info className="w-5 h-5" /></div>
                        <h2 className="text-lg font-semibold text-slate-800">{L.forms.basicInformation}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {L.forms.displayName} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder={L.forms.displayNamePlaceholder}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)] outline-none transition-all font-medium text-sm"
                                required
                            />
                            <p className="text-xs text-slate-400 mt-2 ml-1">{L.forms.displayNameHint}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
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
                                            : 'border-slate-200 focus:ring-2 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)]'
                                        }`}
                                    required
                                />
                                {validating && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent animate-spin rounded-full"></div>
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
                                    <Badge variant="slate">{USER_TABLE_PREFIX}{validationResult.sanitizedTableName}</Badge>
                                    <span className="text-xs text-slate-400">{L.forms.finalDatabaseTableName}</span>
                                </div>
                            )}
                            {validationResult?.errors && validationResult.errors.filter(e => e.includes('Table') || e.includes('reserved prefix')).length > 0 && (
                                <p className="text-sm text-red-500 mt-2 font-medium">
                                    {validationResult.errors.filter(e => e.includes('Table') || e.includes('reserved prefix'))[0]}
                                </p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">{L.forms.description}</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder={L.forms.descriptionPlaceholder}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)] outline-none transition-all text-sm min-h-[100px] resize-y"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Schema */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600"><Icons.clipboardList className="w-5 h-5" /></div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-800">{L.forms.schemaDefinition}</h2>
                            <p className="text-sm text-slate-500 mt-1">{L.forms.schemaDefinitionSubtitle}</p>
                        </div>
                    </div>

                    <div className="-mx-4 sm:mx-0">
                        <ColumnBuilder
                            columns={columns}
                            onChange={setColumns}
                            availableSources={availableSources}
                        />
                        {validationResult?.errors && validationResult.errors.filter(e => !e.includes('Table') && !e.includes('reserved prefix')).length > 0 && (
                            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm flex items-start gap-3">
                                <Icons.warning className="w-5 h-5 flex-shrink-0 mt-0.5" />
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

                {/* Section 3: Options */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 mb-24">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600"><Icons.settings className="w-5 h-5" /></div>
                        <h2 className="text-lg font-semibold text-slate-800">{L.forms.configuration}</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <label className={`flex items-start gap-4 p-5 rounded-xl border transition-all cursor-pointer group ${options.timestamps ? 'bg-indigo-50/30 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                            <div className="pt-1">
                                <input
                                    type="checkbox"
                                    checked={options.timestamps}
                                    onChange={(e) => setOptions({ ...options, timestamps: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-300 text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                                />
                            </div>
                            <div>
                                <span className={`block font-semibold text-base mb-1 ${options.timestamps ? 'text-indigo-900' : 'text-slate-800'}`}>{L.forms.timestamps}</span>
                                <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-600">
                                    {L.forms.timestampsDescription}
                                </p>
                            </div>
                        </label>

                        <label className={`flex items-start gap-4 p-5 rounded-xl border transition-all cursor-pointer group ${options.softDelete ? 'bg-indigo-50/30 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                            <div className="pt-1">
                                <input
                                    type="checkbox"
                                    checked={options.softDelete}
                                    onChange={(e) => setOptions({ ...options, softDelete: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-300 text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                                />
                            </div>
                            <div>
                                <span className={`block font-semibold text-base mb-1 ${options.softDelete ? 'text-indigo-900' : 'text-slate-800'}`}>{L.forms.softDelete}</span>
                                <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-600">
                                    {L.forms.softDeleteDescription}
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="h-24"></div>

                {/* Fixed Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 p-4 z-50">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.back()}
                                className="text-slate-500 hover:text-slate-700"
                            >
                                {C.actions.cancel}
                            </Button>
                            {validationResult?.valid === false && (
                                <span className="hidden sm:inline-block text-sm text-red-500 font-medium animate-pulse ml-2">
                                    {L.forms.pleaseFixValidation}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                type="submit"
                                size="lg"
                                isLoading={submitting}
                                disabled={validationResult?.valid === false || submitting}
                                className="min-w-[200px]"
                            >
                                {L.buttons.createSource}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};
