/**
 * create-post/logic.ts
 */
import bcrypt from 'bcryptjs';
import * as model from './model';

export async function processCreateAdminUser(db: any, usernameRaw: string, passwordRaw: string, roleRaw: string) {
    const username = (usernameRaw || '').replace(/\0/g, '').substring(0, 255).trim();
    const password = (passwordRaw || '').substring(0, 1024);
    const role = (roleRaw || 'admin').replace(/\0/g, '').substring(0, 50).trim();
    
    if (!username || !password) throw new Error('Username & Password required');
    
    const hash = await bcrypt.hash(password, 10);
    const newId = crypto.randomUUID();
    
    await model.createAdminUser(db, newId, username, hash, role);
    return { id: newId, username, role };
}
