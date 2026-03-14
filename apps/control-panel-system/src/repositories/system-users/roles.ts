import { IRolesRepository } from '@cp/user-manager';
import { createDb, roles, desc, eq } from '@modular/database';
import { Role, RolesListOptions } from '@cp/user-manager';

export class DrizzleRolesRepository implements IRolesRepository {
    private db: ReturnType<typeof createDb>;

    constructor(dbUrl: string) {
        this.db = createDb(dbUrl);
    }

    async findAll(options: RolesListOptions = {}): Promise<Role[]> {
        const result = await this.db.select()
            .from(roles)
            .orderBy(options.sort === 'asc' ? roles.level : desc(roles.level));
        return result as Role[];
    }

    async findById(id: number): Promise<Role | null> {
        const [role] = await this.db.select().from(roles).where(eq(roles.id, id)).limit(1);
        return (role as Role) || null;
    }

    async findByName(name: string): Promise<Role | null> {
        const [role] = await this.db.select().from(roles).where(eq(roles.name, name)).limit(1);
        return (role as Role) || null;
    }

    async create(data: { name: string; displayName?: string; level?: number; description?: string; isSuper?: boolean }): Promise<void> {
        await this.db.insert(roles).values({
            name: data.name,
            displayName: data.displayName || data.name,
            level: data.level || 0,
            description: data.description,
            isSuper: data.isSuper || false
        });
    }

    async update(id: number, data: { displayName?: string; level?: number; description?: string; isSuper?: boolean }): Promise<void> {
        await this.db.update(roles).set(data).where(eq(roles.id, id));
    }

    async delete(id: number): Promise<void> {
        await this.db.delete(roles).where(eq(roles.id, id));
    }
}
