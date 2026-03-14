import { IErrorTemplateRepository } from '../types/repository';
import { LogData } from '../types';
import { CORE_CONSTANTS } from '../config/constants';
import { CORE_LABELS } from '../config/labels';
import { API_STATUS } from '../utils'; // Internalized

const L = CORE_LABELS.MESSAGES;

export class ErrorTemplateService {
    constructor(private repo: IErrorTemplateRepository) { }

    async listTemplates() {
        return this.repo.listTemplates();
    }

    async getGlobalTemplates() {
        return this.repo.getGlobalTemplates();
    }

    async resolveTemplate(statusCode: number, routeId?: string, categoryId?: string) {
        const validRouteId = routeId ? parseInt(routeId) : undefined;
        const validCategoryId = categoryId ? parseInt(categoryId) : undefined;

        const template = await this.repo.findTemplate(statusCode, validRouteId, validCategoryId);

        if (!template) {
            return {
                template: JSON.stringify({ status: API_STATUS.ERROR, code: statusCode, message: L.DEFAULT_FALLBACK })
            };
        }

        return template;
    }

    async saveTemplate(scope: string, scopeId: number | null, statusCode: number, template: string) {
        const validScope = scope || CORE_CONSTANTS.DEFAULTS.SCOPE.GLOBAL;

        const existing = await this.repo.findExactTemplate(validScope, scopeId, statusCode);

        if (existing) {
            await this.repo.updateTemplate(existing.id, template);
            return { message: L.UPDATED };
        } else {
            await this.repo.saveTemplate({
                scope: validScope,
                scopeId: scopeId || null,
                statusCode,
                template
            });
            return { message: L.CREATED };
        }
    }

    async deleteTemplate(id: number) {
        await this.repo.deleteTemplate(id);
        return { message: L.DELETED };
    }
}
