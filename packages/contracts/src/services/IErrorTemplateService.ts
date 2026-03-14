
export interface IErrorTemplateService {
    listTemplates(): Promise<any>;
    getGlobalTemplates(): Promise<any>;
    resolveTemplate(statusCode: number, routeId?: string, categoryId?: string): Promise<any>;
    saveTemplate(scope: string, scopeId: number | null, statusCode: number, template: any): Promise<any>;
    deleteTemplate(id: number): Promise<any>;
}
