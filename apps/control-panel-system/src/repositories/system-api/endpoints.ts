import { desc, eq, and, count, ne, createDb, apiEndpoints, apiCategories, dataSources } from '@modular/database';
// Assume API_LABELS and API_CONSTANTS are exported from system-api
import {
    IApiEndpointsRepository,
    EndpointData,
    EndpointStats,
    API_LABELS,
    API_CONSTANTS
} from '@cp/api-manager';

export class DrizzleApiEndpointsRepository implements IApiEndpointsRepository {
    constructor(private db: ReturnType<typeof createDb>) { }

    async list() {
        return this.db.select().from(apiEndpoints).orderBy(desc(apiEndpoints.createdAt));
    }

    async save(data: EndpointData) {
        // Basic validation logic
        if (!data.path || !data.path.startsWith(API_CONSTANTS.URL_SEPARATOR)) throw new Error(API_LABELS.ERRORS.INVALID_PATH);

        // Check duplicates
        const existingEndpoints = await this.db.select({ id: apiEndpoints.id })
            .from(apiEndpoints)
            .where(and(
                eq(apiEndpoints.path, data.path),
                eq(apiEndpoints.method, data.method.toUpperCase())
            ))
            .limit(1);

        if (existingEndpoints.length > 0 && existingEndpoints[0].id !== data.id) {
            throw new Error(API_LABELS.ERRORS.ALREADY_EXISTS);
        }

        // Validate DataSource if provided
        if (data.dataSourceId) {
            const [source] = await this.db.select({ id: dataSources.id })
                .from(dataSources)
                .where(eq(dataSources.id, data.dataSourceId))
                .limit(1);
            if (!source) throw new Error(API_LABELS.ERRORS.INVALID_DATASOURCE);
        }

        const payload = {
            path: data.path.trim(),
            method: data.method.toUpperCase(),
            description: data.description,
            categoryId: data.categoryId || null,
            dataSourceId: data.dataSourceId || null,
            resourceId: data.resourceId || null,
            responseData: data.responseData,
            roles: data.roles,
            permissions: data.permissions,
            minRoleLevel: data.minRoleLevel || 0,
            isActive: data.isActive !== false,
            // Mutation
            operationType: data.operationType || API_CONSTANTS.DEFAULTS.OPERATION_TYPE,
            writableFields: data.writableFields,
            protectedFields: data.protectedFields,
            autoPopulateFields: data.autoPopulateFields,
            ownershipColumn: data.ownershipColumn,
            allowOwnerOnly: data.allowOwnerOnly
        };

        if (data.id) {
            await this.db.update(apiEndpoints).set(payload).where(eq(apiEndpoints.id, data.id));
        } else {
            await this.db.insert(apiEndpoints).values(payload);
        }
    }

    async delete(id: number) {
        await this.db.delete(apiEndpoints).where(eq(apiEndpoints.id, id));
    }

    async getById(id: number) {
        const [endpoint] = await this.db.select().from(apiEndpoints).where(eq(apiEndpoints.id, id)).limit(1);
        if (!endpoint) throw new Error(API_LABELS.ERRORS.NOT_FOUND);
        return endpoint;
    }

    async getStats(): Promise<EndpointStats> {
        const [total] = await this.db.select({ count: count() }).from(apiEndpoints);
        const [active] = await this.db.select({ count: count() }).from(apiEndpoints).where(eq(apiEndpoints.isActive, true));
        const [categories] = await this.db.select({ count: count() }).from(apiCategories);

        const allMethods = await this.db.select({ method: apiEndpoints.method }).from(apiEndpoints);
        const uniqueMethods = new Set(allMethods.map(e => e.method)).size;

        return {
            total: total.count,
            active: active.count,
            categories: categories.count,
            methods: uniqueMethods
        };
    }

    async checkDuplicate(path: string, method: string, excludeId?: number) {
        const conditions = [
            eq(apiEndpoints.path, path),
            eq(apiEndpoints.method, method.toUpperCase())
        ];

        if (excludeId) {
            conditions.push(ne(apiEndpoints.id, excludeId));
        }

        const [existing] = await this.db.select({ id: apiEndpoints.id })
            .from(apiEndpoints)
            .where(and(...conditions))
            .limit(1);

        return { exists: !!existing };
    }

    async toggle(id: number) {
        const [endpoint] = await this.db.select().from(apiEndpoints).where(eq(apiEndpoints.id, id)).limit(1);
        if (!endpoint) throw new Error(API_LABELS.ERRORS.NOT_FOUND);

        await this.db.update(apiEndpoints)
            .set({ isActive: !endpoint.isActive })
            .where(eq(apiEndpoints.id, id));
    }
}
