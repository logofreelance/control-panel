import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AppEnv } from '../utils/env';
import {
    parseDbUrl,
    detectProvider,
    injectProviderParams,
} from '../utils/db-utils';
import { SystemStatus, DbValidationResult } from '../types';
import { CORE_CONSTANTS } from '../config/constants';
import { CORE_LABELS } from '../config/labels';
import { ISystemRepository } from '../types/repository';

const L = CORE_LABELS.MESSAGES;
const E = CORE_LABELS.ERRORS;

export class SystemService {
    constructor(private repo: ISystemRepository) { }

    async getSystemStatus(dbUrl?: string, corsOrigin?: string, nodeEnv?: string): Promise<SystemStatus> {
        let isDbConnected = false;
        let isInitialized = false;
        let isAdminCreated = false;
        let provider: { name: string; icon: string } | null = null;
        let tablesCount = 0;
        let connectionError: string | null = null;


        const maskDbUrl = (url: string): string => {
            try {
                const parsed = parseDbUrl(url);
                if (!parsed) return L.INVALID_FORMAT;
                return `mysql://****:****@${parsed.host}:${parsed.port}/${parsed.database}`;
            } catch {
                return L.PARSE_ERROR;
            }
        };

        if (dbUrl) {
            const parsed = parseDbUrl(dbUrl);
            if (parsed) {
                provider = detectProvider(parsed.host);
            }

            try {
                isDbConnected = await this.repo.checkConnection(dbUrl);

                if (isDbConnected) {
                    try {
                        tablesCount = await this.repo.getTablesCount(dbUrl);
                        const adminTableExists = await this.repo.hasAdminTable(dbUrl);
                        if (adminTableExists) {
                            isInitialized = true;
                            isAdminCreated = await this.repo.hasAdmin(dbUrl);
                        } else {
                            isInitialized = false;
                        }
                    } catch {
                        isInitialized = false;
                    }
                }
            } catch (e: unknown) {
                isDbConnected = false;
                connectionError = e instanceof Error ? e.message : L.UNKNOWN_ERROR;
            }
        }

        return {
            hasDbUrl: !!dbUrl,
            isDbConnected,
            isInitialized,
            isAdminCreated,
            provider,
            tablesCount,
            debug: {
                databaseUrlConfigured: !!dbUrl,
                databaseUrlMasked: dbUrl ? maskDbUrl(dbUrl) : null,
                corsOrigin: corsOrigin || CORE_CONSTANTS.DEFAULTS.CORS_ORIGIN,
                nodeEnv: nodeEnv || CORE_CONSTANTS.DEFAULTS.NODE_ENV,
                connectionError
            }
        };
    }

    async validateDbUrl(dbUrl: string): Promise<DbValidationResult> {
        if (!dbUrl) {
            return {
                valid: false,
                message: E.DB_URL_INVALID,
                status: 'error'
            };
        }

        const parsed = parseDbUrl(dbUrl);
        if (!parsed) {
            return {
                valid: false,
                message: E.INVALID_DB_FORMAT,
                status: 'error'
            };
        }

        const provider = detectProvider(parsed.host);
        const hints: string[] = [];

        if (provider.requiredParams.length > 0) {
            const missingParams = provider.requiredParams.filter(p => !dbUrl.includes(p));
            if (missingParams.length > 0) {
                hints.push(L.PARAM_AUTO_ADD.replace(CORE_CONSTANTS.PLACEHOLDERS.TOKEN, missingParams.join(CORE_CONSTANTS.SEPARATORS.COMMA_SPACE)));
            }
        }

        return {
            valid: true,
            status: 'success',
            provider: { name: provider.name, icon: provider.icon },
            parsed: {
                host: parsed.host,
                port: parsed.port,
                database: parsed.database,
                user: parsed.user.substring(0, 4) + CORE_CONSTANTS.PLACEHOLDERS.HIDDEN
            },
            hints
        };
    }

    async setupDb(dbUrl: string) {
        if (!dbUrl) throw new Error(E.DB_URL_INVALID);

        const parsed = parseDbUrl(dbUrl);
        if (!parsed) {
            throw new Error(E.INVALID_DB_FORMAT);
        }

        const provider = detectProvider(parsed.host);
        const finalUrl = injectProviderParams(dbUrl, provider);

        try {
            // Check connection first
            await this.repo.checkConnection(finalUrl);

            // Persist to .env (Node.js environment only)
            try {
                // Dynamically import fs/path to avoid bundling issues in Edge/Worker
                const fs = await import('fs');
                const path = await import('path');

                const envPath = path.resolve(process.cwd(), CORE_CONSTANTS.DEFAULTS.ENV_FILE);
                let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, CORE_CONSTANTS.DEFAULTS.ENCODING.UTF8) : '';
                const dbKey = CORE_CONSTANTS.DEFAULTS.ENV_KEYS.DB_URL;
                const jwtKey = CORE_CONSTANTS.DEFAULTS.ENV_KEYS.JWT_SECRET;

                if (envContent.includes(dbKey)) {
                    // We construct regex dynamically but use a catch-all for the value
                    const regex = new RegExp(`${dbKey}.*`);
                    envContent = envContent.replace(regex, `${dbKey}${finalUrl}`);
                } else {
                    envContent += `\n${dbKey}${finalUrl}`;
                }

                if (!envContent.includes(jwtKey)) {
                    const secret = crypto.randomBytes(16).toString(CORE_CONSTANTS.DEFAULTS.ENCODING.HEX);
                    envContent += `\n${jwtKey}${secret}`;
                }

                fs.writeFileSync(envPath, envContent);
            } catch (fsErr) {
                console.warn('Skipping .env update (fs not available or restricted)', fsErr);
            }

            // Create tables
            const tablesCreated = await this.repo.createSystemTables(finalUrl);

            await this.repo.seedRoles(finalUrl);
            await this.repo.seedErrorTemplates(finalUrl);
            await this.repo.seedSettings(finalUrl, {
                siteName: CORE_CONSTANTS.DEFAULTS.SITE_NAME,
                siteTitle: CORE_CONSTANTS.DEFAULTS.SITE_TITLE,
                primaryColor: CORE_CONSTANTS.DEFAULTS.PRIMARY_COLOR
            });

            return {
                message: L.DB_READY,
                status: 'success',
                provider: { name: provider.name, icon: provider.icon },
                tablesCreated: tablesCreated
            };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            throw new Error(`${E.DB_CONNECTION_FAILED}: ${message}`);
        }
    }

    async installAdmin(dbUrl: string, username: string, passwordHash: string) {
        if (!dbUrl) throw new Error(E.DB_URL_INVALID);

        const adminExists = await this.repo.hasAdmin(dbUrl);
        if (adminExists) {
            throw new Error(E.ADMIN_EXISTS);
        }

        // Hash password
        const salt = await bcrypt.genSalt(CORE_CONSTANTS.DEFAULTS.AUTH.SALT_ROUNDS);
        const hash = await bcrypt.hash(passwordHash, salt);

        await this.repo.createAdmin(dbUrl, { username, passwordHash: hash });
        return { message: L.ADMIN_CREATED };
    }

    async runMigrations(dbUrl: string) {
        if (!dbUrl) throw new Error(E.DB_URL_INVALID);

        const results: string[] = [];

        try {
            await this.repo.seedRoles(dbUrl);
            results.push(L.ROLES_CHECK);

            await this.repo.seedErrorTemplates(dbUrl);
            results.push(L.TEMPLATES_CHECK);

            try {
                await this.repo.addMinRoleLevelColumn(dbUrl);
                results.push(L.MIN_ROLE_ADDED);
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : String(e);
                if (!msg.includes(CORE_CONSTANTS.DB.KEYWORDS.DUPLICATE)) results.push(L.MIN_ROLE_ERROR.replace(CORE_CONSTANTS.PLACEHOLDERS.TOKEN, msg));
                else results.push(L.ROLES_EXISTS);
            }

            try {
                await this.repo.addDescriptionColumn(dbUrl);
                results.push(L.DESC_ADDED);
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : String(e);
                if (!msg.includes(CORE_CONSTANTS.DB.KEYWORDS.DUPLICATE)) results.push(L.DESC_ERROR.replace(CORE_CONSTANTS.PLACEHOLDERS.TOKEN, msg));
                else results.push(L.DESC_EXISTS);
            }

            return { status: 'success', message: L.MIGRATION_SUCCESS, results };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            throw new Error(`${E.MIGRATION_FAILED}: ${message}`);
        }
    }
}
