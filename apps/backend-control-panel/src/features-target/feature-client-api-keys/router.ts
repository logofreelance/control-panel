import { Hono } from 'hono';
import { ApiKeyController } from './controllers';
import { injectTargetDatabase } from './middleware';
import type { EnvironmentConfig } from '../../env';
import type { FeatureEnv } from './middleware';

/**
 * Setup Client API Keys Feature Router
 * Self-contained module.
 */
export function setupClientApiKeysRouter(envConfig: EnvironmentConfig) {
    const router = new Hono<FeatureEnv>();

    // Inject DB middleware
    router.use('*', injectTargetDatabase(envConfig));

    // Routes
    router.get('/', ApiKeyController.getAll);
    router.post('/', ApiKeyController.create);
    router.put('/:id/toggle', ApiKeyController.toggle);
    router.delete('/:id', ApiKeyController.delete);

    return router as any;
}
