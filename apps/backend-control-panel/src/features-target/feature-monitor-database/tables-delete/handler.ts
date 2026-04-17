/**
 * tables-delete/handler.ts
 */

import { Context } from 'hono';
import * as logic from './logic';

export const handler = async (c: Context) => {
    try {
        const db = c.get('targetDb');
        const tableName = c.req.param('name');
        
        if (!db) {
            return c.json({ status: 'error', message: 'Target database connection not established' }, 400);
        }

        if (!tableName) {
            return c.json({ status: 'error', message: 'Table name is required' }, 400);
        }

        await logic.secureDropTable(db, tableName);
        
        return c.json({ 
            status: 'success', 
            message: `Table '${tableName}' dropped successfully`,
            data: { tableName } 
        });
    } catch (err: any) {
        // Check for specific error status
        const isForbidden = err.message.includes('cannot be deleted');
        console.error("[TABLES-DELETE-ERROR]", err);
        return c.json({ status: 'error', message: err.message }, isForbidden ? 403 : 500);
    }
};
