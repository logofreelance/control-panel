/**
 * apps/backend-orange/src/container.ts
 * 
 * Manual Dependency Injection Container
 * "The Switchboard" - Wires up everything.
 * 
 * Uses LAZY INITIALIZATION with dynamic DATABASE_URL.
 * Compatible with Cloudflare Workers (uses c.env, not process.env).
 */

import { createDb } from '@modular/database';
import { isDev } from '@cp/config';
import { UserRepository, DataRepository, SettingsRepository } from '@modular/database';
import { UsersService, RolesService, PermissionsService } from '@cp/user-manager';
import { ApiKeysService, CorsService } from '@cp/api-manager';
import { DataService } from '@cp/datasource-manager';
import { SettingsService } from '@cp/settings-manager';
import { StorageService } from '@cp/storage-manager';
import {
    MonitorService,
    ErrorTemplateService,
} from '@cp/core';
import { DrizzleMonitorRepository } from './repositories/system-core/monitor';
import { DrizzleErrorTemplateRepository } from './repositories/system-core/error-templates';
import { DrizzleCorsRepository } from './repositories/system-api/cors';
import { DrizzleApiKeysRepository } from './repositories/system-api/api-keys';
import { DrizzleStorageRepository } from './repositories/system-storage/storage';
import { DrizzleSettingsRepository } from './repositories/system-settings/settings';
import { DrizzleRolesRepository } from './repositories/system-users/roles';
import { DrizzlePermissionsRepository } from './repositories/system-users/permissions';
import { TOKENS } from '@modular/contracts';

// Cache containers by DATABASE_URL to avoid recreating on every request
const containerCache = new Map<string, ContainerInstance>();

// Track initialization errors for debugging
interface InitError {
    token: string;
    error: string;
    stack?: string;
}

class ContainerInstance {
    private services = new Map<string, unknown>();
    private repositories = new Map<string, unknown>();
    private db: ReturnType<typeof createDb>;
    private initErrors: InitError[] = [];
    private initialized = false;

    constructor(dbUrl: string) {
        try {
            // 1. Initialize Database
            this.db = createDb(dbUrl);
            if (isDev()) console.log('[CONTAINER] Database connection created');

            // 2. Initialize Repositories (The "Power Plants")
            this.initRepositories();

            // 3. Initialize Services (The "Electric Meters") with Injection
            this.initServices(dbUrl);

            this.initialized = true;
            if (isDev()) console.log('[CONTAINER] Initialization complete. Errors:', this.initErrors.length);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            const stack = err instanceof Error ? err.stack : undefined;
            console.error('[CONTAINER] CRITICAL: Failed to initialize container:', message);
            this.initErrors.push({ token: 'CONTAINER_INIT', error: message, stack });
            throw err;
        }
    }

    private initRepositories() {
        const repoConfigs = [
            { token: TOKENS.UserRepository, factory: () => new UserRepository(this.db) },
            { token: TOKENS.ApiKeysRepository, factory: () => new DrizzleApiKeysRepository(this.db) },
            { token: TOKENS.SettingsRepository, factory: () => new SettingsRepository(this.db) },
            { token: TOKENS.DataRepository, factory: () => new DataRepository(this.db) },
        ];

        for (const config of repoConfigs) {
            try {
                this.repositories.set(config.token, config.factory());
                if (isDev()) console.log(`[CONTAINER] Repository initialized: ${config.token}`);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : String(err);
                const stack = err instanceof Error ? err.stack : undefined;
                console.error(`[CONTAINER] Failed to init repository ${config.token}:`, message);
                this.initErrors.push({ token: config.token, error: message, stack });
            }
        }
    }

    private initServices(dbUrl: string) {
        const userRepo = this.repositories.get(TOKENS.UserRepository) as UserRepository | undefined;
        // Use the Interface or the concrete Drizzle class
        const apiRepo = this.repositories.get(TOKENS.ApiKeysRepository) as DrizzleApiKeysRepository | undefined;
        const settingsRepo = this.repositories.get(TOKENS.SettingsRepository) as SettingsRepository | undefined;
        const dataRepo = this.repositories.get(TOKENS.DataRepository) as DataRepository | undefined;

        const serviceConfigs = [
            { token: TOKENS.UserService, factory: () => userRepo ? new UsersService(userRepo) : null, required: 'UserRepository' },
            { token: TOKENS.RolesService, factory: () => new RolesService(new DrizzleRolesRepository(dbUrl)), required: null },
            { token: TOKENS.PermissionsService, factory: () => new PermissionsService(new DrizzlePermissionsRepository(dbUrl)), required: null },
            {
                token: TOKENS.MonitorService,
                factory: () => new MonitorService(new DrizzleMonitorRepository(this.db)),
                required: null
            },
            {
                token: TOKENS.ErrorTemplateService,
                factory: () => new ErrorTemplateService(new DrizzleErrorTemplateRepository(this.db)),
                required: null
            },
            { token: TOKENS.StorageService, factory: () => new StorageService(new DrizzleStorageRepository(dbUrl)), required: null },
            { token: TOKENS.CorsService, factory: () => new CorsService(new DrizzleCorsRepository(this.db)), required: null },
            { token: TOKENS.ApiKeysService, factory: () => apiRepo ? new ApiKeysService(apiRepo) : null, required: 'ApiKeysRepository' },
            { token: TOKENS.SettingsService, factory: () => new SettingsService(new DrizzleSettingsRepository(dbUrl)), required: 'SettingsRepository' },
            // DataService is now instantiated in routes.ts with DrizzleDataRepository
            // { token: TOKENS.DataService, factory: () => dataRepo ? new DataService(dataRepo) : null, required: 'DataRepository' },
        ];

        for (const config of serviceConfigs) {
            try {
                const service = config.factory();
                if (service) {
                    this.services.set(config.token, service);
                    if (isDev()) console.log(`[CONTAINER] Service initialized: ${config.token}`);
                } else if (config.required) {
                    console.warn(`[CONTAINER] Service ${config.token} skipped: missing ${config.required}`);
                    this.initErrors.push({ token: config.token, error: `Missing dependency: ${config.required}` });
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : String(err);
                const stack = err instanceof Error ? err.stack : undefined;
                console.error(`[CONTAINER] Failed to init service ${config.token}:`, message);
                this.initErrors.push({ token: config.token, error: message, stack });
            }
        }
    }

    resolve<T>(token: string): T {
        const service = this.services.get(token);
        if (service) return service as T;

        const repo = this.repositories.get(token);
        if (repo) return repo as T;

        // Check if this token had an initialization error
        const initError = this.initErrors.find(e => e.token === token);
        if (initError) {
            throw new Error(`Service/Repository ${token} failed to initialize: ${initError.error}`);
        }

        throw new Error(`Service/Repository not found for token: ${token}`);
    }

    // Debug method to get container status
    getStatus() {
        return {
            initialized: this.initialized,
            services: Array.from(this.services.keys()),
            repositories: Array.from(this.repositories.keys()),
            errors: this.initErrors,
        };
    }
}

/**
 * Get or create a container instance for the given DATABASE_URL.
 * This is the main export - call this with the URL from c.env.DATABASE_URL
 */
export function getContainer(dbUrl: string): ContainerInstance {
    let instance = containerCache.get(dbUrl);
    if (!instance) {
        if (isDev()) console.log('[CONTAINER] Creating new container instance');
        instance = new ContainerInstance(dbUrl);
        containerCache.set(dbUrl, instance);
    }
    return instance;
}

/**
 * Get container status for debugging (without creating if not exists)
 */
export function getContainerStatus(dbUrl: string): ReturnType<ContainerInstance['getStatus']> | null {
    const instance = containerCache.get(dbUrl);
    return instance ? instance.getStatus() : null;
}

/**
 * Clear container cache (useful for testing/hot-reload)
 */
export function clearContainerCache() {
    containerCache.clear();
    if (isDev()) console.log('[CONTAINER] Cache cleared');
}

// Legacy export for backward compatibility (will throw if DATABASE_URL not in process.env)
export const container = {
    resolve<T>(token: string): T {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) throw new Error('DATABASE_URL is not set. Use getContainer(dbUrl) instead.');
        return getContainer(dbUrl).resolve<T>(token);
    }
};
