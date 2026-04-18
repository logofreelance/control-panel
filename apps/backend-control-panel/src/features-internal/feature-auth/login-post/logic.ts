/**
 * login-post/logic.ts
 */
import bcrypt from 'bcryptjs';
import * as model from './model';
import { LOGIN_MESSAGES } from './config';

export async function processLogin(db: any, lucia: any, usernameRaw: string, passwordRaw: string) {
    const username = (usernameRaw || '').replace(/\0/g, '').substring(0, 255);
    const password = (passwordRaw || '').substring(0, 1024);
    
    if (!username || !password) throw new Error(LOGIN_MESSAGES.invalid);
    
    const user = await model.findAdminUserByUsername(db, username);
    if (!user) {
        await bcrypt.compare('dummy', '$2a$10$dummyHashToPreventTimingAttacks...');
        throw new Error(LOGIN_MESSAGES.invalid);
    }
    
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) throw new Error(LOGIN_MESSAGES.invalid);
    
    const session = await lucia.createSession(user.id, {});
    return { token: session.id, user: { id: user.id, username, role: user.role } };
}
