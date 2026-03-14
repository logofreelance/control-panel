
export interface ICorsService {
    list(): Promise<any>;
    create(domain: string): Promise<any>;
    delete(id: number): Promise<any>;
    toggle(id: number): Promise<any>;
}
