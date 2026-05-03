/**
 * update-put/model.ts
 */
import { executeSafe } from '../../internal.db';

export async function updateSetting(db: any, key: string, value: string): Promise<void> {
    if (!db) throw new Error('Database connection is missing in model');
    
    await executeSafe(
        db,
        'INSERT INTO panel_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, value, value]
    );
}
