export interface ApiCategory {
    id: number;
    name: string;
    description?: string;
    roles?: string; // Comma-separated
    permissions?: string; // Comma-separated
    createdAt?: string;
    updatedAt?: string;
}

export interface ApiEndpoint {
    id: number;
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    description?: string;
    categoryId?: number;
    dataSourceId?: number;
    resourceId?: number;
    responseData?: string; // JSON template
    roles?: string;
    permissions?: string;
    minRoleLevel?: number; // 0=public, 10=user, 50=moderator, 90=admin
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;

    // Validation & Custom Error Templates
    validationRules?: string;       // JSON: { "fieldName": "required,minLength:3,maxLength:100" }
    errorTemplatesJson?: string;    // JSON: { "401": "{...}", "403": "{...}" }

    // Mutation Config
    operationType?: 'read' | 'create' | 'update' | 'delete';
    writableFields?: string; // JSON
    protectedFields?: string; // JSON
    autoPopulateFields?: string; // JSON
    ownershipColumn?: string;
    allowOwnerOnly?: boolean;
}

export type ApiLog = {
    id: number;
    path: string;
    method: string;
    statusCode: number;
    responseTime: number;
    ipString: string;
    createdAt: string;
};
