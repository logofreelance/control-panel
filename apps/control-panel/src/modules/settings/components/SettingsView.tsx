/* eslint-disable react/jsx-no-literals */
'use client';

/**
 * SettingsView - Site branding and SEO configuration
 * Manages site name, colors, meta description, and favicon
 * PURE DI: Uses @cp/config labels and Icons
 */

import { Button, Input } from '@cp/ui';
import { Icons, getSettingsTranslation } from '@cp/config/client';
import { SETTINGS_LABELS } from '@cp/settings-manager';
import { useSettings } from '../composables';


const L = SETTINGS_LABELS;
const t = getSettingsTranslation; // Helper alias

// Color palette for primary color picker
// Extended color palette
const COLOR_PALETTE = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#6366F1', // Indigo
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#EC4899', // Pink
    '#8B5CF6', // Violet
    '#14B8A6', // Teal
    '#06B6D4', // Cyan
    '#F43F5E', // Rose
    '#84CC16', // Lime
    '#64748B', // Slate
];

export const SettingsView = () => {
    const { settings, setSettings, loading, saveSettings, saving } = useSettings();

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await saveSettings(settings);
    };

    const updateField = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const LoadingOverlay = () => (
        <div className="absolute inset-0 bg-white z-10 flex items-center justify-center rounded-xl">
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin shadow-sm" />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header - Always visible */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Icons.settings className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">{L.title ? t(L.title) : 'Settings'}</h1>
                    <p className="text-sm text-slate-500">{L.subtitle ? t(L.subtitle) : 'Site Configuration'}</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Brand Section */}
                    <div className="bg-white rounded-xl p-6 ring-1 ring-slate-100 h-fit relative min-h-[200px]">
                        {loading && <LoadingOverlay />}
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                <Icons.tag className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-slate-700 text-sm">{t(L.sections.brand)}</h3>
                        </div>
                        <div className="space-y-5">
                            <Input
                                label={t(L.labels.siteName)}
                                value={settings.siteName}
                                onChange={(e) => updateField('siteName', e.target.value)}
                                required
                            />
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-3">{t(L.labels.primaryColor)}</label>
                                <div className="grid grid-cols-6 gap-2 mb-3">
                                    {COLOR_PALETTE.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => updateField('primaryColor', c)}
                                            className={"w-7 h-7 rounded-full ring-2 transition-all mx-auto " + (settings.primaryColor === c ? 'ring-slate-400 ring-offset-2 scale-110' : 'ring-transparent hover:ring-slate-200 hover:ring-offset-1')}
                                            style={{ backgroundColor: c }}
                                            title={c}
                                        />
                                    ))}
                                </div>
                                <Input
                                    value={settings.primaryColor}
                                    onChange={(e) => updateField('primaryColor', e.target.value)}
                                    className="font-mono text-center text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SEO Section */}
                    <div className="bg-white rounded-xl p-6 ring-1 ring-slate-100 lg:col-span-2 relative min-h-[200px]">
                        {loading && <LoadingOverlay />}
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                <Icons.search className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-slate-700 text-sm">{t(L.sections.seo)}</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-5">
                                    <Input
                                        label={t(L.labels.metaTitle)}
                                        value={settings.siteTitle}
                                        onChange={(e) => updateField('siteTitle', e.target.value)}
                                        required
                                    />
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-2">{t(L.labels.metaDescription)}</label>
                                        <textarea
                                            className="w-full px-4 py-3 rounded-lg bg-slate-50 border-none text-slate-900 text-sm focus:ring-1 focus:ring-[var(--primary)] outline-none min-h-[100px] resize-none"
                                            value={settings.metaDescription}
                                            onChange={(e) => updateField('metaDescription', e.target.value)}
                                            placeholder={t(L.labels.descriptionPlaceholder)}
                                        />
                                    </div>
                                </div>

                                {/* SEO Preview Integrated */}
                                <div className="bg-slate-50/50 rounded-xl p-5 ring-1 ring-slate-100/50 h-fit">
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase mb-3 tracking-wide">{t(L.labels.searchPreview)}</p>
                                    <div className="space-y-1.5 pointer-events-none select-none">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                                                {settings.siteName ? settings.siteName.charAt(0) : 'S'}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-medium text-slate-700">{settings.siteName}</p>
                                                <p className="text-[9px] text-slate-400">example.com</p>
                                            </div>
                                        </div>
                                        <p className="text-blue-600 font-medium text-sm leading-snug">
                                            {settings.siteName} {t(L.labels.separator)} {settings.siteTitle}
                                        </p>
                                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                                            {settings.metaDescription || t(L.labels.defaultMetaDescription)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Assets Section */}
                    <div className="bg-white rounded-xl p-6 ring-1 ring-slate-100 lg:col-span-3 relative min-h-[100px]">
                        {loading && <LoadingOverlay />}
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                <Icons.image className="w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-slate-700 text-sm">{t(L.sections.assets)}</h3>
                        </div>
                        <div className="max-w-md">
                            <label className="block text-xs font-medium text-slate-500 mb-2">{t(L.labels.favicon)}</label>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-300 shrink-0">
                                    {settings.faviconUrl ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={settings.faviconUrl} alt="favicon" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <Icons.camera className="w-5 h-5" />
                                    )}
                                </div>
                                <Input
                                    className="flex-1 text-xs"
                                    placeholder={t(L.labels.faviconPlaceholder)}
                                    value={settings.faviconUrl}
                                    onChange={(e) => updateField('faviconUrl', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white rounded-xl ring-1 ring-slate-100">
                    <p className="text-xs text-slate-500">{t(L.labels.changesAppliedNote)}</p>
                    <Button type="submit" isLoading={saving} className="w-full sm:w-auto px-6 gap-2">
                        <Icons.save className="w-3.5 h-3.5" /> {t(L.buttons.save)}
                    </Button>
                </div>
            </form>
        </div>
    );
};

