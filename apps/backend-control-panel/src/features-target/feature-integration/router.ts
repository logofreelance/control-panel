import { Hono } from 'hono';
import { IntegrationService } from './services';

export function setupIntegrationRouter() {
    const router = new Hono<{ Variables: { targetDb: any, targetId: string } }>();

    // Middleware guard: pastikan koneksi database target tersedia
    router.use('*', async (c, next) => {
        if (!c.get('targetDb')) {
            return c.json({ status: 'error', message: 'Target database connection not established.' }, 400);
        }
        await next();
    });

    router.get('/', async (c) => {
        try {
            const db = c.get('targetDb');
            // Assuming base URL comes from somewhere, we'll try to find it from headers or a platform setting
            const host = c.req.header('host') || '';
            const protocol = c.req.header('x-forwarded-proto') || 'http';
            const baseUrl = `${protocol}://${host}/api/v1`; // dynamic backend is usually at /api/v1
            
            const docs = await IntegrationService.getFullDocumentation(db, baseUrl);
            return c.json({ status: 'success', data: docs });
        } catch (error: any) {
            return c.json({ status: 'error', message: error.message }, 500);
        }
    });

    return router as any;
}
