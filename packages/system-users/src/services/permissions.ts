/**
 * packages/system-users/src/services/permissions.ts
 *
 * Permissions Service
 */

import { USER_SYSTEM } from '../config/constants';
import { Permission } from '../types';
import { IPermissionsRepository } from '../types/repository';

export class PermissionsService {
    constructor(private repo: IPermissionsRepository) { }

    async list(): Promise<Permission[]> {
        return this.repo.findAll();
    }

    async get(id: number): Promise<Permission | null> {
        return this.repo.findById(id);
    }

    async getByName(name: string): Promise<Permission | null> {
        return this.repo.findByName(name);
    }

    async create(data: { name: string; description?: string; group?: string }): Promise<void> {
        const existing = await this.getByName(data.name);
        if (existing) throw new Error(USER_SYSTEM.ERRORS.ALREADY_EXISTS);

        await this.repo.create(data);
    }

    async update(id: number, data: { description?: string; group?: string }): Promise<void> {
        await this.repo.update(id, data);
    }

    async delete(id: number): Promise<void> {
        await this.repo.delete(id);
    }

    async getRolePermissions(roleName: string): Promise<Permission[]> {
        return this.repo.getRolePermissions(roleName);
    }

    async updateRolePermissions(roleName: string, permissionNames: string[]): Promise<void> {
        return this.repo.updateRolePermissions(roleName, permissionNames);
    }
}
