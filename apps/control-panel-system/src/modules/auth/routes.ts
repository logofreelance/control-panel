// modules/auth/routes.ts
// Admin-only authentication routes
// User auth is handled by Green layer

import { Hono, Context } from 'hono';
import { AuthHonoHandlers, AuthService } from '@cp/auth';
import { DrizzleAuthRepository } from '../../repositories/system-auth-control-panel/auth';
import { getEnv, systemNotReady } from '@cp/config';

// Define Hono Environment
type AppEnv = {
    Variables: {
        auth: AuthHonoHandlers;
    }
};

export const authRouter = new Hono<AppEnv>();

// Middleware to inject handlers
authRouter.use('*', async (c, next) => {
    const env = getEnv(c);
    if (!env.DATABASE_URL) return systemNotReady(c);

    const { createDb } = await import('@modular/database');
    const db = createDb(env.DATABASE_URL);
    const jwtSecret = env.JWT_SECRET;

    if (!jwtSecret) return systemNotReady(c); // Or distinct error for missing secret

    const repo = new DrizzleAuthRepository(db);
    const service = new AuthService(repo, jwtSecret);
    const handlers = new AuthHonoHandlers(service);

    c.set('auth', handlers);
    await next();
});

const auth = (c: Context) => c.get('auth') as AuthHonoHandlers;

// ============================================
// ADMIN AUTHENTICATION ONLY
// ============================================

// Admin login (for dashboard access)
authRouter.post('/login', (c) => auth(c).login(c));

// Admin profile management
authRouter.post('/update-profile', (c) => auth(c).updateProfile(c));
authRouter.post('/change-password', (c) => auth(c).changePassword(c));

// NOTE: User auth (/user-login, /user-register) moved to Green layer
// Use /green/auth/login and /green/auth/register for user authentication
