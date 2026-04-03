import { Hono } from 'hono';
import type { EnvironmentConfig } from '../../env';
import type { AppEnv } from './types';
import { injectTargetDatabase } from './middleware';
import { CategoryController, EndpointController, MiscController, ErrorTemplateController } from './controllers';

/**
 * FEATURE DYNAMIC ROUTES
 * - Di-mount di /api/route-builder
 * - Menyediakan endpoint CRUD untuk route categories, endpoints, logs, dan error templates
 */
export function setupDynamicRoutesRouter(envConfig: EnvironmentConfig) {
    const router = new Hono<AppEnv>();

    // 1. Inject Target Database Connection via Header: x-target-id
    router.use('*', injectTargetDatabase(envConfig));

    // 2. Categories Resource
    router.get('/categories', CategoryController.getAll);
    router.post('/categories', CategoryController.create);
    router.delete('/categories/:id', CategoryController.delete);

    // 3. Endpoints Resource
    router.get('/endpoints', EndpointController.getAll);
    router.post('/endpoints', EndpointController.create);
    router.get('/endpoints/stats', EndpointController.getStats);
    router.get('/endpoints/:id', EndpointController.getById);
    router.delete('/endpoints/:id', EndpointController.delete);
    router.put('/endpoints/:id/toggle', EndpointController.toggle);

    // 4. Logs
    router.get('/logs', MiscController.getLogs);

    // 5. Built-in Core API Routes
    router.get('/api-routes', MiscController.getApiRoutes);

    // 6. Error Templates
    router.get('/error-templates', ErrorTemplateController.getAll);
    router.post('/error-templates', ErrorTemplateController.create);
    router.delete('/error-templates/:id', ErrorTemplateController.delete);

    return router as any;
}
