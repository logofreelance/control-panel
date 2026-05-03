/**
 * update-put/handler.ts
 */
import type { Context } from 'hono';
import { processUpdateSettings } from './logic';

export const handler = async (c: Context) => {
    try {
        const body = await c.req.json();
        const db = c.get('internalDb' as any);
        
        if (!db) {
            console.error('[SETTINGS_UPDATE] Internal DB connection missing in context');
            return c.json({ success: false, error: { message: 'Internal Database connection not available' } }, 500);
        }

        await processUpdateSettings(db, body);
        return c.json({ success: true, message: 'Settings updated successfully' });
    } catch (err: any) {
        console.error('[SETTINGS_UPDATE_ERROR]', err);
        
        // Distinguish between validation errors (400) and other errors (500)
        const isValidationError = err.message.includes('Invalid') || err.message.includes('format');
        const statusCode = isValidationError ? 400 : 500;
        
        return c.json({ 
            success: false, 
            error: { 
                message: err.message || 'An unexpected error occurred during settings update' 
            } 
        }, statusCode);
    }
};
