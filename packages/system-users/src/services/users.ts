/**
 * packages/system-users/src/services/users.ts
 *
 * Users Service
 * Encapsulates all user management logic
 */

import { DEFAULT_USER_ROLE, USER_SYSTEM } from '../config/constants';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import type { UserListOptions, UserUpdateData } from '../types';
import type { User, IUserService, IUserRepository, CreateUserDTO, UpdateUserDTO } from '@modular/contracts';
import bcrypt from 'bcryptjs';

export class UsersService implements IUserService {
    constructor(private repo: IUserRepository) { }

    /**
     * Validate role exists
     */
    async validateRole(roleName: string): Promise<boolean> {
        return this.repo.roleExists(roleName);
    }

    /**
     * List users with filtering and pagination
     */
    async list(options: UserListOptions): Promise<{ data: User[]; meta: any }> {
        return this.repo.findAll(options);
    }

    /**
     * Get user by ID with permissions
     */
    async get(id: number): Promise<User | null> {
        return this.repo.findWithPermissions(id);
    }

    /**
     * Create new user
     */
    async create(data: CreateUserDTO): Promise<void> {
        // Check existence
        const existingEmail = await this.repo.findByEmail(data.email);
        if (existingEmail) throw new Error(USER_SYSTEM.ERRORS.ALREADY_EXISTS);

        const existingUsername = await this.repo.findByUsername(data.username);
        if (existingUsername) throw new Error(USER_SYSTEM.ERRORS.ALREADY_EXISTS);

        if (!data.password) {
            throw new Error(USER_SYSTEM.ERRORS.PASSWORD_REQUIRED);
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password, salt);

        // Validating Role
        const userRole = data.role || DEFAULT_USER_ROLE;
        const roleValid = await this.validateRole(userRole);
        if (!roleValid) {
            throw new Error(USER_SYSTEM.ERRORS.ROLE_NOT_EXISTS);
        }

        await this.repo.create({
            username: data.username,
            email: data.email,
            passwordHash,
            role: userRole
        });
    }

    /**
     * Update user
     */
    async update(id: number, data: UpdateUserDTO): Promise<void> {
        const updateData: Partial<User> = {};

        if (data.username) updateData.username = data.username;
        if (data.email) updateData.email = data.email;
        if (typeof data.isActive === 'boolean') updateData.isActive = data.isActive;

        if (data.role) {
            const roleValid = await this.validateRole(data.role);
            if (!roleValid) throw new Error(USER_SYSTEM.ERRORS.ROLE_NOT_EXISTS);
            updateData.role = data.role;
        }

        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.passwordHash = await bcrypt.hash(data.password, salt);
        }

        await this.repo.update(id, updateData);
    }

    /**
     * Delete user
     */
    async delete(id: number): Promise<void> {
        // Delete user permissions first
        await this.repo.deletePermissions(id);
        await this.repo.delete(id);
    }

    /**
     * Toggle user status
     */
    async toggleStatus(id: number): Promise<void> {
        const user = await this.repo.findById(id);
        if (!user) throw new Error(USER_SYSTEM.ERRORS.NOT_FOUND);

        await this.repo.update(id, { isActive: !user.isActive });
    }
}

