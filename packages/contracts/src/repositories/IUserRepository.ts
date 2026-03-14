/**
 * @modular/contracts - IUserRepository
 */

import type { User, CreateUserDTO, UpdateUserDTO, UserListOptions, PaginationMeta } from '../types';

export interface IUserRepository {
    findAll(options?: UserListOptions): Promise<{ data: User[]; meta: PaginationMeta }>;
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    create(data: Omit<CreateUserDTO, 'role'> & { role: string; passwordHash: string }): Promise<void>;
    update(id: number, data: Partial<User>): Promise<void>;
    delete(id: number): Promise<void>;
    count(conditions?: object): Promise<number>;

    // Auth related
    findWithPermissions(id: number): Promise<User | null>;
    roleExists(roleName: string): Promise<boolean>;
    deletePermissions(userId: number): Promise<void>;
}

