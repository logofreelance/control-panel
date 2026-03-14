/**
 * packages/system-users/src/server/hono.ts
 *
 * Hono Handlers for System Users Package
 */

import { Context } from 'hono';
import { IUserService, IRolesService, IPermissionsService } from '@modular/contracts';
import { UsersService } from '../services/users';
import { RolesService } from '../services/roles';
import { PermissionsService } from '../services/permissions';
import {
    success,
    error,
    notFound,
    badRequest,
    serverError,
    paginated
} from '../utils/response';
import { USER_LABELS } from '../config/labels';
import { USER_SYSTEM } from '../config/constants';
import { UserListOptions } from '../types';

const MSG = USER_LABELS.messages;
const ERR = USER_SYSTEM.ERRORS;
const API_PARAMS = USER_SYSTEM.API_PARAMS;
const BACKEND_ERRORS = USER_SYSTEM.BACKEND_ERRORS;

export class UsersHonoHandlers {
    constructor(private service: IUserService) { }

    list = async (c: Context): Promise<Response> => {
        try {
            const query = c.req.query();
            const status = query.status as 'active' | 'inactive' | 'all' | undefined;
            const sort = query.sort as 'asc' | 'desc' | undefined;

            const options: UserListOptions = {
                search: query.search,
                role: query.role,
                status: status,
                sort: sort,
                page: query.page ? parseInt(query.page) : undefined,
                limit: query.limit ? parseInt(query.limit) : undefined,
            };

            const result = await this.service.list(options);
            return paginated(c, result.data, result.meta);
        } catch (err: unknown) {
            console.error(USER_LABELS.logs.error, err);
            return serverError(c, MSG.error);
        }
    }

    get = async (c: Context): Promise<Response> => {
        try {
            const id = parseInt(c.req.param(API_PARAMS.ID) as string);
            const user = await this.service.get(id);
            if (!user) return notFound(c, MSG.notFound);
            return success(c, user);
        } catch {
            return serverError(c, BACKEND_ERRORS.internalError);
        }
    }

    create = async (c: Context): Promise<Response> => {
        try {
            const body = await c.req.json();
            if (!body.username || !body.email || !body.password) {
                return badRequest(c, MSG.error); // Missing fields
            }

            await this.service.create(body);
            return success(c, null, MSG.created);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (err.message === ERR.ALREADY_EXISTS) return error(c, MSG.error, 409);
            if (err.message === ERR.ROLE_NOT_EXISTS) return badRequest(c, MSG.error);
            return serverError(c, BACKEND_ERRORS.internalError);
        }
    }

    update = async (c: Context): Promise<Response> => {
        try {
            const id = parseInt(c.req.param(API_PARAMS.ID) as string);
            const body = await c.req.json();

            await this.service.update(id, body);
            return success(c, null, MSG.updated);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (err.message === ERR.ROLE_NOT_EXISTS) return badRequest(c, MSG.error);
            if (err.message === ERR.NOT_FOUND) return notFound(c, MSG.notFound);
            return serverError(c, BACKEND_ERRORS.internalError);
        }
    }

    delete = async (c: Context): Promise<Response> => {
        try {
            const id = parseInt(c.req.param(API_PARAMS.ID) as string);
            await this.service.delete(id);
            return success(c, null, MSG.deleted);
        } catch {
            return serverError(c, BACKEND_ERRORS.internalError);
        }
    }

    toggleStatus = async (c: Context): Promise<Response> => {
        try {
            const id = parseInt(c.req.param(API_PARAMS.ID) as string);
            await this.service.toggleStatus(id);
            return success(c, null, MSG.statusUpdated);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (err.message === ERR.NOT_FOUND) return notFound(c, MSG.notFound);
            return serverError(c, BACKEND_ERRORS.internalError);
        }
    }
}

export class RolesHonoHandlers {
    constructor(private service: IRolesService) { }

    list = async (c: Context): Promise<Response> => {
        const query = c.req.query();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await this.service.list({ sort: query.sort as any });
        return success(c, result);
    }

    get = async (c: Context): Promise<Response> => {
        const id = parseInt(c.req.param(API_PARAMS.ID) as string);
        const role = await this.service.get(id);
        if (!role) return notFound(c, MSG.notFound);
        return success(c, role);
    }

    create = async (c: Context): Promise<Response> => {
        try {
            const body = await c.req.json();
            await this.service.create(body);
            return success(c, null, MSG.created);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (err.message === ERR.ALREADY_EXISTS) return error(c, MSG.error, 409);
            return serverError(c, MSG.error);
        }
    }

    update = async (c: Context): Promise<Response> => {
        try {
            const id = parseInt(c.req.param(API_PARAMS.ID) as string);
            const body = await c.req.json();
            await this.service.update(id, body);
            return success(c, null, MSG.updated);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (err.message === ERR.NOT_FOUND) return notFound(c, MSG.notFound);
            return serverError(c, MSG.error);
        }
    }

    delete = async (c: Context): Promise<Response> => {
        try {
            const id = parseInt(c.req.param(API_PARAMS.ID) as string);
            await this.service.delete(id);
            return success(c, null, MSG.deleted);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (err.message === ERR.NOT_FOUND) return notFound(c, MSG.notFound);
            return serverError(c, MSG.error);
        }
    }

    checkSuper = async (c: Context): Promise<Response> => {
        const roleName = c.req.param('roleName') as string;
        const isSuper = await this.service.checkSuper(roleName);
        return success(c, { isSuper });
    }
}

export class PermissionsHonoHandlers {
    constructor(private service: IPermissionsService) { }

    list = async (c: Context): Promise<Response> => {
        const result = await this.service.list();
        return success(c, result);
    }

    get = async (c: Context): Promise<Response> => {
        const id = parseInt(c.req.param(API_PARAMS.ID) as string);
        const perm = await this.service.get(id);
        if (!perm) return notFound(c, MSG.notFound);
        return success(c, perm);
    }

    create = async (c: Context): Promise<Response> => {
        try {
            const body = await c.req.json();
            await this.service.create(body);
            return success(c, null, MSG.created);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (err.message === ERR.ALREADY_EXISTS) return error(c, MSG.error, 409);
            return serverError(c, MSG.error);
        }
    }

    update = async (c: Context): Promise<Response> => {
        try {
            const id = parseInt(c.req.param(API_PARAMS.ID) as string);
            const body = await c.req.json();
            await this.service.update(id, body);
            return success(c, null, MSG.updated);
        } catch {
            return serverError(c, MSG.error);
        }
    }

    delete = async (c: Context): Promise<Response> => {
        try {
            const id = parseInt(c.req.param(API_PARAMS.ID) as string);
            await this.service.delete(id);
            return success(c, null, MSG.deleted);
        } catch {
            return serverError(c, MSG.error);
        }
    }

    getRolePermissions = async (c: Context): Promise<Response> => {
        const roleName = c.req.param('roleName') as string;
        const perms = await this.service.getRolePermissions(roleName);
        return success(c, perms);
    }

    updateRolePermissions = async (c: Context): Promise<Response> => {
        try {
            const roleName = c.req.param('roleName') as string;
            const { permissions } = await c.req.json();
            if (!Array.isArray(permissions)) return badRequest(c, MSG.error);

            await this.service.updateRolePermissions(roleName, permissions);
            return success(c, null, MSG.permsUpdated);
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (err.message === ERR.ROLE_NOT_FOUND) return notFound(c, MSG.notFound);
            return serverError(c, MSG.error);
        }
    }
}
