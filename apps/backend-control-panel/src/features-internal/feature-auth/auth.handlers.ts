import type { Context } from 'hono';
import type { InternalDatabaseConnection } from '../internal.db';
import type { AuthPanelLuciaInstance } from './auth.lucia';
import { loginAdminUser, logoutAdminUser, getAdminProfile, processUpdateAdminProfile, processChangeAdminPassword } from './auth.service';
import { AUTH_PANEL_RESPONSE_MESSAGES, AUTH_PANEL_ERROR_CODES } from './auth.messages';

function respondSuccess(c: Context, data: any, message: string, statusCode = 200) {
    return c.json({ success: true, data, message }, statusCode as any);
}

function respondError(c: Context, errorCode: string, message: string, statusCode: number) {
    return c.json({ success: false, error: { code: errorCode, message } }, statusCode as any);
}

export async function handleAdminLogin(c: Context, db: InternalDatabaseConnection, lucia: AuthPanelLuciaInstance) {
    try {
        const { username, password } = await c.req.json();
        const result = await loginAdminUser(db, lucia, username, password);
        
        const cookie = lucia.createSessionCookie(result.token);
        c.header('Set-Cookie', cookie.serialize(), { append: true });
        
        return respondSuccess(c, result, AUTH_PANEL_RESPONSE_MESSAGES.loginSuccess);
    } catch (err: any) {
        return respondError(c, AUTH_PANEL_ERROR_CODES.AUTH_INVALID_CREDENTIALS, 'Invalid credentials', 401);
    }
}

export async function handleAdminLogout(c: Context, lucia: AuthPanelLuciaInstance) {
    const bearer = c.req.header('Authorization')?.replace('Bearer ', '');
    const cookie = c.req.header('Cookie')?.match(new RegExp(`${lucia.sessionCookieName}=([^;]+)`))?.[1];
    const token = bearer || cookie;
    
    if (token) await logoutAdminUser(lucia, token);
    
    const blankCookie = lucia.createBlankSessionCookie();
    c.header('Set-Cookie', blankCookie.serialize(), { append: true });
    
    return respondSuccess(c, null, AUTH_PANEL_RESPONSE_MESSAGES.logoutSuccess);
}

export async function handleGetAdminProfile(c: Context, db: InternalDatabaseConnection) {
    const user = c.get('user');
    if (!user) return respondError(c, AUTH_PANEL_ERROR_CODES.AUTH_UNAUTHORIZED, 'Unauthorized', 401);
    
    try {
        const profile = await getAdminProfile(db, user.id);
        return respondSuccess(c, profile, 'Profile retrieved');
    } catch (err: any) {
        return respondError(c, AUTH_PANEL_ERROR_CODES.AUTH_UNKNOWN_ERROR, err.message, 500);
    }
}

export async function handleUpdateAdminProfile(c: Context, db: InternalDatabaseConnection) {
    const user = c.get('user');
    if (!user) return respondError(c, AUTH_PANEL_ERROR_CODES.AUTH_UNAUTHORIZED, 'Unauthorized', 401);
    
    try {
        const { username } = await c.req.json();
        const updated = await processUpdateAdminProfile(db, user.id, username);
        return respondSuccess(c, updated, AUTH_PANEL_RESPONSE_MESSAGES.profileUpdated);
    } catch (err: any) {
        return respondError(c, AUTH_PANEL_ERROR_CODES.AUTH_VALIDATION_ERROR, err.message, 400);
    }
}

export async function handleAdminInstall(c: Context, db: InternalDatabaseConnection) {
    try {
        const { setupFirstAdminUser } = await import('./auth.service');
        const { username, password } = await c.req.json();
        const newAdmin = await setupFirstAdminUser(db, username, password);
        return respondSuccess(c, newAdmin, 'Installation Complete! Admin user created successfully.', 201);
    } catch (err: any) {
        return respondError(c, 'INSTALL_FAILED', err.message, 400);
    }
}

export async function handleChangeAdminPassword(c: Context, db: InternalDatabaseConnection) {
    const user = c.get('user');
    if (!user) return respondError(c, AUTH_PANEL_ERROR_CODES.AUTH_UNAUTHORIZED, 'Unauthorized', 401);
    
    try {
        const { currentPassword, newPassword } = await c.req.json();
        await processChangeAdminPassword(db, user.id, currentPassword, newPassword);
        return respondSuccess(c, null, 'Password successfully updated');
    } catch (err: any) {
        return respondError(c, AUTH_PANEL_ERROR_CODES.AUTH_VALIDATION_ERROR, err.message, 400);
    }
}
