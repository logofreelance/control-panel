/**
 * @modular/contracts - IApiKeysRepository
 */

import type { ApiKey } from '../types';

export interface IApiKeysRepository {
    findAll(): Promise<ApiKey[]>;
    findById(id: number): Promise<ApiKey | null>;
    create(data: { name: string; key: string; roles?: string; permissions?: string }): Promise<void>;
    delete(id: number): Promise<void>;
    update(id: number, data: Partial<ApiKey>): Promise<void>;
}

