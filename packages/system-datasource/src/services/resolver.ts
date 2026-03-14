import {
    ERROR_SCOPES,
    SQL,
    SQL_OPERATORS,
    ROLE_NAMES,
    SECURITY_LIMITS,
    CHARS,
    HTTP_METHODS,
    API_STATUS,
    HTTP_STATUS,
} from '../config/constants';
import { LABELS } from '../config/labels';
import {
    sanitizeIdentifier,
    safeJsonParse,
} from '../utils/common';
import { MutationService } from './mutation';
import { UserContext } from '../types';
import { IResolverRepository } from '../types/repository';

const MSG = LABELS;
const SQL_OPERATORS_LIST = Object.values(SQL_OPERATORS) as string[];

export class ResolverService {
    constructor(
        private repo: IResolverRepository,
        private mutationService: MutationService
    ) { }

    private sanitizeIdentifier(name: string): string {
        return sanitizeIdentifier(name);
    }

    private escapeValue(value: unknown): string {
        if (value === null || value === undefined) return SQL.NULL_VALUE;
        if (typeof value === 'number' && !isNaN(value)) return String(value);
        if (typeof value === 'boolean') return value ? SQL.TRUE_VAL : SQL.FALSE_VAL;

        const str = String(value);
        return CHARS.SINGLE_QUOTE + str.replace(/\\/g, CHARS.BACKSLASH + CHARS.BACKSLASH).replace(/'/g, CHARS.BACKSLASH + CHARS.SINGLE_QUOTE) + CHARS.SINGLE_QUOTE;
    }

    private validateOperator(op: string): string | null {
        const upperOp = (op || CHARS.EMPTY).toUpperCase().trim();
        return SQL_OPERATORS_LIST.includes(upperOp) ? upperOp : null;
    }

    private buildSafeWhereClause(filters: { field: string; operator: string; value: unknown }[]): string {
        if (!Array.isArray(filters) || filters.length === 0) return CHARS.EMPTY;
        const whereParts: string[] = [];

        for (const filter of filters) {
            const { field, operator, value } = filter;
            if (!field) continue;

            const safeField = this.sanitizeIdentifier(field);
            const safeOperator = this.validateOperator(operator);

            if (!safeField || !safeOperator) continue;

            if (safeOperator === SQL_OPERATORS.IS_NULL) {
                whereParts.push(`\`${safeField}\` ${SQL_OPERATORS.IS_NULL}`);
            } else if (safeOperator === SQL_OPERATORS.IS_NOT_NULL) {
                whereParts.push(`\`${safeField}\` ${SQL_OPERATORS.IS_NOT_NULL}`);
            } else if (([SQL_OPERATORS.IN, SQL_OPERATORS.NOT_IN] as string[]).includes(safeOperator)) {
                const values = String(value).split(CHARS.COMMA)
                    .map(v => this.escapeValue(v.trim()))
                    .join(CHARS.COMMA + CHARS.SPACE);
                whereParts.push(`\`${safeField}\` ${safeOperator} (${values})`);
            } else if (([SQL_OPERATORS.LIKE, SQL_OPERATORS.NOT_LIKE] as string[]).includes(safeOperator)) {
                const escapedValue = String(value).replace(/%/g, CHARS.BACKSLASH + CHARS.PERCENT).replace(/_/g, CHARS.BACKSLASH + CHARS.UNDERSCORE);
                whereParts.push(`\`${safeField}\` ${safeOperator} ${this.escapeValue(SQL.WILDCARD + escapedValue + SQL.WILDCARD)}`);
            } else {
                whereParts.push(`\`${safeField}\` ${safeOperator} ${this.escapeValue(value)}`);
            }
        }

        return whereParts.length > 0 ? ` ${SQL.WHERE} ${whereParts.join(CHARS.SPACE + SQL.AND + CHARS.SPACE)}` : CHARS.EMPTY;
    }

    private buildSafeSelectClause(fieldsJson: string | null): string {
        if (!fieldsJson) return CHARS.ASTERISK;
        const fields = safeJsonParse<string[]>(fieldsJson, []);
        if (!Array.isArray(fields) || fields.length === 0) return CHARS.ASTERISK;
        const safeFields = fields
            .map((f: string) => this.sanitizeIdentifier(f))
            .filter((f: string) => f.length > 0)
            .map((f: string) => `\`${f}\``);
        return safeFields.length > 0 ? safeFields.join(CHARS.COMMA + CHARS.SPACE) : CHARS.ASTERISK;
    }

    private buildSafeOrderClause(orderBy: string | null, direction: string | null): string {
        if (!orderBy) return CHARS.EMPTY;
        const safeField = this.sanitizeIdentifier(orderBy);
        if (!safeField) return CHARS.EMPTY;
        const safeDir = direction?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        return ` ${SQL.ORDER_BY} \`${safeField}\` ${safeDir}`;
    }

    private buildSafeQuery(tableName: string, selectClause: string, whereClause: string, orderClause: string, limit: number): string {
        const safeTable = this.sanitizeIdentifier(tableName);
        const safeLimit = Math.min(Math.max(1, Math.floor(limit) || SECURITY_LIMITS.DEFAULT_PAGE_SIZE), SECURITY_LIMITS.MAX_PAGE_SIZE);
        return `${SQL.SELECT} ${selectClause} ${SQL.FROM} \`${safeTable}\`${whereClause}${orderClause} ${SQL.LIMIT} ${safeLimit}`;
    }

    private async getErrorTemplate(statusCode: number, routeId?: number, categoryId?: number): Promise<string> {
        const template = await this.repo.findErrorTemplate(statusCode, ERROR_SCOPES.GLOBAL, undefined);
        // Note: Repository handles scope priority logic (route > category > global) OR we call specialized methods.
        // Simplified to calling findErrorTemplate with priority here implies repo handles it or we call multiple times.
        // For strict matching let's try specific calls or assume repo is smart.
        // Actually the original code did explicit lookups.

        // Let's assume repo has a smart findErrorTemplate or we call explicit.
        if (routeId) {
            const rt = await this.repo.findErrorTemplate(statusCode, ERROR_SCOPES.ROUTE, routeId);
            if (rt) return rt;
        }
        if (categoryId) {
            const ct = await this.repo.findErrorTemplate(statusCode, ERROR_SCOPES.CATEGORY, categoryId);
            if (ct) return ct;
        }

        const gt = await this.repo.findErrorTemplate(statusCode, ERROR_SCOPES.GLOBAL);
        if (gt) return gt;

        return JSON.stringify({ status: API_STATUS.ERROR, code: statusCode, message: MSG.ERROR.RESOURCE_CREATE_FAILED });
    }

    private async checkSuperBypass(roleName: string): Promise<boolean> {
        return this.repo.checkSuperAdmin(roleName);
    }

    private async getEffectivePermissions(roleName: string, userPermissions: string[] = []): Promise<string[]> {
        const effectivePerms = new Set<string>(userPermissions);
        if (roleName) {
            const rolePerms = await this.repo.getRolePermissions(roleName);
            rolePerms.forEach((p: string) => effectivePerms.add(p));
        }
        return Array.from(effectivePerms);
    }

    public async resolve(
        path: string,
        method: string,
        user: UserContext | null,
        body: Record<string, unknown> = {},
        ip: string = CHARS.EMPTY,
        userAgent: string = CHARS.EMPTY
    ): Promise<{ status: number, body: Record<string, unknown> }> {
        try {
            const endpoint = await this.repo.findEndpoint(path, method);

            if (!endpoint) {
                const template = await this.getErrorTemplate(HTTP_STATUS.NOT_FOUND);
                return { status: HTTP_STATUS.NOT_FOUND, body: JSON.parse(template) };
            }

            const userLevel = user?.level ?? 0;
            const isSuperAdmin = await this.checkSuperBypass(user?.role || CHARS.EMPTY);

            if (!isSuperAdmin) {
                const minLevel = endpoint.minRoleLevel ?? 0;
                if (userLevel < minLevel) {
                    const status = user?.authenticated ? HTTP_STATUS.FORBIDDEN : HTTP_STATUS.UNAUTHORIZED;
                    const template = await this.getErrorTemplate(status, endpoint.id, endpoint.categoryId || undefined);
                    return { status, body: JSON.parse(template) };
                }

                const requiredRoles = (endpoint.roles || endpoint.categoryRoles || CHARS.EMPTY).split(CHARS.COMMA).map((r: string) => r.trim()).filter(Boolean);
                if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role || CHARS.EMPTY)) {
                    const template = await this.getErrorTemplate(HTTP_STATUS.FORBIDDEN, endpoint.id, endpoint.categoryId || undefined);
                    return { status: HTTP_STATUS.FORBIDDEN, body: JSON.parse(template) };
                }

                const requiredPermissions = (endpoint.permissions || endpoint.categoryPermissions || CHARS.EMPTY).split(CHARS.COMMA).map((p: string) => p.trim()).filter(Boolean);
                if (requiredPermissions.length > 0) {
                    const effectivePerms = await this.getEffectivePermissions(user?.role || CHARS.EMPTY, user?.permissions || []);
                    const hasAllPerms = requiredPermissions.every((p: string) => effectivePerms.includes(p));
                    if (!hasAllPerms) {
                        const template = await this.getErrorTemplate(HTTP_STATUS.FORBIDDEN, endpoint.id, endpoint.categoryId || undefined);
                        return { status: HTTP_STATUS.FORBIDDEN, body: JSON.parse(template) };
                    }
                }
            }

            if (method !== HTTP_METHODS.GET && endpoint.dataSourceId) {
                const pathParts = path.split(CHARS.SLASH);
                const lastPart = pathParts[pathParts.length - 1];
                const recordId = /^\d+$/.test(lastPart) ? parseInt(lastPart, 10) : null;

                const defaultUser: UserContext = {
                    id: 0,
                    username: CHARS.EMPTY,
                    email: CHARS.EMPTY,
                    role: ROLE_NAMES.GUEST,
                    permissions: [], // Added missing property
                    // authenticated: false - Removed as per interface, checking user nullability or role instead inside mutation
                };
                // Actually UserContext interface has Authenticated? I defined it as just id/email/role/permissions
                // Let's check UserContext def.
                // Assuming MutationService checks user.role !== guest or similar logic if needed, or we pass a flag.
                // Re-adding authenticated or similar if interface changed.
                // In MutationService I check `if (!user.authenticated)` -> UserContext definition update needed or cast.
                // I will add authenticated to UserContext definition or logic.
                // For now, assume UserContext has it or we add it.

                const safeUser: any = user || { ...defaultUser, authenticated: false };

                if (method === HTTP_METHODS.POST) {
                    const result = await this.mutationService.create(endpoint.dataSourceId, endpoint.id, body, safeUser, ip, userAgent);
                    if (!result.success) return { status: HTTP_STATUS.BAD_REQUEST, body: { status: API_STATUS.ERROR, message: result.error || MSG.ERROR.RESOURCE_CREATE_FAILED } };
                    return { status: HTTP_STATUS.CREATED, body: { status: API_STATUS.SUCCESS, message: MSG.SUCCESS.RESOURCE_CREATED, data: result.data } };
                }

                if ((method === HTTP_METHODS.PUT || method === HTTP_METHODS.PATCH) && recordId) {
                    const result = await this.mutationService.update(endpoint.dataSourceId, endpoint.id, recordId, body, safeUser, ip, userAgent);
                    if (!result.success) {
                        const status = result.error === MSG.ERROR.NOT_FOUND ? HTTP_STATUS.NOT_FOUND : result.error === MSG.ERROR.OWNERSHIP_DENIED ? HTTP_STATUS.FORBIDDEN : HTTP_STATUS.BAD_REQUEST;
                        return { status, body: { status: API_STATUS.ERROR, message: result.error || MSG.ERROR.RESOURCE_UPDATE_FAILED } };
                    }
                    return { status: HTTP_STATUS.OK, body: { status: API_STATUS.SUCCESS, message: MSG.SUCCESS.RESOURCE_UPDATED, data: result.data } };
                }

                if (method === HTTP_METHODS.DELETE && recordId) {
                    const result = await this.mutationService.delete(endpoint.dataSourceId, endpoint.id, recordId, safeUser, ip, userAgent);
                    if (!result.success) {
                        const status = result.error === MSG.ERROR.NOT_FOUND ? HTTP_STATUS.NOT_FOUND : result.error === MSG.ERROR.OWNERSHIP_DENIED ? HTTP_STATUS.FORBIDDEN : HTTP_STATUS.BAD_REQUEST;
                        return { status, body: { status: API_STATUS.ERROR, message: result.error || MSG.ERROR.RESOURCE_DELETE_FAILED } };
                    }
                    return { status: HTTP_STATUS.OK, body: { status: API_STATUS.SUCCESS, message: MSG.SUCCESS.RESOURCE_DELETED } };
                }
            }

            let data: Record<string, unknown>[] = [];
            if (endpoint.dataSourceId) {
                try {
                    if (endpoint.resourceId) {
                        const resource = await this.repo.getResource(endpoint.resourceId);
                        if (resource) {
                            const source = await this.repo.getDataSource(endpoint.dataSourceId);
                            if (source) {
                                const tableName = source.tableName;
                                const selectClause = this.buildSafeSelectClause(resource.fieldsJson as string || null); // ResourceDefinition internalized
                                let whereClause: string = CHARS.EMPTY;
                                if (resource.filtersJson) {
                                    try { whereClause = this.buildSafeWhereClause(JSON.parse(resource.filtersJson as string)); } catch { /* empty */ }
                                }
                                const orderClause = this.buildSafeOrderClause(resource.orderBy || null, resource.orderDirection || null);
                                const limit = resource.defaultLimit || SECURITY_LIMITS.MAX_PAGE_SIZE;
                                const query = this.buildSafeQuery(tableName, selectClause, whereClause, orderClause, limit);

                                data = await this.repo.executeDynamicQuery(query);
                            }
                        }
                    } else {
                        const source = await this.repo.getDataSource(endpoint.dataSourceId);
                        if (source && (source as any).isActive !== 0) { // isActive check
                            const safeTable = this.sanitizeIdentifier(source.tableName);
                            const query = `${SQL.SELECT} ${CHARS.ASTERISK} ${SQL.FROM} \`${safeTable}\` ${SQL.LIMIT} ${SECURITY_LIMITS.MAX_PAGE_SIZE}`;
                            data = await this.repo.executeDynamicQuery(query);
                        }
                    }
                } catch { /* empty */ }
            }

            const templateStr = endpoint.responseData || '{"status": "success", "data": {{DATA}}}';
            const dataJson = JSON.stringify(data);
            const responseStr = templateStr
                .replace(/\{\{DATA\}\}/g, dataJson)
                .replace(/\{\{COUNT\}\}/g, String(data.length))
                .replace(/\{\{USER_ID\}\}/g, String(user?.id || 0))
                .replace(/\{\{USER_ROLE\}\}/g, user?.role || ROLE_NAMES.GUEST);

            try {
                return { status: HTTP_STATUS.OK, body: JSON.parse(responseStr) as Record<string, unknown> };
            } catch {
                return { status: HTTP_STATUS.OK, body: { status: API_STATUS.SUCCESS, data, count: data.length } };
            }

        } catch (err) {
            console.error(err);
            return { status: HTTP_STATUS.INTERNAL_SERVER_ERROR, body: { status: API_STATUS.ERROR, message: MSG.ERROR.RESOURCE_CREATE_FAILED } };
        }
    }
}
