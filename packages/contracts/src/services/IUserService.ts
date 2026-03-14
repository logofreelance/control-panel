/**
 * @modular/contracts - IUserService (Service Layer)
 */

import type { User, UserListOptions, CreateUserDTO, UpdateUserDTO, PaginationMeta } from '../types';

export interface IUserService {
    validateRole(roleName: string): Promise<boolean>;
    list(options: UserListOptions): Promise<{ data: User[]; meta: PaginationMeta }>;
    get(id: number): Promise<User | null>;
    create(data: CreateUserDTO): Promise<void>;
    update(id: number, data: UpdateUserDTO): Promise<void>;
    delete(id: number): Promise<void>;
    toggleStatus(id: number): Promise<void>;
}

