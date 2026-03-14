/**
 * packages/system-api/src/server/hono.ts
 *
 * Hono Handlers for System API Package
 */

import { Context } from 'hono';
import { ApiKeysService, IApiKeysService } from '../services/api-keys';
import { CorsService, ICorsService } from '../services/cors';
import { ApiCategoriesService } from '../services/categories';
import { ApiEndpointsService } from '../services/endpoints';
import { ApiLogsService } from '../services/logs';
import {
    success,
    error,
    notFound,
    serverError,
    badRequest,
} from '../utils';
import { API_CONSTANTS } from '../config/constants';
import { API_LABELS } from '../config/labels';



export class ApiKeysHonoHandlers {
    constructor(private service: IApiKeysService) { }

    list = async (c: Context) => {
        try {
            const keys = await this.service.list();
            return success(c, keys);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            return serverError(c, message);
        }
    }

    create = async (c: Context) => {
        try {
            const body = await c.req.json();
            await this.service.create(body);
            return success(c, null, API_LABELS.SUCCESS.KEY_CREATED);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            return serverError(c, message);
        }
    }

    delete = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_CONSTANTS.PARAMS.ID) as string);
            await this.service.delete(id);
            return success(c, null, API_LABELS.SUCCESS.KEY_DELETED);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            return serverError(c, message);
        }
    }

    toggle = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_CONSTANTS.PARAMS.ID) as string);
            await this.service.toggle(id);
            return success(c, null, API_LABELS.SUCCESS.KEY_UPDATED);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            if (message === 'NOT_FOUND') return notFound(c, API_LABELS.ERRORS.NOT_FOUND);
            return serverError(c, message);
        }
    }
}

export class CorsHonoHandlers {
    constructor(private service: ICorsService) { }

    list = async (c: Context) => {
        try {
            const domains = await this.service.list();
            return success(c, domains);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            return serverError(c, message);
        }
    }

    create = async (c: Context) => {
        try {
            const { domain } = await c.req.json();
            await this.service.create(domain);
            return success(c, null, API_LABELS.SUCCESS.CORS_CREATED);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            return serverError(c, message);
        }
    }

    delete = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_CONSTANTS.PARAMS.ID) as string);
            await this.service.delete(id);
            return success(c, null, API_LABELS.SUCCESS.CORS_DELETED);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            return serverError(c, message);
        }
    }

    toggle = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_CONSTANTS.PARAMS.ID) as string);
            await this.service.toggle(id);
            return success(c, null, API_LABELS.SUCCESS.CORS_UPDATED);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            if (message === 'NOT_FOUND') return notFound(c, API_LABELS.ERRORS.NOT_FOUND);
            return serverError(c, message);
        }
    }
}

// ApiCategoriesHonoHandlers
export class ApiCategoriesHonoHandlers {
    constructor(private service: ApiCategoriesService) { }

    list = async (c: Context) => {
        try {
            const cats = await this.service.list();
            return success(c, cats);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            return serverError(c, message);
        }
    }

    save = async (c: Context) => {
        try {
            const body = await c.req.json();
            await this.service.save(body);
            return success(c, null, API_LABELS.SUCCESS.CATEGORY_SAVED);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            if (message === 'INVALID_NAME') return badRequest(c, API_LABELS.ERRORS.INVALID_NAME);
            return serverError(c, message);
        }
    }

    delete = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_CONSTANTS.PARAMS.ID) as string);
            await this.service.delete(id);
            return success(c, null, API_LABELS.SUCCESS.CATEGORY_DELETED);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            if (message === 'HAS_CHILDREN') return badRequest(c, API_LABELS.ERRORS.HAS_CHILDREN);
            if (message === 'CATEGORY_HAS_CHILDREN') return badRequest(c, API_LABELS.ERRORS.CATEGORY_HAS_CHILDREN);
            return serverError(c, message);
        }
    }
}

// ApiEndpointsHonoHandlers (No changes needed, already updated)
export class ApiEndpointsHonoHandlers {
    constructor(private service: ApiEndpointsService) { }
    // ... (rest is same)
    list = async (c: Context) => {
        try {
            const endpoints = await this.service.list();
            return success(c, endpoints);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            return serverError(c, message);
        }
    }

    save = async (c: Context) => {
        try {
            const body = await c.req.json();
            await this.service.save(body);
            return success(c, null, API_LABELS.SUCCESS.ENDPOINT_SAVED);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            if (message === 'INVALID_PATH') return badRequest(c, API_LABELS.ERRORS.INVALID_PATH);
            if (message === 'ALREADY_EXISTS') return error(c, API_LABELS.ERRORS.ALREADY_EXISTS, 409);
            if (message === 'INVALID_DATASOURCE') return badRequest(c, API_LABELS.ERRORS.INVALID_DATASOURCE);
            return serverError(c, message);
        }
    }

    detail = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_CONSTANTS.PARAMS.ID) as string);
            const endpoint = await this.service.getById(id);
            return success(c, endpoint);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            if (message === 'NOT_FOUND') return notFound(c, API_LABELS.ERRORS.NOT_FOUND);
            return serverError(c, message);
        }
    }

    stats = async (c: Context) => {
        try {
            const stats = await this.service.getStats();
            return success(c, stats);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            return serverError(c, message);
        }
    }

    check = async (c: Context) => {
        try {
            const path = c.req.query(API_CONSTANTS.PARAMS.PATH);
            const method = c.req.query(API_CONSTANTS.PARAMS.METHOD);
            const excludeId = c.req.query(API_CONSTANTS.PARAMS.ID) ? parseInt(c.req.query(API_CONSTANTS.PARAMS.ID)!) : undefined;

            if (!path || !method) return badRequest(c, API_LABELS.ERRORS.INVALID_PATH);

            const result = await this.service.checkDuplicate(path, method, excludeId);
            return success(c, result);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            return serverError(c, message);
        }
    }

    delete = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_CONSTANTS.PARAMS.ID) as string);
            await this.service.delete(id);
            return success(c, null, API_LABELS.SUCCESS.ENDPOINT_DELETED);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            return serverError(c, message);
        }
    }

    toggle = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_CONSTANTS.PARAMS.ID) as string);
            await this.service.toggle(id);
            return success(c, null, API_LABELS.SUCCESS.ENDPOINT_UPDATED);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            if (message === 'NOT_FOUND') return notFound(c, API_LABELS.ERRORS.NOT_FOUND);
            return serverError(c, message);
        }
    }
}


export class ApiLogsHonoHandlers {
    constructor(private service: ApiLogsService) { }

    list = async (c: Context) => {
        try {
            const limit = c.req.query(API_CONSTANTS.PARAMS.LIMIT) ? parseInt(c.req.query(API_CONSTANTS.PARAMS.LIMIT)!) : API_CONSTANTS.QUERY_LIMITS.DEFAULT_LOGS;
            const logs = await this.service.list(limit);
            return success(c, logs);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            return serverError(c, message);
        }
    }
}
