/**
 * packages/system-api/src/services/endpoints.ts
 *
 * API Endpoints Service
 * Decoupled from Database Implementation via Repository Pattern
 */
import { IApiEndpointsRepository, EndpointData } from '../types/repository';

export class ApiEndpointsService {
    constructor(private repo: IApiEndpointsRepository) { }

    async list() {
        return this.repo.list();
    }

    async save(data: EndpointData) {
        return this.repo.save(data);
    }

    async delete(id: number) {
        return this.repo.delete(id);
    }

    async getById(id: number) {
        return this.repo.getById(id);
    }

    async getStats() {
        return this.repo.getStats();
    }

    async checkDuplicate(path: string, method: string, excludeId?: number) {
        return this.repo.checkDuplicate(path, method, excludeId);
    }

    async toggle(id: number) {
        return this.repo.toggle(id);
    }
}
