import { ApiEndpoint, ApiCategory } from '../types';
import { env } from '@/lib/env';

interface SwaggerPathOperation {
    tags: string[];
    summary: string;
    description: string;
    responses: {
        '200': {
            description: string;
            content: {
                'application/json': {
                    schema: {
                        type: string;
                        example: unknown;
                    };
                };
            };
        };
    };
    requestBody?: {
        content: {
            'application/json': {
                schema: {
                    type: string;
                    properties: {
                        data: { type: string };
                    };
                };
            };
        };
    };
}

export const generateSwaggerJson = (endpoints: ApiEndpoint[], categories: ApiCategory[]) => {
    const paths: Record<string, Record<string, SwaggerPathOperation>> = {};

    endpoints.forEach(ep => {
        const path = `/green${ep.path}`;
        const method = ep.method.toLowerCase();

        if (!paths[path]) paths[path] = {};

        const category = categories.find(c => c.id === ep.categoryId);
        const tagName = category ? category.name : 'Uncategorized';

        paths[path][method] = {
            tags: [tagName],
            summary: ep.description || `Operation ${ep.method} ${ep.path}`,
            description: `Requires Role Level: ${ep.minRoleLevel || 0}`,
            responses: {
                '200': {
                    description: 'Successful operation',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                example: JSON.parse(ep.responseData || '{}')
                            }
                        }
                    }
                }
            }
        };

        // Add Request Body for Write Operations
        if (['post', 'put', 'patch'].includes(method)) {
            paths[path][method].requestBody = {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                // Dynamic placeholder
                                data: { type: 'object' }
                            }
                        }
                    }
                }
            };
        }
    });

    return {
        openapi: '3.0.0',
        info: {
            title: 'Dynamic API Engine',
            version: '1.0.0',
            description: 'Auto-generated API documentation from API Management Module'
        },
        servers: [
            {
                url: env.BACKEND_SYSTEM_API || 'http://localhost:3000',
                description: 'API Server'
            }
        ],
        paths
    };
};
