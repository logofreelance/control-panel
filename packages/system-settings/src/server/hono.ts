/**
 * packages/settings/src/server/hono.ts
 * 
 * Hono Adapter for Settings Module
 * Encapsulates all HTTP logic within the package.
 */

import { Context } from 'hono';
import { ISettingsService } from '@modular/contracts';
import { SiteSettings } from '../types';
import { SETTINGS_LABELS } from '../config/labels';
import { SETTINGS_SYSTEM } from '../config/constants';

const MSG = SETTINGS_LABELS.messages;
const SYS = SETTINGS_SYSTEM;

// Helper for standard response format
const response = (c: Context, status: typeof SYS.STATUS.SUCCESS | typeof SYS.STATUS.ERROR, data: unknown = null, message?: string) => {
    return c.json({
        status,
        data,
        message,
        timestamp: new Date().toISOString(),
    }, status === SYS.STATUS.SUCCESS ? SYS.HTTP_CODE.OK : SYS.HTTP_CODE.INTERNAL_ERROR);
};

export class SettingsHonoHandlers {
    constructor(private service: ISettingsService) { }

    /**
     * GET /settings
     */
    get = async (c: Context) => {
        try {
            const settings = await this.service.getSettings();
            return response(c, SYS.STATUS.SUCCESS, settings);
        } catch (err: unknown) {
            console.error(SYS.LOGS.GET_ERROR, err);
            return response(c, SYS.STATUS.ERROR, null, MSG.loadFailed);
        }
    }

    /**
     * POST /settings
     */
    update = async (c: Context) => {
        try {
            const payload = await c.req.json() as Partial<SiteSettings>;
            await this.service.updateSettings(payload);
            return response(c, SYS.STATUS.SUCCESS, null, MSG.saveSuccess);
        } catch (err: any) {
            console.error(SYS.LOGS.UPDATE_ERROR, err);
            return response(c, SYS.STATUS.ERROR, null, MSG.saveFailed);
        }
    }
}
