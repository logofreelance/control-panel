/**
 * feature-settings — HTTP Handlers
 * 
 * 🤖 AI: Maps HTTP requests to service layer calls.
 * Response format: { success: true/false, data, message }
 */

import type { Context } from 'hono';
import type { InternalDatabaseConnection } from '../internal.db';
import { getSettingsMap, updateSettings } from './settings.service';
import { requireAuthOrRespond } from '../feature-auth/auth.middleware';

function respondSuccess(c: Context, data: any, message: string, statusCode = 200) {
    return c.json({ success: true, data, message }, statusCode as any);
}

function respondError(c: Context, errorCode: string, message: string, statusCode: number) {
    return c.json({ success: false, error: { code: errorCode, message } }, statusCode as any);
}

export async function handleGetSettings(c: Context, db: InternalDatabaseConnection) {
    const authError = requireAuthOrRespond(c);
    if (authError) return authError;
    
    try {
        const settings = await getSettingsMap(db);
        return respondSuccess(c, settings, 'Settings retrieved');
    } catch (err: any) {
        return respondError(c, 'SETTINGS_FETCH_FAILED', err.message, 500);
    }
}

export async function handleUpdateSettings(c: Context, db: InternalDatabaseConnection) {
    const authError = requireAuthOrRespond(c);
    if (authError) return authError;
    
    try {
        const body = await c.req.json();
        const updated = await updateSettings(db, body);
        return respondSuccess(c, updated, 'Settings updated successfully');
    } catch (err: any) {
        return respondError(c, 'SETTINGS_UPDATE_FAILED', err.message, 400);
    }
}
