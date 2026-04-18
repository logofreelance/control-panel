/**
 * update-profile-put/logic.ts
 */
import * as model from './model';

export async function processUpdateAdminProfile(db: any, userId: string, usernameRaw: string) {
    const username = (usernameRaw || '').replace(/\0/g, '').substring(0, 255).trim();
    if (!username) throw new Error('Invalid username');
    await model.updateAdminUserProfile(db, userId, username);
    return await model.findAdminUserProfileById(db, userId);
}
