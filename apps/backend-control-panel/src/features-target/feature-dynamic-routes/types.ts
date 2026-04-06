import { Context } from 'hono';

export interface RouteCategory {
    id: string;
    name: string;
    description: string;
    created_at?: string;
}

export interface DynamicRoute {
    id: string;
    endpoint: string;
    method: string;
    handler_type: string;
    handler_config: any;
    category_id: string | null;
    is_active: number;
    description: string;
    created_at?: string;
}

export interface ErrorTemplate {
    id: string;
    status_code: number;
    title: string;
    message_template: string;
    response_format: string;
    created_at?: string;
}

// App Environment Context for Hono
export type AppEnv = {
    Variables: {
        targetDb: any; // The dynamically injected target database connection
        targetId: string;
    }
};
