import { Hono } from 'hono';
import type { InternalDatabaseConnection } from '../internal.db';
import type { AuthPanelLuciaInstance } from './auth.lucia';
import { handleAdminLogin, handleAdminLogout, handleGetAdminProfile, handleUpdateAdminProfile, handleChangeAdminPassword, handleAdminInstall } from './auth.handlers';
import { AUTH_PANEL_ROUTE_PATHS } from './auth.config';

export function setupAuthPanelRoutes(
    router: Hono<{ Variables: { user: any, session: any } }>, 
    db: InternalDatabaseConnection, 
    lucia: AuthPanelLuciaInstance
) {
    // Middleware extract session
    router.use('*', async (c, next) => {
        const sessionId = lucia.readSessionCookie(c.req.header('Cookie') ?? "") 
                       ?? lucia.readBearerToken(c.req.header('Authorization') ?? "");
                       
        if (!sessionId) {
            c.set('user', null);
            c.set('session', null);
            return next();
        }

        try {
            const { session, user } = await lucia.validateSession(sessionId);
            if (session && session.fresh) {
                c.header('Set-Cookie', lucia.createSessionCookie(session.id).serialize(), { append: true });
            }
            if (!session) {
                c.header('Set-Cookie', lucia.createBlankSessionCookie().serialize(), { append: true });
            }
            
            c.set('session', session);
            c.set('user', user);
        } catch (err) {
            // Session validation failed (corrupt session, DB error, etc.)
            // Gracefully degrade to unauthenticated state
            console.error('[AUTH MIDDLEWARE] Session validation failed:', err);
            c.set('session', null);
            c.set('user', null);
            c.header('Set-Cookie', lucia.createBlankSessionCookie().serialize(), { append: true });
        }
        return next();
    });

    router.post(AUTH_PANEL_ROUTE_PATHS.login, (c) => handleAdminLogin(c, db, lucia));
    router.post(AUTH_PANEL_ROUTE_PATHS.logout, (c) => handleAdminLogout(c, lucia));
    router.get(AUTH_PANEL_ROUTE_PATHS.currentUser, (c) => handleGetAdminProfile(c, db));
    router.put(AUTH_PANEL_ROUTE_PATHS.updateProfile, (c) => handleUpdateAdminProfile(c, db));
    router.put(AUTH_PANEL_ROUTE_PATHS.changePassword, (c) => handleChangeAdminPassword(c, db));
    router.post(AUTH_PANEL_ROUTE_PATHS.install, (c) => handleAdminInstall(c, db));
}
