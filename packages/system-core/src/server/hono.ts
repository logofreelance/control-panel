import { Context } from 'hono';
import {
    getEnv,
    success,
    serverError,
    badRequest,
    API_PARAMS,
} from '../utils';
import { SystemService } from '../services/system';
import { CORE_LABELS } from '../config/labels';
import { IMonitorService, IErrorTemplateService } from '../types';

const E = CORE_LABELS.ERRORS;

export class MonitorHonoHandlers {
    constructor(private service: IMonitorService) { }

    getStats = async (c: Context) => {
        try {
            const stats = await this.service.getStats();
            return success(c, stats);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            return serverError(c, msg);
        }
    };
}

export class ErrorTemplateHonoHandlers {
    constructor(private service: IErrorTemplateService) { }

    list = async (c: Context) => {
        try {
            const res = await this.service.listTemplates();
            return success(c, res);
        } catch (e: unknown) {
            return serverError(c, String(e));
        }
    };

    getGlobal = async (c: Context) => {
        try {
            const res = await this.service.getGlobalTemplates();
            return success(c, res);
        } catch (e: unknown) {
            return serverError(c, String(e));
        }
    };

    resolve = async (c: Context) => {
        const statusCode = parseInt(c.req.param(API_PARAMS.STATUS_CODE) as string);
        const { routeId, categoryId } = c.req.query();
        try {
            const res = await this.service.resolveTemplate(statusCode, routeId, categoryId);
            return success(c, res);
        } catch (e: unknown) {
            return serverError(c, String(e));
        }
    };

    save = async (c: Context) => {
        const { scope, scopeId, statusCode, template } = await c.req.json();
        if (!statusCode || !template) return badRequest(c, E.REQUIRED_FIELDS);
        try {
            const res = await this.service.saveTemplate(scope, scopeId, statusCode, template);
            return success(c, null, res.message);
        } catch (e: unknown) {
            return serverError(c, String(e));
        }
    };

    delete = async (c: Context) => {
        const id = parseInt(c.req.param(API_PARAMS.ID) as string);
        try {
            const res = await this.service.deleteTemplate(id);
            return success(c, null, res.message);
        } catch (e: unknown) {
            return serverError(c, String(e));
        }
    };
}

export class SystemHonoHandlers {
    constructor(private service: SystemService) { }

    // System Status needs optional parameters
    getStatus = async (c: Context) => {
        const env = getEnv(c);
        console.log('[DEBUG HONO GET STATUS]: env.DATABASE_URL is', env.DATABASE_URL ? 'PRESENT' : 'MISSING', typeof env.DATABASE_URL);
        try {
            const status = await this.service.getSystemStatus(env.DATABASE_URL, env.CORS_ORIGIN, env.NODE_ENV);
            return c.json(status);
        } catch (e: unknown) {
            return serverError(c, String(e));
        }
    };

    validate = async (c: Context) => {
        const { dbUrl } = await c.req.json();
        try {
            const res = await this.service.validateDbUrl(dbUrl);
            return c.json(res);
        } catch (e: unknown) {
            return serverError(c, String(e));
        }
    };

    setup = async (c: Context) => {
        const { dbUrl } = await c.req.json();
        try {
            const res = await this.service.setupDb(dbUrl);
            return c.json(res);
        } catch (e: unknown) {
            return serverError(c, String(e));
        }
    };

    install = async (c: Context) => {
        const { username, password } = await c.req.json();
        const env = getEnv(c);
        if (!env.DATABASE_URL) return badRequest(c, E.DB_NOT_CONFIGURED);

        try {
            const res = await this.service.installAdmin(env.DATABASE_URL, username, password);
            return success(c, null, res.message);
        } catch (e: unknown) {
            return serverError(c, String(e));
        }
    };

    migrate = async (c: Context) => {
        const env = getEnv(c);
        if (!env.DATABASE_URL) return badRequest(c, E.DB_NOT_CONFIGURED);
        try {
            const res = await this.service.runMigrations(env.DATABASE_URL);
            return c.json(res);
        } catch (e: unknown) {
            return serverError(c, String(e));
        }
    };
}
