/**
 * feature-settings — Barrel Export
 * 
 * 🤖 AI: Single entry point for the Settings feature.
 * Import from '@/features/feature-settings' to access everything.
 */

export { settingsApi } from './api/settings.api';
export { useSettings } from './hooks/useSettings';
export { SettingsView } from './components/SettingsView';
export type { SiteSettings } from './types/settings.types';
