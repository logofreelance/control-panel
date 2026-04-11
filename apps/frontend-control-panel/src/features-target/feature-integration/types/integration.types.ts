export interface IntegrationDocMeta {
    generatedAt: string;
    baseUrl: string;
}

export interface IntegrationDocAuth {
    method: string;
    headerName: string;
    roles: Array<Record<string, any>>;
    apiKeys: Array<Record<string, any>>;
}

export interface IntegrationDocs {
    meta: IntegrationDocMeta;
    authentication: IntegrationDocAuth;
    routes: {
        static: Array<Record<string, any>>;
        dynamic: Array<Record<string, any>>;
    };
    categories: Array<Record<string, any>>;
    errorTemplates: Array<Record<string, any>>;
    schemas: Record<string, Array<Record<string, any>>>;
    dataSources: Array<Record<string, any>>;
}
