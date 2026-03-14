
export interface IRolesService {
    list(options?: any): Promise<any>;
    get(id: number): Promise<any>;
    create(data: any): Promise<any>;
    update(id: number, data: any): Promise<any>;
    delete(id: number): Promise<any>;
    checkSuper(roleName: string): Promise<boolean>;
}
