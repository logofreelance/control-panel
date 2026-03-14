export interface ICorsRepository {
    findActiveDomains(): Promise<{ domain: string }[]>;
}

export interface IAuthRepository {
    isTokenBlacklisted(tokenHash: string): Promise<boolean>;
    getRoleLevel(role: string): number; // Config-like but can be in repo
}

export interface IApiLogRepository {
    logRequest(data: {
        apiKeyId?: number | null;
        endpoint: string;
        method: string;
        statusCode: number;
        durationMs: number;
        origin?: string | null;
        ip: string;
        userAgent?: string | null;
    }): Promise<void>;
}

export interface IApiKeyRepository {
    findByKey(key: string): Promise<{ id: number; isActive: boolean } | null>;
    updateLastUsed(id: number): Promise<void>;
}
