/**
 * @modular/contracts - IApiKeysService (Service Layer)
 */

import type { ApiKey, CreateApiKeyDTO } from '../types';

export interface IApiKeysService {
    list(): Promise<ApiKey[]>;
    create(data: CreateApiKeyDTO): Promise<string>;
    delete(id: number): Promise<void>;
    toggle(id: number): Promise<void>;
}

