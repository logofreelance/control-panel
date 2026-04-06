import { Hono } from 'hono';
import { ApiKeyController } from './controllers';

export function setupClientApiKeysRouter() {
    const router = new Hono<{ Variables: { targetDb: any, targetId: string } }>();

    // Route langsung menggunakan controller tanpa middleware lokal 
    // karena sudah ditangani oleh Middleware Global di index.ts
    router.get('/', ApiKeyController.getAll);
    router.post('/', ApiKeyController.create);
    router.put('/:id/toggle', ApiKeyController.toggle);
    router.delete('/:id', ApiKeyController.delete);

    return router as any;
}
