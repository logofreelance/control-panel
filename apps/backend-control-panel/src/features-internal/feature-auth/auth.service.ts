import bcrypt from 'bcryptjs';
import type { InternalDatabaseConnection } from '../internal.db';
import type { AuthPanelLuciaInstance } from './auth.lucia';
import { findAdminUserByUsername, findAdminUserProfileById, updateAdminUserPassword, updateAdminUserProfile } from './auth.repository';
import { AUTH_PANEL_ERROR_CODES } from './auth.messages';
import type { AuthPanelLoginResult } from './auth.types';

export async function loginAdminUser(
    db: InternalDatabaseConnection,
    lucia: AuthPanelLuciaInstance,
    username: string,
    passwordRaw: string
): Promise<AuthPanelLoginResult> {
    console.log("[AUTH-SERVICE] Starting login for user:", username);
    const user = await findAdminUserByUsername(db, username);
    if (!user) {
        console.log("[AUTH-SERVICE] User not found");
        throw new Error(AUTH_PANEL_ERROR_CODES.AUTH_INVALID_CREDENTIALS);
    }
    
    console.log("[AUTH-SERVICE] User found, comparing password...");
    const validPassword = await bcrypt.compare(passwordRaw, user.password_hash);
    if (!validPassword) {
        console.log("[AUTH-SERVICE] Invalid password");
        throw new Error(AUTH_PANEL_ERROR_CODES.AUTH_INVALID_CREDENTIALS);
    }
    
    console.log("[AUTH-SERVICE] Password valid, creating session...");
    const session = await lucia.createSession(user.id, {});
    console.log("[AUTH-SERVICE] Session created successfully:", session.id);
    
    return {
        token: session.id,
        user: { id: user.id, username, role: user.role }
    };
}

export async function logoutAdminUser(lucia: AuthPanelLuciaInstance, sessionId: string): Promise<void> {
    await lucia.invalidateSession(sessionId);
}

export async function getAdminProfile(db: InternalDatabaseConnection, userId: string) {
    const profile = await findAdminUserProfileById(db, userId);
    if (!profile) throw new Error(AUTH_PANEL_ERROR_CODES.AUTH_UNAUTHORIZED);
    return profile;
}

export async function processUpdateAdminProfile(db: InternalDatabaseConnection, userId: string, username: string) {
    if (!username || username.trim() === '') throw new Error(AUTH_PANEL_ERROR_CODES.AUTH_VALIDATION_ERROR);
    await updateAdminUserProfile(db, userId, username);
    return await findAdminUserProfileById(db, userId);
}

export async function setupFirstAdminUser(db: InternalDatabaseConnection, username: string, passwordRaw: string) {
    if (!username || !passwordRaw || passwordRaw.length < 6) {
        throw new Error(AUTH_PANEL_ERROR_CODES.AUTH_VALIDATION_ERROR);
    }
    
    // Check if any admin exists
    const res: any = await db.execute('SELECT COUNT(*) as count FROM admin_users');
    const rows = Array.isArray(res) ? res : res.rows;
    if (Number(rows[0]?.count || 0) > 0) {
        throw new Error('Admin user already exists. Cannot re-install.');
    }
    
    // Create new admin
    const passwordHash = await bcrypt.hash(passwordRaw, 10);
    const userId = crypto.randomUUID();
    
    const { createAdminUser } = await import('./auth.repository');
    await createAdminUser(db, userId, username, passwordHash);
    
    return { id: userId, username, role: 'admin' };
}

export async function processChangeAdminPassword(db: InternalDatabaseConnection, userId: string, currentPasswordRaw: string, newPasswordRaw: string) {
    if (!newPasswordRaw || newPasswordRaw.length < 6) {
        throw new Error(AUTH_PANEL_ERROR_CODES.AUTH_VALIDATION_ERROR);
    }
    
    const user = await findAdminUserProfileById(db, userId);
    if (!user) throw new Error(AUTH_PANEL_ERROR_CODES.AUTH_UNAUTHORIZED);

    const fullUser = await findAdminUserByUsername(db, user.username);
    if (!fullUser) throw new Error(AUTH_PANEL_ERROR_CODES.AUTH_UNAUTHORIZED);

    const validPassword = await bcrypt.compare(currentPasswordRaw, fullUser.password_hash);
    if (!validPassword) {
        throw new Error(AUTH_PANEL_ERROR_CODES.AUTH_INVALID_CREDENTIALS);
    }

    const newPasswordHash = await bcrypt.hash(newPasswordRaw, 10);
    await updateAdminUserPassword(db, userId, newPasswordHash);
    return true;
}
