import { eq, createDb, adminUsers } from '@modular/database';
import { IAuthRepository, AdminUserData } from '@cp/auth';

export class DrizzleAuthRepository implements IAuthRepository {
    constructor(private db: ReturnType<typeof createDb>) { }

    async findAdminByUsername(username: string): Promise<AdminUserData | null> {
        const [admin] = await this.db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
        if (!admin) return null;
        return {
            id: admin.id,
            username: admin.username,
            passwordHash: admin.passwordHash,
            createdAt: admin.createdAt || undefined
        };
    }

    async findAdminById(id: number): Promise<AdminUserData | null> {
        const [admin] = await this.db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
        if (!admin) return null;
        return {
            id: admin.id,
            username: admin.username,
            passwordHash: admin.passwordHash,
            createdAt: admin.createdAt || undefined
        };
    }

    async updateAdmin(id: number, data: Partial<AdminUserData>): Promise<void> {
        await this.db.update(adminUsers).set({
            username: data.username,
            passwordHash: data.passwordHash
        }).where(eq(adminUsers.id, id));
    }
}
