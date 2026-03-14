/**
 * packages/system-users/src/services/roles.ts
 *
 * Roles Service
 */

import { USER_SYSTEM } from '../config/constants';
import { Role, RolesListOptions } from '../types';
import { IRolesRepository } from '../types/repository';

export class RolesService {
    constructor(private repo: IRolesRepository) { }

    async list(options: RolesListOptions = {}): Promise<Role[]> {
        return this.repo.findAll(options);
    }

    async get(id: number): Promise<Role | null> {
        return this.repo.findById(id);
    }

    async getByName(name: string): Promise<Role | null> {
        return this.repo.findByName(name);
    }

    async create(data: { name: string; displayName?: string; level?: number; description?: string; isSuper?: boolean }): Promise<void> {
        const existing = await this.getByName(data.name);
        if (existing) throw new Error(USER_SYSTEM.ERRORS.ALREADY_EXISTS);

        await this.repo.create(data);
    }

    async update(id: number, data: { displayName?: string; level?: number; description?: string; isSuper?: boolean }): Promise<void> {
        const existing = await this.get(id);
        if (!existing) throw new Error(USER_SYSTEM.ERRORS.NOT_FOUND);

        await this.repo.update(id, data);
    }

    async delete(id: number): Promise<void> {
        const existing = await this.get(id);
        if (!existing) throw new Error(USER_SYSTEM.ERRORS.NOT_FOUND);

        await this.repo.delete(id);
    }

    async checkSuper(roleName: string): Promise<boolean> {
        const role = await this.getByName(roleName);
        return !!role?.isSuper;
    }
}
