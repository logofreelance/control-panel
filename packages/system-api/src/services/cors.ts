/**
 * packages/system-api/src/services/cors.ts
 *
 * CORS Service
 * Pure Domain Logic
 */
import { API_LABELS } from '../config/labels';
import { ICorsRepository } from '../types/repository';

export interface ICorsService {
    list(): Promise<any[]>;
    create(domain: string): Promise<void>;
    delete(id: number): Promise<void>;
    toggle(id: number): Promise<void>;
}

export class CorsService implements ICorsService {
    constructor(private repo: ICorsRepository) { }

    async list() {
        return this.repo.findAll();
    }

    async create(domain: string) {
        if (!domain) throw new Error(API_LABELS.ERRORS.INVALID_DOMAIN);
        await this.repo.save(domain);
    }

    async delete(id: number) {
        await this.repo.delete(id);
    }

    async toggle(id: number) {
        await this.repo.toggle(id);
    }
}
