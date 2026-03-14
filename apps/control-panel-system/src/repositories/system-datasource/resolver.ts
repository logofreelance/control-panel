import { createDb, eq, sql, and, apiEndpoints, apiCategories, roles, apiErrorTemplates, dataSources, dataSourceResources } from '@modular/database';
import { IResolverRepository, DataSource } from '@cp/datasource-manager';

export class DrizzleResolverRepository implements IResolverRepository {
    private db: ReturnType<typeof createDb>;

    constructor(dbUrl: string) {
        this.db = createDb(dbUrl);
    }

    async findEndpoint(path: string, method: string): Promise<any> {
        const pathParts = path.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        const recordId = /^\d+$/.test(lastPart) ? parseInt(lastPart, 10) : null;
        const basePath = recordId ? pathParts.slice(0, -1).join('/') : path;

        const [endpoint] = await this.db.select({
            id: apiEndpoints.id,
            path: apiEndpoints.path,
            method: apiEndpoints.method,
            responseData: apiEndpoints.responseData,
            dataSourceId: apiEndpoints.dataSourceId,
            resourceId: apiEndpoints.resourceId,
            roles: apiEndpoints.roles,
            permissions: apiEndpoints.permissions,
            minRoleLevel: apiEndpoints.minRoleLevel,
            isActive: apiEndpoints.isActive,
            categoryId: apiEndpoints.categoryId,
            categoryRoles: apiCategories.roles,
            categoryPermissions: apiCategories.permissions,
            operationType: apiEndpoints.operationType,
        })
            .from(apiEndpoints)
            .leftJoin(apiCategories, eq(apiEndpoints.categoryId, apiCategories.id))
            .where(sql`(${apiEndpoints.path} = ${path} OR ${apiEndpoints.path} = ${basePath}) AND ${apiEndpoints.method} = ${method} AND ${apiEndpoints.isActive} = 1`)
            .limit(1);

        return endpoint;
    }

    async findErrorTemplate(statusCode: number, scope: string, scopeId?: number): Promise<string | null> {
        const [template] = await this.db.select()
            .from(apiErrorTemplates)
            .where(and(
                eq(apiErrorTemplates.scope, scope),
                eq(apiErrorTemplates.statusCode, statusCode),
                scopeId ? eq(apiErrorTemplates.scopeId, scopeId) : sql`1=1`
            ))
            .limit(1);
        return template?.template || null;
    }

    async checkSuperAdmin(roleName: string): Promise<boolean> {
        if (!roleName) return false;
        const [role] = await this.db.select({ isSuper: roles.isSuper }).from(roles).where(eq(roles.name, roleName)).limit(1);
        return role?.isSuper === true;
    }

    async getRolePermissions(roleName: string): Promise<string[]> {
        const [role] = await this.db.select({ permissions: roles.permissions }).from(roles).where(eq(roles.name, roleName)).limit(1);
        if (role?.permissions) {
            try {
                const perms = typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions;
                return Array.isArray(perms) ? perms : [];
            } catch {
                return [];
            }
        }
        return [];
    }

    async getDataSource(id: number): Promise<DataSource | null> {
        const [source] = await this.db.select().from(dataSources).where(eq(dataSources.id, id)).limit(1);
        return (source as unknown as DataSource) || null;
    }

    async getResource(id: number): Promise<any | null> {
        const [res] = await this.db.select().from(dataSourceResources).where(eq(dataSourceResources.id, id)).limit(1);
        return res || null;
    }

    async executeDynamicQuery(query: string): Promise<any[]> {
        const result: any = await this.db.execute(sql.raw(query));
        return (result[0] as any[]) || [];
    }
}
