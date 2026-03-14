/**
 * packages/storage/src/server/hono.ts
 * 
 * Hono Adapter for Storage Module
 * Zero Hardcode & Framework Agnostic Logic
 */

import { Context } from 'hono';
import { StorageService } from '../service';
import { STORAGE_LABELS } from '../config/labels';
import { STORAGE_SYSTEM } from '../config/constants';
// No @cp/config or @modular/database imports!

const MSG = STORAGE_LABELS.messages;
const SYS = STORAGE_SYSTEM;

// Helper for standard response
const response = (c: Context, status: typeof SYS.STATUS.SUCCESS | typeof SYS.STATUS.ERROR, data: unknown = null, message?: string): Response => {
    return c.json({
        status,
        data,
        message,
        timestamp: new Date().toISOString(),
    }, status === SYS.STATUS.SUCCESS ? SYS.HTTP_CODE.OK : SYS.HTTP_CODE.INTERNAL_ERROR);
};

export class StorageHonoHandlers {
    // Service is injected
    constructor(private service: StorageService) { }

    /**
     * GET /stats
     * Get Database Storage Statistics
     */
    getStats = async (c: Context): Promise<Response> => {
        try {
            // Strict Mode: DB Name comes from Query Param or defaults to 'modularengine'
            const dbName = c.req.query('db') || 'modularengine';

            const stats = await this.service.getStats(dbName);
            return response(c, SYS.STATUS.SUCCESS, stats);
        } catch (err: unknown) {
            console.error(SYS.LOGS.STATS_ERROR, err);
            return response(c, SYS.STATUS.ERROR, null, MSG.loadFailed);
        }
    }

    /**
     * DELETE /tables/:name
     * Drop Table
     */
    deleteTable = async (c: Context): Promise<Response> => {
        try {
            const tableName = c.req.param(SYS.PARAMS.NAME);
            if (!tableName) return response(c, SYS.STATUS.ERROR, null, MSG.tableNameRequired);

            // Regex validation
            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
                return response(c, SYS.STATUS.ERROR, null, MSG.invalidTableName);
            }

            const dbName = c.req.query('db') || 'modularengine';
            const success = await this.service.dropTable(dbName, tableName);

            if (!success) return response(c, SYS.STATUS.ERROR, null, MSG.deleteFailed);

            return response(c, SYS.STATUS.SUCCESS, { tableName }, MSG.tableDeleted);
        } catch (err: unknown) {
            console.error(STORAGE_LABELS.logs.error, err);
            return response(c, SYS.STATUS.ERROR, null, MSG.deleteFailed);
        }
    }

    /**
     * POST /cleanup
     * Cleanup orphaned data
     */
    cleanup = async (c: Context): Promise<Response> => {
        try {
            const dbName = c.req.query('db') || 'modularengine';
            const result = await this.service.cleanupOrphaned(dbName);
            return response(c, SYS.STATUS.SUCCESS, result, MSG.cleanupCompleted);
        } catch (err: unknown) {
            console.error(STORAGE_LABELS.logs.cleanupWarning, err);
            return response(c, SYS.STATUS.ERROR, null, MSG.cleanupFailed);
        }
    }
}
