import { Context } from 'hono';
import { DataSourceService } from '../services/data-source';
import { SchemaService } from '../services/schema';
import { DataService } from '../services/data';
import { RelationService } from '../services/relation';
import { ResourceService } from '../services/resource';
import { ResolverService } from '../services/resolver';
import { API_PARAM_KEYS, URL_PREFIXES, HEADER_KEYS } from '../config/constants';
import { LABELS } from '../config/labels';
import { UserContext } from '../types';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { HEADERS, HTTP_METHODS, CHARS, API_STATUS, CONTEXT_KEYS } from '../config/constants';

const MSG = LABELS;

export class DataSourceHonoHandlers {
    constructor(private service: DataSourceService) { }

    list = async (c: Context) => {
        try {
            const { archived } = c.req.query();
            const data = await this.service.list(archived === API_PARAM_KEYS.TRUE);
            return c.json({ status: API_STATUS.SUCCESS, data });
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }

    stats = async (c: Context) => {
        try {
            const result = await this.service.getStats();
            return c.json({ status: API_STATUS.SUCCESS, data: result });
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }

    get = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_PARAM_KEYS.ID) as string);
            const data = await this.service.getById(id);
            return c.json({ status: API_STATUS.SUCCESS, data });
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, e.message === MSG.ERROR.NOT_FOUND ? 404 : 500);
        }
    }

    create = async (c: Context) => {
        try {
            const payload = await c.req.json();
            const result = await this.service.create(payload);
            return c.json({ status: API_STATUS.SUCCESS, data: result }, 201);
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }

    update = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_PARAM_KEYS.ID) as string);
            const payload = await c.req.json();
            const result = await this.service.update(id, payload);
            return c.json({ status: API_STATUS.SUCCESS, data: result });
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }

    archive = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_PARAM_KEYS.ID) as string);
            const result = await this.service.archive(id);
            return c.json({ status: API_STATUS.SUCCESS, data: result });
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }

    restore = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_PARAM_KEYS.ID) as string);
            const result = await this.service.restore(id);
            return c.json({ status: API_STATUS.SUCCESS, data: result });
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }

    destroy = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_PARAM_KEYS.ID) as string);
            const { force } = c.req.query();
            const result = await this.service.destroy(id, force === API_PARAM_KEYS.TRUE);
            return c.json({ status: API_STATUS.SUCCESS, data: result });
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }
}

export class SchemaHonoHandlers {
    constructor(private service: SchemaService) { }

    addColumn = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_PARAM_KEYS.ID) as string);
            const payload = await c.req.json();
            const result = await this.service.addColumn(id, payload);
            return c.json({ status: API_STATUS.SUCCESS, ...result });
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }

    modifyColumn = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_PARAM_KEYS.ID) as string);
            const name = c.req.param(API_PARAM_KEYS.COLUMN_NAME) as string;
            const payload = await c.req.json();
            const result = await this.service.modifyColumn(id, name, payload);
            return c.json({ status: API_STATUS.SUCCESS, ...result });
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }

    dropColumn = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_PARAM_KEYS.ID) as string);
            const name = c.req.param(API_PARAM_KEYS.COLUMN_NAME) as string;
            const result = await this.service.dropColumn(id, name);
            return c.json({ status: API_STATUS.SUCCESS, ...result });
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }

    getColumns = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_PARAM_KEYS.ID) as string);
            const result = await this.service.getColumns(id);
            return c.json({ status: API_STATUS.SUCCESS, data: result });
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }
}

export class DataHonoHandlers {
    constructor(private service: DataService) { }

    insert = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_PARAM_KEYS.ID) as string);
            const payload = await c.req.json();
            const result = await this.service.insertRow(id, payload);
            return c.json({ status: API_STATUS.SUCCESS, ...result }, 201);
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }

    update = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_PARAM_KEYS.ID) as string);
            const rowId = parseInt(c.req.param(API_PARAM_KEYS.ROW_ID) as string);
            const payload = await c.req.json();
            const result = await this.service.updateRow(id, rowId, payload);
            return c.json({ status: API_STATUS.SUCCESS, ...result });
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }

    delete = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_PARAM_KEYS.ID) as string);
            const rowId = parseInt(c.req.param(API_PARAM_KEYS.ROW_ID) as string);
            const result = await this.service.deleteRow(id, rowId);
            return c.json({ status: API_STATUS.SUCCESS, ...result });
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }

    bulkInsert = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_PARAM_KEYS.ID) as string);
            const payload = await c.req.json();
            const result = await this.service.bulkInsert(id, payload);
            return c.json({ status: API_STATUS.SUCCESS, ...result }, 201);
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }

    bulkDelete = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_PARAM_KEYS.ID) as string);
            const payload = await c.req.json();
            const result = await this.service.bulkDelete(id, payload);
            return c.json({ status: API_STATUS.SUCCESS, ...result });
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }
}

export class RelationHonoHandlers {
    constructor(private service: RelationService) { }

    list = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_PARAM_KEYS.ID) as string);
            const result = await this.service.list(id);
            return c.json({ status: API_STATUS.SUCCESS, data: result });
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }

    create = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_PARAM_KEYS.ID) as string);
            const { type, targetId, alias } = await c.req.json();
            const result = await this.service.add(id, type, targetId, alias);
            return c.json({ status: API_STATUS.SUCCESS, ...result }, 201);
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }

    targets = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_PARAM_KEYS.ID) as string);
            const result = await this.service.getAvailableTargets(id);
            return c.json({ status: API_STATUS.SUCCESS, data: result });
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }

    update = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_PARAM_KEYS.ID) as string);
            const name = c.req.param(API_PARAM_KEYS.RELATION_NAME) as string;
            const updates = await c.req.json();
            const result = await this.service.update(id, name, updates);
            return c.json({ status: API_STATUS.SUCCESS, ...result });
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }

    delete = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_PARAM_KEYS.ID) as string);
            const name = c.req.param(API_PARAM_KEYS.RELATION_NAME) as string;
            const result = await this.service.delete(id, name);
            return c.json({ status: API_STATUS.SUCCESS, ...result });
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }
}

export class ResourceHonoHandlers {
    constructor(private service: ResourceService) { }

    list = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_PARAM_KEYS.ID) as string);
            const result = await this.service.list(id);
            return c.json({ status: API_STATUS.SUCCESS, data: result });
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }

    create = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_PARAM_KEYS.ID) as string);
            const payload = await c.req.json();
            const result = await this.service.create(id, payload);
            return c.json({ status: API_STATUS.SUCCESS, ...result }, 201);
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }

    update = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_PARAM_KEYS.RESOURCE_ID) as string);
            const payload = await c.req.json();
            const result = await this.service.update(id, payload);
            return c.json({ status: API_STATUS.SUCCESS, ...result });
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }

    delete = async (c: Context) => {
        try {
            const id = parseInt(c.req.param(API_PARAM_KEYS.RESOURCE_ID) as string);
            const result = await this.service.delete(id);
            return c.json({ status: API_STATUS.SUCCESS, ...result });
        } catch (error: unknown) {
            const e = error as Error;
            return c.json({ message: e.message, status: API_STATUS.ERROR }, 500);
        }
    }
}

export class ResolverHonoHandlers {
    constructor(private service: ResolverService) { }

    resolve = async (c: Context) => {
        const user = c.get(CONTEXT_KEYS.USER) as UserContext | null;

        const fullPath = c.req.path;
        const path = fullPath.replace(new RegExp('^' + URL_PREFIXES.API), CHARS.EMPTY);

        const method = c.req.method;

        let body: Record<string, unknown> = {};
        const methodsWithBody = [HTTP_METHODS.POST, HTTP_METHODS.PUT, HTTP_METHODS.PATCH] as string[];
        if (methodsWithBody.includes(method)) {
            try { body = await c.req.json(); } catch { /* empty */ }
        }

        const ip = c.req.header(HEADERS.X_FORWARDED_FOR) || c.req.header(HEADERS.X_REAL_IP) || CHARS.EMPTY;
        const userAgent = c.req.header(HEADERS.USER_AGENT) || CHARS.EMPTY;

        const result = await this.service.resolve(path, method, user, body, ip, userAgent);
        return c.json(result.body, result.status as ContentfulStatusCode);
    }
}
