'use client';

// IntegrationGuide - Comprehensive integration guide for AI-friendly frontend development
// This component contains documentation strings that are exempt from jsx-no-literals

import { Button, Badge } from '@/components/ui';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { env } from '@/lib/env';
import { CODE_EXAMPLES, GUIDE_CONTENT } from '../registry/code-examples';
import React from 'react';

const L = MODULE_LABELS.api;

interface IntegrationGuideProps {
    copyToClipboard: (text: string, message?: string) => void;
}

// ── Step Indicator Component ──────────────────────
const StepDot = ({ active = false }: { active?: boolean }) => (
    <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-white ring-1 flex items-center justify-center ${active ? 'bg-indigo-100 ring-indigo-200' : 'bg-slate-200 ring-slate-100'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-indigo-500' : 'bg-slate-400'}`} />
    </div>
);

// ── Method Badge ──────────────────────────────────
const MethodBadge = ({ method }: { method: string }) => {
    const colors: Record<string, string> = {
        GET: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        POST: 'bg-blue-50 text-blue-700 border-blue-100',
        PUT: 'bg-amber-50 text-amber-700 border-amber-100',
        DELETE: 'bg-red-50 text-red-700 border-red-100',
    };
    return (
        <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border ${colors[method] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
            {method}
        </span>
    );
};

export const IntegrationGuide = ({ copyToClipboard }: IntegrationGuideProps) => {
    const [activeTab, setActiveTab] = React.useState<'js' | 'flutter' | 'reactNative'>('js');
    const [expandedSection, setExpandedSection] = React.useState<string | null>(null);
    const apiUrl = env.API_URL || 'http://localhost:3001';
    const G = GUIDE_CONTENT;

    const tabs = [
        { id: 'js', label: L.labels.websiteJs, icon: Icons.globe, code: CODE_EXAMPLES.javascript(apiUrl) },
        { id: 'flutter', label: L.labels.mobileFlutter, icon: Icons.smartphone, code: CODE_EXAMPLES.flutter(apiUrl) },
        { id: 'reactNative', label: L.labels.mobileReactNative, icon: Icons.code, code: CODE_EXAMPLES.reactNative(apiUrl) },
    ] as const;

    const activeCode = tabs.find(t => t.id === activeTab)?.code || '';

    const toggleSection = (section: string) => {
        setExpandedSection(prev => prev === section ? null : section);
    };

    return (
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                    <Icons.rocket className="w-5 h-5 text-indigo-600" /> {L.sections.integrationGuide}
                </h3>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-100 font-medium px-3 py-1">{L.labels.fullGuide}</Badge>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                {/* ━━━━ Left Column: Steps (3/5 width) ━━━━ */}
                <div className="xl:col-span-3 space-y-1">

                    {/* ── Step 1: Buat API Key ──────────── */}
                    <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-100 pb-5">
                        <StepDot />
                        <h4 className="font-semibold text-slate-800 text-sm mb-1">{'1. '}{G.step1.title}</h4>
                        <p className="text-xs text-slate-500 mb-2 leading-relaxed">{G.step1.description}</p>
                        <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 p-2 rounded-lg flex items-start gap-2">
                            <Icons.alertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                            <span>{G.step1.warning}</span>
                        </div>
                    </div>

                    {/* ── Step 2: Add CORS Domain ───────── */}
                    <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-100 pb-5">
                        <StepDot />
                        <h4 className="font-semibold text-slate-800 text-sm mb-1">{'2. '}{G.step2.title}</h4>
                        <p className="text-xs text-slate-500 mb-2 leading-relaxed">{G.step2.description}</p>
                        <div className="flex flex-wrap gap-2 text-[10px] text-slate-600 font-mono mb-1">
                            {G.step2.examples.map((ex, i) => (
                                <span key={i} className="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">{ex}</span>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-400 italic">{G.step2.note}</p>
                    </div>

                    {/* ── Step 3: Base URL ──────────────── */}
                    <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-100 pb-5">
                        <StepDot />
                        <h4 className="font-semibold text-slate-800 text-sm mb-1">{'3. '}{G.step3.title}</h4>
                        <p className="text-xs text-slate-500 mb-2 leading-relaxed">{G.step3.description}</p>
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-lg min-w-0">
                            <code className="text-xs font-mono text-indigo-600 truncate flex-1 min-w-0">{env.API_URL}/green</code>
                            <button onClick={() => copyToClipboard(`${env.API_URL}/green`, L.messages.urlCopied)} className="text-slate-400 hover:text-indigo-600 transition-colors shrink-0">
                                <Icons.copy className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* ── Step 4: Headers ───────────────── */}
                    <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-100 pb-5">
                        <StepDot active />
                        <h4 className="font-semibold text-slate-800 text-sm mb-1">{'4. '}{G.step4.title}</h4>
                        <p className="text-xs text-slate-500 mb-3 leading-relaxed">{G.step4.description}</p>
                        <div className="space-y-2">
                            {/* Required Header */}
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[9px] font-bold text-red-500 uppercase bg-red-50 px-1.5 py-0.5 rounded">{'WAJIB'}</span>
                                    <span className="text-[10px] text-slate-500">{G.headers.required.label}</span>
                                </div>
                                <code className="text-xs text-slate-700 font-mono block">{G.headers.required.value}</code>
                                <p className="text-[10px] text-slate-400 mt-1">{G.headers.required.description}</p>
                            </div>
                            {/* Content-Type Header */}
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[9px] font-bold text-amber-600 uppercase bg-amber-50 px-1.5 py-0.5 rounded">{'POST/PUT'}</span>
                                    <span className="text-[10px] text-slate-500">{G.headers.contentType.label}</span>
                                </div>
                                <code className="text-xs text-slate-700 font-mono block">{G.headers.contentType.value}</code>
                                <p className="text-[10px] text-slate-400 mt-1">{G.headers.contentType.description}</p>
                            </div>
                            {/* Optional Header */}
                            <div className="bg-white p-2.5 rounded-lg border border-slate-200 border-dashed">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[9px] font-bold text-blue-500 uppercase bg-blue-50 px-1.5 py-0.5 rounded">{'OPTIONAL'}</span>
                                    <span className="text-[10px] text-slate-500">{G.headers.optional.label}</span>
                                </div>
                                <code className="text-xs text-slate-600 font-mono block">{G.headers.optional.value}</code>
                                <p className="text-[10px] text-slate-400 mt-1">{G.headers.optional.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Step 5: Auth Flow ─────────────── */}
                    <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-100 pb-5">
                        <StepDot active />
                        <h4 className="font-semibold text-slate-800 text-sm mb-1">{'5. '}{G.step5.title}</h4>
                        <p className="text-xs text-slate-500 mb-3 leading-relaxed">{G.step5.description}</p>

                        {/* Auth Flow Visual Steps */}
                        <div className="space-y-2 mb-3">
                            {G.step5.substeps.map((sub, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs">
                                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                                    <div className="min-w-0">
                                        <span className="font-medium text-slate-700">{sub.label}</span>
                                        {sub.method && sub.path && (
                                            <span className="ml-1.5">
                                                <MethodBadge method={sub.method} />
                                                <code className="text-[10px] font-mono text-slate-500 ml-1">{sub.path}</code>
                                            </span>
                                        )}
                                        {sub.body && <code className="text-[10px] font-mono text-slate-400 ml-1">{sub.body}</code>}
                                        {sub.note && <span className="text-slate-400 ml-1">{' — '}{sub.note}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Collapsible Auth Routes Table */}
                        <button
                            onClick={() => toggleSection('authRoutes')}
                            className="flex items-center gap-1.5 text-[11px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                            <Icons.chevronRight className={`w-3 h-3 transition-transform ${expandedSection === 'authRoutes' ? 'rotate-90' : ''}`} />
                            {G.authRoutes.title}{' ('}{G.authRoutes.routes.length}{' endpoints)'}
                        </button>
                        {expandedSection === 'authRoutes' && (
                            <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden">
                                <table className="w-full text-[10px]">
                                    <thead>
                                        <tr className="bg-slate-50 text-left">
                                            <th className="px-2 py-1.5 font-semibold text-slate-500">{L.labels.method}</th>
                                            <th className="px-2 py-1.5 font-semibold text-slate-500">{L.labels.path}</th>
                                            <th className="px-2 py-1.5 font-semibold text-slate-500 hidden sm:table-cell">{L.labels.auth}</th>
                                            <th className="px-2 py-1.5 font-semibold text-slate-500 hidden md:table-cell">{L.labels.description}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {G.authRoutes.routes.map((route, i) => (
                                            <tr key={i} className="border-t border-slate-100 hover:bg-slate-50/50">
                                                <td className="px-2 py-1.5"><MethodBadge method={route.method} /></td>
                                                <td className="px-2 py-1.5 font-mono text-slate-700">{route.path}</td>
                                                <td className="px-2 py-1.5 hidden sm:table-cell">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${route.auth === 'Public' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                        {route.auth}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-1.5 text-slate-500 hidden md:table-cell">{route.desc}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* ── Step 6: CRUD Pattern ──────────── */}
                    <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-100 pb-5">
                        <StepDot active />
                        <h4 className="font-semibold text-slate-800 text-sm mb-1">{'6. '}{G.step6.title}</h4>
                        <p className="text-xs text-slate-500 mb-3 leading-relaxed">{G.step6.description}</p>
                        <div className="border border-slate-200 rounded-lg overflow-hidden mb-2">
                            <table className="w-full text-[10px]">
                                <tbody>
                                    {G.step6.endpoints.map((ep, i) => (
                                        <tr key={i} className={`${i > 0 ? 'border-t border-slate-100' : ''} hover:bg-slate-50/50`}>
                                            <td className="px-2 py-1.5 w-16"><MethodBadge method={ep.method} /></td>
                                            <td className="px-2 py-1.5 font-mono text-slate-700">{ep.path}</td>
                                            <td className="px-2 py-1.5 text-slate-500 hidden sm:table-cell">{ep.desc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-[10px] text-slate-400 italic leading-relaxed">
                            <Icons.info className="w-3 h-3 inline mr-1 -mt-0.5" />
                            {G.step6.note}
                        </p>
                    </div>

                    {/* ── Step 7: Response Format ──────── */}
                    <div className="relative pl-6 sm:pl-8 border-l-2 border-transparent pb-2">
                        <StepDot active />
                        <h4 className="font-semibold text-slate-800 text-sm mb-1">{'7. '}{G.step7.title}</h4>
                        <p className="text-xs text-slate-500 mb-3 leading-relaxed">{G.step7.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3">
                                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1.5 flex items-center gap-1">
                                    <Icons.checkCircle className="w-3 h-3" /> {L.labels.success}
                                </p>
                                <pre className="text-[10px] font-mono text-slate-700 whitespace-pre leading-relaxed">{G.step7.successExample}</pre>
                            </div>
                            <div className="bg-red-50/50 border border-red-100 rounded-lg p-3">
                                <p className="text-[10px] font-bold text-red-600 uppercase mb-1.5 flex items-center gap-1">
                                    <Icons.alertTriangle className="w-3 h-3" /> {L.labels.error}
                                </p>
                                <pre className="text-[10px] font-mono text-slate-700 whitespace-pre leading-relaxed">{G.step7.errorExample}</pre>
                            </div>
                        </div>
                        <div className="mt-2 text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 p-2 rounded-lg flex items-start gap-2">
                            <Icons.info className="w-3 h-3 shrink-0 mt-0.5" />
                            <span>{G.step7.tip}</span>
                        </div>
                    </div>
                </div>

                {/* ━━━━ Right Column: Code Examples (2/5 width) ━━━━ */}
                <div className="xl:col-span-2 flex flex-col h-full max-h-[700px] xl:max-h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800 xl:sticky xl:top-4">
                    {/* Tab Bar */}
                    <div className="flex items-center border-b border-white/5 bg-slate-950/50 overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`
                                         flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-medium transition-colors border-r border-white/5 relative shrink-0
                                         ${isActive ? 'text-white bg-white/5' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
                                     `}
                                >
                                    <Icon className={`w-3 h-3 ${isActive ? 'text-blue-400' : 'opacity-70'}`} />
                                    {tab.label}
                                    {isActive && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500" />}
                                </button>
                            );
                        })}
                        <div className="flex-1 min-w-[12px]" />
                        <button
                            onClick={() => copyToClipboard(activeCode, L.messages.codeCopied)}
                            className="text-slate-400 hover:text-white px-2.5 transition-colors shrink-0"
                            title="Copy code"
                        >
                            <Icons.copy className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    {/* Code Content */}
                    <div className="flex-1 overflow-auto relative group">
                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Badge className="bg-white/10 text-white/50 hover:bg-white/20 hover:text-white cursor-default text-[10px] border-none backdrop-blur-sm">
                                {tabs.find(t => t.id === activeTab)?.label}
                            </Badge>
                        </div>
                        <pre className="p-4 text-[11px] font-mono text-slate-300 leading-relaxed tab-4">
                            <code>{activeCode}</code>
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};
