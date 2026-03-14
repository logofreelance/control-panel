/**
 * packages/database/src/repositories/ApiKeysRepository.ts
 */

import { desc, eq } from 'drizzle-orm';
import { apiKeys } from '../schema';
import type { DbType } from '../index';
import type { IApiKeysRepository, ApiKey } from '@modular/contracts';

export class ApiKeysRepository implements IApiKeysRepository {
    constructor(private db: DbType) { }

    async findAll(): Promise<ApiKey[]> {
        const result = await this.db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));
        return result as unknown as ApiKey[];
    }

    async findById(id: number): Promise<ApiKey | null> {
        const [key] = await this.db.select().from(apiKeys).where(eq(apiKeys.id, id)).limit(1);
        return (key as unknown as ApiKey) || null;
    }

    async create(data: { name: string; key: string; roles?: string; permissions?: string }): Promise<void> {
        await this.db.insert(apiKeys).values({
            name: data.name,
            key: data.key,
            roles: data.roles,
            permissions: data.permissions
        });
    }

    async delete(id: number): Promise<void> {
        await this.db.delete(apiKeys).where(eq(apiKeys.id, id));
    }

    async update(id: number, data: Partial<ApiKey>): Promise<void> {
        const updateData: any = { ...data };
        delete updateData.id;

        await this.db.update(apiKeys).set(updateData).where(eq(apiKeys.id, id));
    }
}

