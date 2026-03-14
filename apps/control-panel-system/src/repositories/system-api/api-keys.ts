import { desc, eq, createDb, apiKeys } from '@modular/database';
import { IApiKeysRepository, ApiKeyData } from '@cp/api-manager';

export class DrizzleApiKeysRepository implements IApiKeysRepository {
    constructor(private db: ReturnType<typeof createDb>) { }

    async findAll() {
        const keys = await this.db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));
        return keys.map(k => ({
            id: k.id,
            name: k.name,
            key: k.key,
            roles: k.roles || undefined,
            permissions: k.permissions || undefined,
            isActive: k.isActive === null ? undefined : k.isActive,
            createdAt: k.createdAt || undefined
        }));
    }

    async create(data: ApiKeyData) {
        await this.db.insert(apiKeys).values({
            name: data.name,
            key: data.key,
            roles: data.roles,
            permissions: data.permissions,
            isActive: data.isActive
        });
    }

    async delete(id: number) {
        await this.db.delete(apiKeys).where(eq(apiKeys.id, id));
    }

    async findById(id: number) {
        const [key] = await this.db.select().from(apiKeys).where(eq(apiKeys.id, id)).limit(1);
        if (!key) return null;

        return {
            id: key.id,
            name: key.name,
            key: key.key,
            roles: key.roles || undefined,
            permissions: key.permissions || undefined,
            isActive: key.isActive === null ? undefined : key.isActive,
            createdAt: key.createdAt || undefined
        };
    }

    async update(id: number, data: Partial<ApiKeyData>) {
        await this.db.update(apiKeys).set({
            ...data,
            isActive: data.isActive
        }).where(eq(apiKeys.id, id));
    }
}
