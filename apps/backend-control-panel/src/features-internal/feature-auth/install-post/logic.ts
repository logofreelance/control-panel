/**
 * install-post/logic.ts
 */
import bcrypt from 'bcryptjs';
import * as model from './model';

export async function processAdminInstall(db: any, usernameRaw: string, passwordRaw: string) {
    const username = (usernameRaw || '').replace(/\0/g, '').substring(0, 255).trim();
    const password = (passwordRaw || '').substring(0, 1024);
    
    if (!username || !password || password.length < 6) {
        throw new Error('Username and password (min 6 chars) are required');
    }
    
    const count = await model.getAdminUsersCount(db);
    if (count > 0) throw new Error('Admin user already exists. Cannot re-install.');
    
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    
    await model.createAdminUser(db, userId, username, passwordHash);
    return { id: userId, username, role: 'admin' };
}
