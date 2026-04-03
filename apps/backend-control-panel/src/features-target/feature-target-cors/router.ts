import { Hono } from 'hono';
import { CorsController } from './controllers';
import { injectTargetDatabase } from './middleware';
import type { EnvironmentConfig } from '../../env';
import type { FeatureEnv } from './middleware';

/**
 * Setup Target CORS Feature Router
 * Self-contained module.
 */
export function setupTargetCorsRouter(envConfig: EnvironmentConfig) {
    const router = new Hono<FeatureEnv>();

    // Inject DB middleware
    router.use('*', injectTargetDatabase(envConfig));

    // Routes
    router.get('/', CorsController.getAll);
    router.post('/', CorsController.create);
    router.put('/:id/toggle', CorsController.toggle);
    router.delete('/:id', CorsController.delete);

    return router as any;
}
