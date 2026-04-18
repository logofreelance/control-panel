/**
 * change-password-put/logic.ts
 */
import bcrypt from 'bcryptjs';
import * as model from './model';

export async function processChangeAdminPassword(db: any, userId: string, currentPasswordRaw: string, newPasswordRaw: string) {
    const currentPassword = (currentPasswordRaw || '').substring(0, 1024);
    const newPassword = (newPasswordRaw || '').substring(0, 1024);
    
    if (!newPassword || newPassword.length < 6) throw new Error('Password must be at least 6 characters');
    
    const user = await model.findAdminUserById(db, userId);
    if (!user) throw new Error('Unauthorized');
    
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) throw new Error('Invalid credentials');
    
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await model.updateAdminUserPassword(db, userId, newPasswordHash);
    return true;
}
