import { eq, and } from '@modular/database'; // drizzle-orm exports are often re-exported or available via database package, or direct import is fine if installed. 
// However, backend-orange usually imports drizzle specific operators from '@modular/database' or 'drizzle-orm'. 
// Checking the original file: "import { eq, and } from 'drizzle-orm';" 
// backend-orange has drizzle-orm.
import { apiErrorTemplates, createDb } from '@modular/database';
import { CORE_CONSTANTS, IErrorTemplateRepository, ErrorTemplateData } from '@cp/core';
import { API_STATUS } from '@cp/config';

export class DrizzleErrorTemplateRepository implements IErrorTemplateRepository {
    constructor(private db: ReturnType<typeof createDb>) { }

    async listTemplates(): Promise<ErrorTemplateData[]> {
        const rows = await this.db.select().from(apiErrorTemplates);
        return rows.map(r => ({
            ...r,
            scope: r.scope || CORE_CONSTANTS.DEFAULTS.SCOPE.GLOBAL // Handle null scope
        }));
    }

    async getGlobalTemplates(): Promise<ErrorTemplateData[]> {
        const rows = await this.db.select()
            .from(apiErrorTemplates)
            .where(eq(apiErrorTemplates.scope, CORE_CONSTANTS.DEFAULTS.SCOPE.GLOBAL));
        return rows.map(r => ({
            ...r,
            scope: r.scope || CORE_CONSTANTS.DEFAULTS.SCOPE.GLOBAL
        }));
    }

    async findTemplate(statusCode: number, routeId?: number, categoryId?: number): Promise<ErrorTemplateData | null> {
        let template: ErrorTemplateData | null = null;

        // 1. Check route-specific
        if (routeId) {
            const [routeTemplate] = await this.db.select()
                .from(apiErrorTemplates)
                .where(and(
                    eq(apiErrorTemplates.scope, API_STATUS.ROUTE),
                    eq(apiErrorTemplates.scopeId, routeId),
                    eq(apiErrorTemplates.statusCode, statusCode)
                ))
                .limit(1);
            if (routeTemplate) {
                return {
                    ...routeTemplate,
                    scope: routeTemplate.scope || API_STATUS.ROUTE
                };
            }
        }

        // 2. Check category-specific
        if (categoryId) {
            const [catTemplate] = await this.db.select()
                .from(apiErrorTemplates)
                .where(and(
                    eq(apiErrorTemplates.scope, API_STATUS.CATEGORY),
                    eq(apiErrorTemplates.scopeId, categoryId),
                    eq(apiErrorTemplates.statusCode, statusCode)
                ))
                .limit(1);
            if (catTemplate) {
                return {
                    ...catTemplate,
                    scope: catTemplate.scope || API_STATUS.CATEGORY
                };
            }
        }

        // 3. Fallback to global
        const [globalTemplate] = await this.db.select()
            .from(apiErrorTemplates)
            .where(and(
                eq(apiErrorTemplates.scope, CORE_CONSTANTS.DEFAULTS.SCOPE.GLOBAL),
                eq(apiErrorTemplates.statusCode, statusCode)
            ))
            .limit(1);

        if (globalTemplate) {
            return {
                ...globalTemplate,
                scope: globalTemplate.scope || CORE_CONSTANTS.DEFAULTS.SCOPE.GLOBAL
            };
        }
        return null;
    }

    async findExactTemplate(scope: string, scopeId: number | null, statusCode: number): Promise<ErrorTemplateData | null> {
        const conditions = [
            eq(apiErrorTemplates.scope, scope),
            eq(apiErrorTemplates.statusCode, statusCode)
        ];

        if (scopeId) {
            conditions.push(eq(apiErrorTemplates.scopeId, scopeId));
        }

        const [existing] = await this.db.select()
            .from(apiErrorTemplates)
            .where(and(...conditions))
            .limit(1);

        if (existing) {
            return {
                ...existing,
                scope: existing.scope || scope // Should match query but handle null
            };
        }
        return null;
    }

    async saveTemplate(data: Omit<ErrorTemplateData, 'id'>): Promise<void> {
        await this.db.insert(apiErrorTemplates).values({
            scope: data.scope,
            scopeId: data.scopeId,
            statusCode: data.statusCode,
            template: data.template
        });
    }

    async updateTemplate(id: number, template: string): Promise<void> {
        await this.db.update(apiErrorTemplates)
            .set({ template })
            .where(eq(apiErrorTemplates.id, id));
    }

    async deleteTemplate(id: number): Promise<void> {
        await this.db.delete(apiErrorTemplates).where(eq(apiErrorTemplates.id, id));
    }
}
