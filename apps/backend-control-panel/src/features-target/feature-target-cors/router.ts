import { Hono } from 'hono';
import { CorsController } from './controllers';

/**
 * Setup Target CORS Feature Router (SaaS REFACTOR)
 */
export function setupTargetCorsRouter() {
    const router = new Hono<{ Variables: { targetDb: any, targetId: string } }>();

    // Route langsung menggunakan controller tanpa middleware lokal 
    // karena sudah ditangani oleh Middleware Global
    router.get('/', CorsController.getAll);
    router.post('/', CorsController.create);
    router.put('/:id/toggle', CorsController.toggle);
    router.delete('/:id', CorsController.delete);

    return router as any;
}
