/**
 * update-put/model.ts
 */
export async function updateSetting(db: any, key: string, value: string): Promise<void> {
    await db.execute(
        'INSERT INTO panel_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, value, value]
    );
}
