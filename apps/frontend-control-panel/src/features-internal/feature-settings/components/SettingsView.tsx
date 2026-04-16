'use client';

/**
 * SettingsView - Refactored sesuai Aturan Refactor UI
 *
 * Perubahan:
 * - text-xs, text-sm → text-base minimum
 * - font-medium, font-bold, font-semibold pada non-heading → font-normal
 * - Semua heading maksimal font-semibold
 * - Tidak ada tracking-*
 * - Tidak ada text color opacity (/50, /40, dll)
 * - Tidak ada warna hardcoded (bg-white, border-black/5, dll)
 * - Tidak ada spacing terlalu dalam (p-8, p-10, gap-12, dll)
 * - Card tidak dikustomisasi className
 * - Tidak ada bg-primary/5 atau border-border/10 (opacity pada warna)
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
  Label,
} from '@/components/ui';
import { Icons } from '@/lib/config/client';
import { useSettings } from '../hooks/useSettings';
import { cn } from '@/lib/utils';
import { TextHeading } from '@/components/ui/text-heading';
import { InternalLayout } from '@/components/layout/InternalLayout';

const LIGHT_PRESETS = [
  { name: 'simetri', label: 'simetri', color: 'oklch(0.556 0.22 27.325)' },
  { name: 'emerald', label: 'emerald', color: 'oklch(0.65 0.18 155)' },
  { name: 'royal', label: 'royal', color: 'oklch(0.55 0.22 290)' },
  { name: 'slate', label: 'slate', color: 'oklch(0.45 0.05 260)' },
  { name: 'rose', label: 'rose', color: 'oklch(0.65 0.18 5)' },
  { name: 'amber', label: 'amber', color: 'oklch(0.7 0.18 75)' },
];

const DARK_PRESETS = [
  { name: 'midnight', label: 'midnight', color: 'oklch(0.7 0.15 250)' },
  { name: 'ebony', label: 'ebony', color: 'oklch(0.985 0 0)' },
  { name: 'onyx', label: 'onyx', color: 'oklch(0.6 0.22 290)' },
  { name: 'forest', label: 'forest', color: 'oklch(0.65 0.18 150)' },
  { name: 'carbon', label: 'carbon', color: 'oklch(0.55 0.05 240)' },
  { name: 'abyss', label: 'abyss', color: 'oklch(0.4 0.25 250)' },
];

const COLOR_PALETTE = [
  '#FF4136',
  '#3B82F6',
  '#10B981',
  '#6366F1',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
  '#8B5CF6',
  '#14B8A6',
  '#06B6D4',
  '#F43F5E',
  '#84CC16',
];

export function SettingsView() {
  const {
    settings,
    setSettings,
    loading,
    saveSettings,
    saving,
    applyThemeColor,
    applyThemePreset,
  } = useSettings();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(settings);
  };

  const updateField = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (key === 'primaryColor' && typeof value === 'string') {
      applyThemeColor(value);
    }
    if (key === 'themePreset' && typeof value === 'string') {
      applyThemePreset(value);
    }
  };

  const handleApplyPreset = (presetName: string) => {
    const preset = [...LIGHT_PRESETS, ...DARK_PRESETS].find((p) => p.name === presetName);
    if (!preset) return;
    updateField('themePreset', presetName);
    updateField('primaryColor', preset.color);
  };

  return (
    <InternalLayout>
      <form onSubmit={handleSave} className="relative pb-6 animate-in fade-in duration-500">
        {/* HERO */}
        <div className="relative w-full border-b border-border">
          <div className="container mx-auto px-4 md:px-6 pt-6 pb-6 relative z-10">
            <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <TextHeading size="h3" className="lowercase">
                  system settings
                </TextHeading>
                <p className="text-muted-foreground text-lg md:text-xl font-normal max-w-xl leading-relaxed lowercase">
                  manage global system identity, branding assets, and seo performance.
                </p>
              </div>
              <Button type="submit" size="lg" disabled={saving || loading} isLoading={saving}>
                <Icons.save className="size-5 mr-3" />
                save changes
              </Button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="container mx-auto px-4 md:px-6 py-6 relative z-20">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* ── IDENTITY CARD ── */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-primary">
                    <Icons.sparkles className="size-5" />
                  </div>
                  <TextHeading size="h4" className="lowercase">
                    identity & visuals
                  </TextHeading>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <TextHeading size="h5" className="lowercase">
                        platform identity
                      </TextHeading>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-muted-foreground lowercase">site name</Label>
                          <Input
                            value={settings.siteName}
                            onChange={(e) => updateField('siteName', e.target.value)}
                            required
                            className="h-12 bg-background border-border text-base font-normal rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground lowercase">favicon asset</Label>
                          <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0">
                              {settings.faviconUrl ? (
                                <img
                                  src={settings.faviconUrl}
                                  alt="favicon"
                                  className="size-full object-contain p-2"
                                />
                              ) : (
                                <Icons.image className="size-5 text-muted-foreground" />
                              )}
                            </div>
                            <Input
                              placeholder="url to favicon"
                              value={settings.faviconUrl}
                              onChange={(e) => updateField('faviconUrl', e.target.value)}
                              className="h-12 text-base font-normal bg-background rounded-xl"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <TextHeading size="h5" className="lowercase">
                        visual atmosphere
                      </TextHeading>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-muted-foreground lowercase">light themes</Label>
                          <div className="flex flex-wrap gap-2.5">
                            {LIGHT_PRESETS.map((preset) => (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => handleApplyPreset(preset.name)}
                                className={cn(
                                  'group flex items-center gap-3 pr-4 pl-1.5 py-1.5 rounded-full border transition-all',
                                  settings.themePreset === preset.name
                                    ? 'border-foreground bg-foreground text-background'
                                    : 'border-border bg-muted hover:bg-accent',
                                )}
                              >
                                <div
                                  className="size-5 rounded-full shrink-0 border border-border"
                                  style={{ backgroundColor: preset.color }}
                                />
                                <span className="text-base font-normal lowercase">
                                  {preset.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-muted-foreground lowercase">dark themes</Label>
                          <div className="flex flex-wrap gap-2.5">
                            {DARK_PRESETS.map((preset) => (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => handleApplyPreset(preset.name)}
                                className={cn(
                                  'group flex items-center gap-3 pr-4 pl-1.5 py-1.5 rounded-full border transition-all',
                                  settings.themePreset === preset.name
                                    ? 'border-foreground bg-foreground text-background'
                                    : 'border-border bg-muted hover:bg-accent',
                                )}
                              >
                                <div
                                  className="size-5 rounded-full shrink-0 border border-border"
                                  style={{ backgroundColor: preset.color }}
                                />
                                <span className="text-base font-normal lowercase">
                                  {preset.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-border">
                          <Label className="text-muted-foreground lowercase">color tune</Label>
                          <div className="flex flex-wrap gap-2">
                            {COLOR_PALETTE.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => updateField('primaryColor', c)}
                                className={cn(
                                  'size-7 rounded-full transition-all border-2',
                                  settings.primaryColor === c
                                    ? 'border-foreground ring-4 ring-ring scale-110'
                                    : 'border-transparent hover:scale-105',
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
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-primary">
                    <Icons.search className="size-5" />
                  </div>
                  <TextHeading size="h4" className="lowercase">
                    search visibility
                  </TextHeading>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground lowercase">meta subject</Label>
                      <Input
                        value={settings.siteTitle}
                        onChange={(e) => updateField('siteTitle', e.target.value)}
                        required
                        className="h-12 bg-background border-border text-base font-normal rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground lowercase">meta description</Label>
                      <Textarea
                        className="min-h-[140px] rounded-2xl p-4 bg-background border-border text-base leading-relaxed resize-none font-normal"
                        value={settings.metaDescription}
                        onChange={(e) => updateField('metaDescription', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="p-6 rounded-2xl bg-background border border-border space-y-4 select-none relative max-w-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-base font-normal border border-border">
                          {settings.siteName ? settings.siteName.charAt(0) : 'S'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-normal lowercase">
                            {settings.siteName}
                          </span>
                          <span className="text-base text-muted-foreground lowercase">
                            https://control-panel.io
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <TextHeading
                          size="h5"
                          as="h3"
                          className="text-primary md:text-xl leading-snug lowercase"
                        >
                          {settings.siteTitle || 'control panel interface'}
                        </TextHeading>
                        <p className="text-muted-foreground text-base leading-relaxed line-clamp-3 font-normal lowercase">
                          {settings.metaDescription ||
                            'experience a professional luxury minimalist interface.'}
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
      </form>
    </InternalLayout>
  );
}
