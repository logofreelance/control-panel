'use client';

/**
 * SettingsView - V2 Flat Luxury Sensation
 * 
 * STICKING TO RULES:
 * - Card Usage (refactor_card.md): Removed all manual shadows, borders, and rounding from <Card>.
 * - Lowercase Consistency: All static labels, headings, and descriptions are now lowercase.
 * - Spacing Integrity: Removed manual padding on <Card> where it conflicted with CardContent.
 * - Typography: Minimum font-size text-xs, no text-color opacity.
 */

import { useState } from 'react';
import { 
    Button, 
    Input, 
    Card, 
    CardContent, 
    CardHeader, 
    Badge,
    Textarea,
    Label
} from '@/components/ui';
import { Icons } from '@/lib/config/client';
import { useSettings } from '../hooks/useSettings';
import { cn } from '@/lib/utils';
import { TextHeading } from '@/components/ui/text-heading';
import { InternalLayout } from '@/components/layout/InternalLayout';

const THEME_PRESETS = [
    { name: 'simetri', label: 'simetri', color: 'oklch(0.556 0.22 27.325)' },
    { name: 'midnight', label: 'midnight', color: 'oklch(0.7 0.15 250)' },
    { name: 'emerald', label: 'emerald', color: 'oklch(0.65 0.18 155)' },
    { name: 'royal', label: 'royal', color: 'oklch(0.55 0.25 290)' },
    { name: 'slate', label: 'slate', color: 'oklch(0.45 0.05 260)' },
];

const COLOR_PALETTE = [
    '#FF4136', '#3B82F6', '#10B981', '#6366F1', '#F59E0B', '#EF4444',
    '#EC4899', '#8B5CF6', '#14B8A6', '#06B6D4', '#F43F5E', '#84CC16',
];

const CleanHeroBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-primary/5 to-transparent" />
    </div>
);

export function SettingsView() {
    const { settings, setSettings, loading, saveSettings, saving, applyThemeColor, applyThemePreset } = useSettings();

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await saveSettings(settings);
    };

    const updateField = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        if (key === 'primaryColor' && typeof value === 'string') {
            applyThemeColor(value);
        }
        if (key === 'themePreset' && typeof value === 'string') {
            applyThemePreset(value);
        }
    };

    const handleApplyPreset = (presetName: string) => {
        const preset = THEME_PRESETS.find(p => p.name === presetName);
        if (!preset) return;
        updateField('themePreset', presetName);
        updateField('primaryColor', preset.color);
    };

    return (
        <InternalLayout>
            <form onSubmit={handleSave} className="relative pb-24 animate-in fade-in duration-500">
                {/* COMPACT HERO */}
                <div className="relative overflow-hidden w-full border-b border-border/40">
                    <CleanHeroBackground />
                    <div className="container mx-auto px-4 md:px-12 pt-24 pb-12 md:pt-32 md:pb-14 relative z-10">
                        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
                            <div className="space-y-4">
                                <TextHeading size="h1" className="tracking-normal lowercase">
                                    system settings
                                </TextHeading>
                                <p className="text-muted-foreground text-lg font-medium max-w-xl leading-relaxed lowercase">
                                    manage global system identity, branding assets, and seo performance.
                                </p>
                            </div>
                            <Button 
                                type="submit" 
                                size="lg" 
                                disabled={saving || loading}
                                isLoading={saving}
                            >
                                <Icons.save className="size-5 mr-3" />
                                save changes
                            </Button>
                        </div>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="container mx-auto px-4 md:px-12 py-10 md:py-14 relative z-20">
                    <div className="max-w-6xl mx-auto space-y-10">
                        
                        {/* ── IDENTITY CARD ── */}
                        <Card className="overflow-hidden">
                            <CardHeader className="p-8 border-b border-border/10">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                        <Icons.sparkles className="size-5" />
                                    </div>
                                    <TextHeading size="h4" className="tracking-normal lowercase">identity & visuals</TextHeading>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 lg:p-10">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                                    
                                    {/* Left Column */}
                                    <div className="space-y-8">
                                        <div className="space-y-6">
                                            <TextHeading size="h4" className="tracking-normal lowercase">platform identity</TextHeading>
                                            <div className="space-y-8">
                                                <div className="space-y-3">
                                                    <Label className="ml-1 text-muted-foreground lowercase">site name</Label>
                                                    <Input
                                                        value={settings.siteName}
                                                        onChange={(e) => updateField('siteName', e.target.value)}
                                                        required
                                                        className="h-12 bg-background border-border/20 text-base font-normal rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="ml-1 text-muted-foreground lowercase">favicon asset</Label>
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-12 rounded-xl bg-muted border border-border/10 flex items-center justify-center overflow-hidden shrink-0">
                                                            {settings.faviconUrl ? (
                                                                <img src={settings.faviconUrl} alt="favicon" className="size-full object-contain p-2" />
                                                            ) : (
                                                                <Icons.image className="size-5 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <Input
                                                            placeholder="url to favicon"
                                                            value={settings.faviconUrl}
                                                            onChange={(e) => updateField('faviconUrl', e.target.value)}
                                                            className="h-12 text-sm font-normal bg-background rounded-xl"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-8">
                                        <div className="space-y-6">
                                            <TextHeading size="h4" className="tracking-normal lowercase">visual atmosphere</TextHeading>
                                            <div className="space-y-8">
                                                <div className="space-y-3">
                                                    <Label className="ml-1 text-muted-foreground lowercase">interface presets</Label>
                                                    <div className="flex flex-wrap gap-2.5">
                                                        {THEME_PRESETS.map((preset) => (
                                                            <button
                                                                key={preset.name}
                                                                type="button"
                                                                onClick={() => handleApplyPreset(preset.name)}
                                                                className={cn(
                                                                    "group flex items-center gap-3 pr-4 pl-1.5 py-1.5 rounded-full border transition-all",
                                                                    settings.themePreset === preset.name 
                                                                        ? 'border-foreground bg-foreground text-background shadow-none' 
                                                                        : 'border-border bg-muted/20 hover:bg-muted'
                                                                )}
                                                            >
                                                                <div className="size-5 rounded-full shrink-0 border border-black/5" style={{ backgroundColor: preset.color }} />
                                                                <span className="text-sm font-normal lowercase">{preset.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-3 pt-6 border-t border-border/10">
                                                    <Label className="ml-1 text-muted-foreground lowercase">color tune</Label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {COLOR_PALETTE.map((c) => (
                                                            <button
                                                                key={c}
                                                                type="button"
                                                                onClick={() => updateField('primaryColor', c)}
                                                                className={cn(
                                                                    "size-7 rounded-full transition-all border-2",
                                                                    settings.primaryColor === c 
                                                                        ? 'border-foreground ring-4 ring-primary/10 scale-110 shadow-none' 
                                                                        : 'border-transparent hover:scale-105'
                                                                )}
                                                                style={{ backgroundColor: c }}
                                                              />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* ── SEO SECTION ── */}
                        <Card className="overflow-hidden">
                            <CardHeader className="p-8 border-b border-border/10">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                        <Icons.search className="size-5" />
                                    </div>
                                    <TextHeading size="h4" className="tracking-normal lowercase">search visibility</TextHeading>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 lg:p-10">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <Label className="ml-1 text-muted-foreground lowercase">meta subject</Label>
                                            <Input
                                                value={settings.siteTitle}
                                                onChange={(e) => updateField('siteTitle', e.target.value)}
                                                required
                                                className="h-12 bg-background border-border/20 text-base font-normal rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="ml-1 text-muted-foreground lowercase">meta description</Label>
                                            <Textarea
                                                className="min-h-[140px] rounded-2xl p-4 bg-background border-border/20 text-base leading-relaxed resize-none font-normal"
                                                value={settings.metaDescription}
                                                onChange={(e) => updateField('metaDescription', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 lg:pt-8">
                                        <div className="p-8 rounded-[2rem] bg-background border border-border/40 space-y-4 select-none relative shadow-sm max-w-xl">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-sm font-semibold border">
                                                    {settings.siteName ? settings.siteName.charAt(0) : 'S'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-base font-semibold lowercase">{settings.siteName}</span>
                                                    <span className="text-xs text-muted-foreground lowercase">https://control-panel.io</span>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <TextHeading size="h4" as="h3" className="text-primary font-medium text-lg leading-snug lowercase">
                                                    {settings.siteTitle || 'control panel interface'}
                                                </TextHeading>
                                                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 font-normal lowercase">
                                                    {settings.metaDescription || 'experience a professional luxury minimalist interface.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* LOADER */}
                {loading && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100] flex items-center justify-center animate-in fade-in duration-300">
                        <div className="flex flex-col items-center gap-8">
                            <Icons.loading className="size-12 animate-spin text-primary" />
                            <TextHeading size="h4" className="font-medium uppercase text-xs lowercase">syncing environment</TextHeading>
                        </div>
                    </div>
                )}
            </form>
        </InternalLayout>
    );
}
