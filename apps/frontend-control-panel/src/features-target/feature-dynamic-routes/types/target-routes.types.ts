export interface ApiCategory {
    id: string;
    name: string;
    description?: string;
    roles?: string; // Comma-separated
    permissions?: string; // Comma-separated
    createdAt?: string;
    updatedAt?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ApiEndpoint {
    id: string;
    path: string;           // legacy field name (mapped from `endpoint`)
    endpoint?: string;      // new backend field name
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    description?: string;
    categoryId?: string;
    category_id?: string;   // snake_case from backend
    dataSourceId?: string;
    resourceId?: string;
    handler_type?: string;  // 'proxy' | 'json' | 'sql' etc
    handler_config?: string; // JSON string
    responseData?: string;  // JSON template
    roles?: string;
    permissions?: string;
    minRoleLevel?: number;  // 0=public, 10=user, 50=moderator, 90=admin
    isActive: boolean;
    is_active?: number;     // snake_case from backend (1/0)
    createdAt?: string;
    updatedAt?: string;
    created_at?: string;
    updated_at?: string;

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
    id: string;
    path: string;
    method: string;
    statusCode: number;
    responseTime: number;
    ipString: string;
    createdAt: string;
};
