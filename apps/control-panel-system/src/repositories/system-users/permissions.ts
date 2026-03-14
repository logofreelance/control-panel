import { IPermissionsRepository } from '@cp/user-manager';
import { createDb, permissions, roles, desc, eq, inArray } from '@modular/database';
import { safeJsonParse, safeJsonStringify } from '@cp/config'; // Config is allowed in backend-orange? Yes, it's the app.
import { Permission } from '@cp/user-manager';

export class DrizzlePermissionsRepository implements IPermissionsRepository {
    private db: ReturnType<typeof createDb>;

    constructor(dbUrl: string) {
        this.db = createDb(dbUrl);
    }

    async findAll(): Promise<Permission[]> {
        const result = await this.db.select().from(permissions).orderBy(permissions.name);
        return result as Permission[];
    }

    async findById(id: number): Promise<Permission | null> {
        const [perm] = await this.db.select().from(permissions).where(eq(permissions.id, id)).limit(1);
        return (perm as Permission) || null;
    }

    async findByName(name: string): Promise<Permission | null> {
        const [perm] = await this.db.select().from(permissions).where(eq(permissions.name, name)).limit(1);
        return (perm as Permission) || null;
    }

    async create(data: { name: string; description?: string; group?: string }): Promise<void> {
        await this.db.insert(permissions).values({
            name: data.name,
            description: data.description,
            group: data.group
        });
    }

    async update(id: number, data: { description?: string; group?: string }): Promise<void> {
        await this.db.update(permissions).set(data).where(eq(permissions.id, id));
    }

    async delete(id: number): Promise<void> {
        await this.db.delete(permissions).where(eq(permissions.id, id));
    }

    async getRolePermissions(roleName: string): Promise<Permission[]> {
        const [role] = await this.db.select({ permissions: roles.permissions })
            .from(roles)
            .where(eq(roles.name, roleName))
            .limit(1);

        if (!role) return [];

        const permNames = safeJsonParse<string[]>(role.permissions, []);
        if (permNames.length === 0) return [];

        const perms = await this.db.select()
            .from(permissions)
            .where(inArray(permissions.name, permNames));

        return perms as Permission[];
    }

    async updateRolePermissions(roleName: string, permissionNames: string[]): Promise<void> {
        const [role] = await this.db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
        if (!role) throw new Error('ROLE_NOT_FOUND'); // Config handled by caller/service usually, but here simple string.

        // Note: validation of permissionNames existence was in Service formerly.
        // We can move it here or keep it simple.

        const permissionsJson = safeJsonStringify(permissionNames);
        await this.db.update(roles)
            .set({ permissions: permissionsJson })
            .where(eq(roles.id, role.id));
    }
}
