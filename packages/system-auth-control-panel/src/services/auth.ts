import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AUTH_CONSTANTS } from '../config/constants';
import { AUTH_LABELS } from '../config/labels';
import { IAuthRepository } from '../types/repository';

const SYS = AUTH_CONSTANTS;
const MSG = AUTH_LABELS.messages;

export class AuthService {
    constructor(private repo: IAuthRepository, private jwtSecret: string) {
        if (!jwtSecret) throw new Error(SYS.ERRORS.JWT_SECRET_MISSING);
    }

    async adminLogin(username: string, password: string) {
        const user = await this.repo.findAdminByUsername(username);

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            throw new Error(MSG.invalidCredentials);
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            this.jwtSecret,
            { expiresIn: SYS.JWT.ADMIN_EXPIRES_IN }
        );

        return { token };
    }

    async updateAdminProfile(id: number, newUsername: string) {
        await this.repo.updateAdmin(id, { username: newUsername });
        return { message: MSG.profileUpdated };
    }

    async changeAdminPassword(id: number, currentPassword: string, newPassword: string) {
        // Verify current password for this specific user
        const admin = await this.repo.findAdminById(id);
        if (!admin) throw new Error(MSG.adminNotFound);

        const limits = SYS.PASSWORD || { PASSWORD_MIN_LENGTH: 8 };

        // Check password
        const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
        if (!isMatch) throw new Error(MSG.wrongPassword);

        // Validate new password
        if (newPassword.length < limits.PASSWORD_MIN_LENGTH) {
            throw new Error(MSG.passwordTooShort);
        }

        const newHash = await bcrypt.hash(newPassword, 10);

        await this.repo.updateAdmin(id, { passwordHash: newHash });

        return { message: MSG.passwordChanged };
    }

    verifyToken(token: string) {
        try {
            const payload = jwt.verify(token, this.jwtSecret);
            return { valid: true, payload };
        } catch {
            throw new Error(MSG.tokenInvalid);
        }
    }

    decodeUser(token: string) {
        try {
            interface UserPayload {
                id: number;
                username: string;
                email: string;
                role: string;
                permissions?: string[];
            }

            const payload = jwt.verify(token, this.jwtSecret) as UserPayload;
            return {
                id: payload.id,
                username: payload.username,
                email: payload.email,
                role: payload.role,
                permissions: payload.permissions || []
            };
        } catch {
            throw new Error(MSG.tokenInvalid);
        }
    }
}
