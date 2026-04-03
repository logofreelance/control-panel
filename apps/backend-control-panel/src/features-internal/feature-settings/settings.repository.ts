/**
 * feature-settings — Database Access Layer
 * 
 * 🤖 AI: All SQL queries for the `site_settings` table live here.
 * Uses Internal DB (Control Panel's own database).
 */

import type { InternalDatabaseConnection } from '../internal.db';
import type { SettingsRow } from './settings.types';

export async function findAllSettings(db: InternalDatabaseConnection): Promise<SettingsRow[]> {
    const res: any = await db.execute('SELECT * FROM site_settings');
    const rows = Array.isArray(res) ? res : (res.rows || []);
    return rows as SettingsRow[];
}

export async function findSettingByKey(db: InternalDatabaseConnection, key: string): Promise<SettingsRow | null> {
    const res: any = await db.execute('SELECT * FROM site_settings WHERE setting_key = ?', [key]);
    const rows = Array.isArray(res) ? res : (res.rows || []);
    return rows.length > 0 ? rows[0] as SettingsRow : null;
}

export async function upsertSetting(db: InternalDatabaseConnection, key: string, value: string): Promise<void> {
    const existing = await findSettingByKey(db, key);
    if (existing) {
        await db.execute('UPDATE site_settings SET setting_value = ? WHERE setting_key = ?', [value, key]);
    } else {
        await db.execute(
            'INSERT INTO site_settings (id, setting_key, setting_value) VALUES (?, ?, ?)',
            [crypto.randomUUID(), key, value]
        );
    }
}
