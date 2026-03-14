/**
 * packages/system-api/src/services/api-keys.ts
 *
 * API Keys Service
 * Pure Domain Logic - Decoupled from implementations
 */

import { API_CONSTANTS } from '../config/constants';
import { API_LABELS } from '../config/labels';
import type { IApiKeysRepository, CreateApiKeyDTO } from '../types/repository';
import crypto from 'crypto';

export interface IApiKeysService {
    list(): Promise<any[]>;
    create(data: CreateApiKeyDTO): Promise<string>;
    delete(id: number): Promise<void>;
    toggle(id: number): Promise<void>;
}

export class ApiKeysService implements IApiKeysService {
    constructor(private repo: IApiKeysRepository) { }

    async list() {
        return this.repo.findAll();
    }

    async create(data: CreateApiKeyDTO) {
        const key = `${API_CONSTANTS.CRYPTO.KEY_PREFIX.PUBLIC}${crypto.randomBytes(API_CONSTANTS.CRYPTO.BYTES.API_KEY).toString(API_CONSTANTS.CRYPTO.ENCODING.HEX)}`;
        await this.repo.create({
            name: data.name,
            key,
            roles: data.roles,
            permissions: data.permissions,
            isActive: true
        });
        return key;
    }

    async delete(id: number) {
        await this.repo.delete(id);
    }

    async toggle(id: number) {
        const key = await this.repo.findById(id);
        if (!key) throw new Error(API_LABELS.ERRORS.NOT_FOUND);

        await this.repo.update(id, { isActive: !key.isActive });
    }
}
