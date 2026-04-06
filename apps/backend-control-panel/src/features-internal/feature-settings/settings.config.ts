/**
 * feature-settings — Route Path Constants
 * 
 * 🤖 AI: All HTTP endpoints for the Settings feature are defined here.
 */

export const SETTINGS_ROUTE_PATHS = {
    getAll: '/',
    update: '/',
} as const;

/**
 * Valid setting keys stored in `site_settings` table.
 * Used for validation during upsert operations.
 */
export const VALID_SETTING_KEYS = [
    'siteName',
    'siteTitle',
    'primaryColor',
    'faviconUrl',
    'metaDescription',
    'themePreset',
] as const;

export type SettingKey = typeof VALID_SETTING_KEYS[number];
