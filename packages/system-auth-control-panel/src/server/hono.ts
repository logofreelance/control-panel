import { Context } from 'hono';
import { AuthService } from '../services/auth';
import { AUTH_CONSTANTS } from '../config/constants';
import { AUTH_LABELS } from '../config/labels';

const SYS = AUTH_CONSTANTS;
const MSG = AUTH_LABELS.messages;

const response = (c: Context, status: typeof SYS.STATUS.SUCCESS | typeof SYS.STATUS.ERROR, data: unknown = null, message?: string, code: number = SYS.HTTP_CODE.OK) => {
    return c.json({
        status,
        data,
        message,
        timestamp: new Date().toISOString(),
    }, code as any);
};

// Refactored to Class to support DI
export class AuthHonoHandlers {
    constructor(private service: AuthService) { }

    /**
     * POST /login
     */
    login = async (c: Context) => {
        try {
            const { username, password } = await c.req.json();
            const result = await this.service.adminLogin(username, password);
            return response(c, SYS.STATUS.SUCCESS, result);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            const code = msg === MSG.invalidCredentials ? SYS.HTTP_CODE.UNAUTHORIZED : SYS.HTTP_CODE.INTERNAL_ERROR;
            return response(c, SYS.STATUS.ERROR, null, msg, code as number);
        }
    }

    /**
     * POST /update-profile
     */
    updateProfile = async (c: Context) => {
        try {
            const { newUsername } = await c.req.json();

            // Extract ID from token manually since we don't have middleware here yet
            // In a better design, middleware would attach user to Context
            const authHeader = c.req.header('Authorization');
            if (!authHeader) throw new Error(MSG.noTokenProvided);
            const token = authHeader.split(SYS.TOKEN.SEPARATOR)[1];
            const { payload } = this.service.verifyToken(token);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const id = (payload as any).id;

            const result = await this.service.updateAdminProfile(id, newUsername);
            return response(c, SYS.STATUS.SUCCESS, null, result.message);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            return response(c, SYS.STATUS.ERROR, null, msg, SYS.HTTP_CODE.INTERNAL_ERROR);
        }
    }

    /**
     * POST /change-password
     */
    changePassword = async (c: Context) => {
        try {
            const { currentPassword, newPassword } = await c.req.json();

            const authHeader = c.req.header('Authorization');
            if (!authHeader) throw new Error(MSG.noTokenProvided);
            const token = authHeader.split(SYS.TOKEN.SEPARATOR)[1];
            const { payload } = this.service.verifyToken(token);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const id = (payload as any).id;

            const result = await this.service.changeAdminPassword(id, currentPassword, newPassword);
            return response(c, SYS.STATUS.SUCCESS, null, result.message);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            return response(c, SYS.STATUS.ERROR, null, msg, SYS.HTTP_CODE.INTERNAL_ERROR);
        }
    }

    verifyToken = async (c: Context) => {
        try {
            const authHeader = c.req.header('Authorization');
            if (!authHeader) return response(c, SYS.STATUS.ERROR, null, MSG.noTokenProvided, SYS.HTTP_CODE.UNAUTHORIZED);

            const token = authHeader.split(SYS.TOKEN.SEPARATOR)[1];
            const result = this.service.verifyToken(token);
            return response(c, SYS.STATUS.SUCCESS, result);
        } catch {
            return response(c, SYS.STATUS.ERROR, null, MSG.tokenInvalid, SYS.HTTP_CODE.UNAUTHORIZED);
        }
    }

    getCurrentUser = async (c: Context) => {
        try {
            const authHeader = c.req.header('Authorization');
            if (!authHeader) return response(c, SYS.STATUS.ERROR, null, MSG.noTokenProvided, SYS.HTTP_CODE.UNAUTHORIZED);

            const token = authHeader.split(SYS.TOKEN.SEPARATOR)[1];
            const result = this.service.decodeUser(token);
            return response(c, SYS.STATUS.SUCCESS, result);
        } catch {
            return response(c, SYS.STATUS.ERROR, null, MSG.tokenInvalid, SYS.HTTP_CODE.UNAUTHORIZED);
        }
    }

    logout = async (c: Context) => {
        return response(c, SYS.STATUS.SUCCESS, null, MSG.loggedOut);
    }
}
