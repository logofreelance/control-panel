/**
 * router.ts — feature-auth
 */
import { Hono } from 'hono';
import { middleware as initAuthMiddleware } from './middleware/handler';
import { handler as loginPostHandler } from './login-post/handler';
import { handler as logoutPostHandler } from './logout-post/handler';
import { handler as meGetHandler } from './me-get/handler';
import { handler as updateProfilePutHandler } from './update-profile-put/handler';
import { handler as changePasswordPutHandler } from './change-password-put/handler';
import { handler as installPostHandler } from './install-post/handler';

import type { EnvironmentConfig } from '../../env';

export function createFeaturePanelAuth(env: EnvironmentConfig) {
    const router = new Hono<{ Variables: { user: any, session: any, internalDb: any, lucia: any } }>();

    // 1. Inisialisasi DB, Lucia, dan extract session untuk semua route di feature ini
    router.use('*', initAuthMiddleware(env));

    // 2. Daftarkan endpoints (Setiap endpoint adalah island terisolasi)
    router.post('/login', loginPostHandler);
    router.post('/logout', logoutPostHandler);
    router.get('/me', meGetHandler);
    router.put('/update-profile', updateProfilePutHandler);
    router.put('/change-password', changePasswordPutHandler);
    router.post('/install', installPostHandler);

    return router;
}

