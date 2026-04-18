/**
 * update-put/logic.ts
 */
import * as model from './model';

export async function processUpdateSettings(db: any, settingsData: Record<string, any>) {
    if (!settingsData || typeof settingsData !== 'object') throw new Error('Invalid format');
    
    // Validate required fields
    const newDbUrl = settingsData['databaseUrl'] || settingsData['DATABASE_URL_INTERNAL_CONTROL_PANEL'];
    const newJwtSecret = settingsData['jwtSecret'] || settingsData['JWT_SECRET'];
    if (!newDbUrl) throw new Error('Database URL is required');
    if (!newJwtSecret) throw new Error('JWT Secret is required');

    await model.updateSetting(db, 'DATABASE_URL_INTERNAL_CONTROL_PANEL', newDbUrl);
    await model.updateSetting(db, 'JWT_SECRET', newJwtSecret);

    return true;
}
