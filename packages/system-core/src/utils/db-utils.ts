
import { ParsedDbUrl, ProviderInfo } from '../types';
import { CORE_CONSTANTS } from '../config/constants';

const DB = CORE_CONSTANTS.DB;

/**
 * Parse database URL into components
 */
export function parseDbUrl(url: string): ParsedDbUrl | null {
    try {
        const regex = DB.REGEX;
        const match = url.match(regex);
        if (!match) return null;
        return {
            user: match[1],
            password: match[2],
            host: match[3],
            port: parseInt(match[4]),
            database: match[5],
            params: match[6] || ''
        };
    } catch {
        return null;
    }
}

/**
 * Detect database provider from hostname
 */
export function detectProvider(host: string): ProviderInfo {
    if (host.includes(DB.PROVIDERS.TIDB.HOST)) {
        return {
            name: DB.PROVIDERS.TIDB.NAME,
            requiredParams: [DB.PROVIDERS.TIDB.PARAM],
            icon: DB.PROVIDERS.TIDB.ICON
        };
    }
    if (host.includes(DB.PROVIDERS.PLANETSCALE.HOST)) {
        return {
            name: DB.PROVIDERS.PLANETSCALE.NAME,
            requiredParams: [],
            icon: DB.PROVIDERS.PLANETSCALE.ICON
        };
    }
    if (host.includes(DB.PROVIDERS.AIVEN.HOST)) {
        return {
            name: DB.PROVIDERS.AIVEN.NAME,
            requiredParams: [],
            icon: DB.PROVIDERS.AIVEN.ICON
        };
    }
    return {
        name: DB.PROVIDERS.MYSQL.NAME,
        requiredParams: [],
        icon: DB.PROVIDERS.MYSQL.ICON
    };
}

/**
 * Inject required parameters for provider
 */
export function injectProviderParams(url: string, provider: ProviderInfo): string {
    if (provider.requiredParams.length === 0) return url;

    let finalUrl = url;
    for (const param of provider.requiredParams) {
        if (!finalUrl.includes(param)) {
            finalUrl = finalUrl.includes(DB.URL_SEPARATORS.QUERY)
                ? `${finalUrl}${DB.URL_SEPARATORS.PARAM}${param}`
                : `${finalUrl}${DB.URL_SEPARATORS.QUERY}${param}`;
        }
    }
    return finalUrl;
}
