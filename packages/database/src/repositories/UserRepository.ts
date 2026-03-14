/**
 * packages/database/src/repositories/UserRepository.ts
 */

import { desc, eq, sql, and } from 'drizzle-orm';
import { users, roles, permissions, userPermissions } from '../schema';
import type { DbType } from '../index';
import type { IUserRepository, User, UserListOptions, PaginationMeta, CreateUserDTO } from '@modular/contracts';

// Helper for pagination (could be shared)
const buildPaginationMeta = (page: number, limit: number, total: number): PaginationMeta => {
    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    };
};

export class UserRepository implements IUserRepository {
    constructor(private db: DbType) { }

    async roleExists(roleName: string): Promise<boolean> {
        if (!roleName) return true;
        const [role] = await this.db.select({ name: roles.name })
            .from(roles)
            .where(eq(roles.name, roleName))
            .limit(1);
        return !!role;
    }

    async findAll(options: UserListOptions = {}): Promise<{ data: User[]; meta: PaginationMeta }> {
        const page = Number(options.page) || 1;
        const limit = Number(options.limit) || 10;
        const offset = (page - 1) * limit;

        // Build conditions
        const conditions: any[] = [];
        if (options.search) {
            conditions.push(sql`(${users.username} LIKE ${`%${options.search}%`} OR ${users.email} LIKE ${`%${options.search}%`})`);
        }
        if (options.role && options.role !== 'all') {
            conditions.push(eq(users.role, options.role));
        }
        if (options.status && options.status !== 'all') {
            conditions.push(eq(users.isActive, options.status === 'active'));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Count
        const countResult = await this.db.select({ count: sql<number>`count(*)` })
            .from(users)
            .where(whereClause);
        const total = Number(countResult[0]?.count || 0);

        // List
        const userList = await this.db.select({
            id: users.id,
            username: users.username,
            email: users.email,
            role: users.role,
            isActive: users.isActive,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
            // Role info joined
            roleLevel: roles.level,
            roleIsSuper: roles.isSuper,
            roleDisplayName: roles.displayName
        })
            .from(users)
            .leftJoin(roles, eq(users.role, roles.name))
            .where(whereClause)
            .orderBy(options.sort === 'asc' ? users.createdAt : desc(users.createdAt))
            .limit(limit)
            .offset(offset);

        return {
            data: userList as any as User[], // Cast due to joined fields
            meta: buildPaginationMeta(page, limit, total)
        };
    }

    async findById(id: number): Promise<User | null> {
        const [user] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
        return (user as unknown as User) || null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const [user] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
        return (user as unknown as User) || null;
    }

    async findByUsername(username: string): Promise<User | null> {
        const [user] = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
        return (user as unknown as User) || null;
    }

    async findWithPermissions(id: number): Promise<User | null> {
        const user = await this.findById(id);
        if (!user) return null;

        const userPerms = await this.db.select({ name: permissions.name })
            .from(userPermissions)
            .innerJoin(permissions, eq(userPermissions.permissionId, permissions.id))
            .where(eq(userPermissions.userId, id));

        return {
            ...user,
            permissions: userPerms.map(p => p.name)
        };
    }

    async create(data: Omit<CreateUserDTO, 'role'> & { role: string; passwordHash: string }): Promise<void> {
        await this.db.insert(users).values({
            username: data.username,
            email: data.email,
            passwordHash: data.passwordHash,
            role: data.role
        });
    }

    async update(id: number, data: Partial<User>): Promise<void> {
        // Map User interface fields to database schema fields if needed
        // Here we assume keys match or we filter
        const updateData: any = { ...data };
        delete updateData.id;
        delete updateData.permissions;
        delete updateData.roleLevel;
        delete updateData.roleIsSuper;
        delete updateData.roleDisplayName;

        await this.db.update(users).set(updateData).where(eq(users.id, id));
    }

    async delete(id: number): Promise<void> {
        await this.db.delete(users).where(eq(users.id, id));
    }

    async deletePermissions(userId: number): Promise<void> {
        await this.db.delete(userPermissions).where(eq(userPermissions.userId, userId));
    }

    async count(conditions?: object): Promise<number> {
        // Simple count implementation
        const countResult = await this.db.select({ count: sql<number>`count(*)` }).from(users);
        return Number(countResult[0]?.count || 0);
    }
}

