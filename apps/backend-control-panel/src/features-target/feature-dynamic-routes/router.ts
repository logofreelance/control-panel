import { Hono } from 'hono';
import { CategoryController, EndpointController, MiscController, ErrorTemplateController } from './controllers';

/**
 * FEATURE DYNAMIC ROUTES (SaaS REFACTOR)
 * Menggunakan koneksi dinamis dari Middleware Global.
 */
export function setupDynamicRoutesRouter() {
    const router = new Hono<{ Variables: { targetDb: any, targetId: string } }>();

    // Middleware guard: pastikan koneksi database target tersedia
    router.use('*', async (c, next) => {
        if (!c.get('targetDb')) {
            return c.json({ status: 'error', message: 'Target database connection not established.' }, 400);
        }
        await next();
    });

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
