import { Role, Permission, RolesListOptions } from '../types';

export interface IRolesRepository {
    findAll(options?: RolesListOptions): Promise<Role[]>;
    findById(id: number): Promise<Role | null>;
    findByName(name: string): Promise<Role | null>;
    create(data: { name: string; displayName?: string; level?: number; description?: string; isSuper?: boolean }): Promise<void>;
    update(id: number, data: { displayName?: string; level?: number; description?: string; isSuper?: boolean }): Promise<void>;
    delete(id: number): Promise<void>;
}

export interface IPermissionsRepository {
    findAll(): Promise<Permission[]>;
    findById(id: number): Promise<Permission | null>;
    findByName(name: string): Promise<Permission | null>;
    create(data: { name: string; description?: string; group?: string }): Promise<void>;
    update(id: number, data: { description?: string; group?: string }): Promise<void>;
    delete(id: number): Promise<void>;
    getRolePermissions(roleName: string): Promise<Permission[]>;
    updateRolePermissions(roleName: string, permissionNames: string[]): Promise<void>;
}
