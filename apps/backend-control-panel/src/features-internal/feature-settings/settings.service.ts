/**
 * feature-settings — Business Logic Layer
 * 
 * 🤖 AI: Transforms raw DB rows ↔ structured SiteSettings object.
 * Validates input before writing to database.
 */

import type { InternalDatabaseConnection } from '../internal.db';
import { findAllSettings, upsertSetting } from './settings.repository';
import { VALID_SETTING_KEYS, type SettingKey } from './settings.config';
import type { SiteSettings, SettingsRow } from './settings.types';

/** Default values when a setting key has no stored value */
const DEFAULTS: SiteSettings = {
    siteName: 'Control Panel',
    siteTitle: 'Dashboard',
    primaryColor: '#3B82F6',
    faviconUrl: '',
    metaDescription: '',
};

/**
 * Transform raw DB rows into a flat SiteSettings object.
 * Missing keys are filled with defaults.
 */
export function rowsToSettingsMap(rows: SettingsRow[]): SiteSettings {
    const map: Record<string, string> = {};
    for (const row of rows) {
        map[row.setting_key] = row.setting_value;
    }

    return {
        siteName: map['siteName'] ?? DEFAULTS.siteName,
        siteTitle: map['siteTitle'] ?? DEFAULTS.siteTitle,
        primaryColor: map['primaryColor'] ?? DEFAULTS.primaryColor,
        faviconUrl: map['faviconUrl'] ?? DEFAULTS.faviconUrl,
        metaDescription: map['metaDescription'] ?? DEFAULTS.metaDescription,
    };
}

/** Fetch all settings and return as a structured object */
export async function getSettingsMap(db: InternalDatabaseConnection): Promise<SiteSettings> {
    const rows = await findAllSettings(db);
    return rowsToSettingsMap(rows);
}

/** Validate and batch-upsert settings */
export async function updateSettings(db: InternalDatabaseConnection, settings: Partial<SiteSettings>): Promise<SiteSettings> {
    for (const [key, value] of Object.entries(settings)) {
        if (VALID_SETTING_KEYS.includes(key as SettingKey) && value !== undefined) {
            await upsertSetting(db, key, String(value));
        }
    }
    // Return the updated settings
    return getSettingsMap(db);
}
