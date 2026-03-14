
export interface IPermissionsService {
    list(): Promise<any>;
    get(id: number): Promise<any>;
    create(data: any): Promise<any>;
    update(id: number, data: any): Promise<any>;
    delete(id: number): Promise<any>;
    getRolePermissions(roleName: string): Promise<any>;
    updateRolePermissions(roleName: string, permissions: any[]): Promise<any>;
}
