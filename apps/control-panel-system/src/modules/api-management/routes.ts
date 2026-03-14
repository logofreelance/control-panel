// modules/api-management/routes.ts
import { Hono, Context } from 'hono';
import * as proxyHandler from './proxy-handler';
import {
    ApiCategoriesHonoHandlers,
    ApiEndpointsHonoHandlers,
    ApiLogsHonoHandlers,
    ApiEndpointsService,
    ApiCategoriesService,
    ApiLogsService,
} from '@cp/api-manager';
import { DrizzleApiEndpointsRepository } from '../../repositories/system-api/endpoints';
import { DrizzleApiCategoriesRepository } from '../../repositories/system-api/categories';
import { DrizzleApiLogsRepository } from '../../repositories/system-api/logs';
import { getEnv, systemNotReady } from '@cp/config';

// Define Hono Environment
type AppEnv = {
    Variables: {
        categories: ApiCategoriesHonoHandlers;
        endpoints: ApiEndpointsHonoHandlers;
        logs: ApiLogsHonoHandlers;
    }
};

export const apiManagementRouter = new Hono<AppEnv>();

// Middleware to inject all handlers
apiManagementRouter.use('*', async (c, next) => {
    const env = getEnv(c);
    if (!env.DATABASE_URL) return systemNotReady(c);

    // Create DB instance once
    const { createDb } = await import('@modular/database');
    const db = createDb(env.DATABASE_URL);

    // 3. ApiCategories
    const categoriesRepo = new DrizzleApiCategoriesRepository(db);
    const categoriesService = new ApiCategoriesService(categoriesRepo);

    // 4. ApiEndpoints
    const endpointsRepo = new DrizzleApiEndpointsRepository(db);
    const endpointsService = new ApiEndpointsService(endpointsRepo);

    // 5. ApiLogs
    const logsRepo = new DrizzleApiLogsRepository(db);
    const logsService = new ApiLogsService(logsRepo);

    c.set('categories', new ApiCategoriesHonoHandlers(categoriesService));
    c.set('endpoints', new ApiEndpointsHonoHandlers(endpointsService));
    c.set('logs', new ApiLogsHonoHandlers(logsService));
    await next();
});

const cats = (c: Context) => c.get('categories') as ApiCategoriesHonoHandlers;
const ends = (c: Context) => c.get('endpoints') as ApiEndpointsHonoHandlers;
const logs = (c: Context) => c.get('logs') as ApiLogsHonoHandlers;

// Categories
apiManagementRouter.get('/categories', (c) => cats(c).list(c));
apiManagementRouter.post('/categories', (c) => cats(c).save(c));
apiManagementRouter.delete('/categories/:id', (c) => cats(c).delete(c));

// Endpoints
apiManagementRouter.get('/endpoints', (c) => ends(c).list(c));
apiManagementRouter.post('/endpoints', (c) => ends(c).save(c));

// Stats & Meta
apiManagementRouter.get('/endpoints/stats', (c) => ends(c).stats(c));
apiManagementRouter.get('/endpoints/check', (c) => ends(c).check(c));

// Detail & Operations
apiManagementRouter.get('/endpoints/:id', (c) => ends(c).detail(c));
apiManagementRouter.delete('/endpoints/:id', (c) => ends(c).delete(c));
apiManagementRouter.put('/endpoints/:id/toggle', (c) => ends(c).toggle(c));

// Logs
apiManagementRouter.get('/logs', (c) => logs(c).list(c));

// Proxy to Backend System (Server-to-Server)
apiManagementRouter.get('/api-routes', proxyHandler.getApiRoutes);

