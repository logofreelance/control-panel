import { IAuthRepository } from '@cp/middleware';
import { createDb, eq } from '@modular/database';
import { getRoleLevel } from '@cp/config'; // Can still use config in backend app

export class DrizzleAuthRepository implements IAuthRepository {
    constructor(private dbUrl: string) { }

    async isTokenBlacklisted(tokenHash: string): Promise<boolean> {
        // Token blacklist table was removed (migrated to Lucia Auth sessions)
        return false;
    }

    getRoleLevel(role: string): number {
        return getRoleLevel(role);
    }
}
