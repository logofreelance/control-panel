/**
 * packages/system-api/src/services/categories.ts
 *
 * API Categories Service
 * Pure Domain Logic
 */
import { API_LABELS } from '../config/labels';
import { IApiCategoriesRepository, CategoryData } from '../types/repository';

export class ApiCategoriesService {
    constructor(private repo: IApiCategoriesRepository) { }

    async list() {
        return this.repo.findAll();
    }

    async save(data: CategoryData) {
        if (!data.name) throw new Error(API_LABELS.ERRORS.INVALID_NAME);
        await this.repo.save(data);
    }

    async delete(id: number) {
        const hasChildren = await this.repo.hasChildren(id);
        if (hasChildren) {
            throw new Error(API_LABELS.ERRORS.CATEGORY_HAS_CHILDREN);
        }
        await this.repo.delete(id);
    }
}
