/**
 * packages/system-settings/src/config/constants.ts
 * 
 * Centralized Settings Constants
 * Migrated from @cp/config
 */

/**
 * Brand Configuration
 * 
 * Core identity constants used as default settings.
 */
export const BRAND = {
    /** Application name */
    NAME: 'Modular Engine',

    /** Default site title (shown in browser tab) */
    DEFAULT_SITE_TITLE: 'Dashboard',

    /** Primary brand color (hex) */
    PRIMARY_COLOR: '#8B5CF6',

    /** Secondary brand color (hex) */
    SECONDARY_COLOR: '#6366F1',

    /** Logo URL (relative to public folder) */
    LOGO_URL: '/logo.svg',

    /** Favicon URL */
    FAVICON_URL: '/favicon.ico',

    /** Current version */
    VERSION: '1.0.0',

    /** Copyright text */
    COPYRIGHT: '© 2024 Modular Engine',

    /** Support email */
    SUPPORT_EMAIL: 'support@modularengine.com',
} as const;

/**
 * Default site settings for database seeding
 */
export const DEFAULT_SITE_SETTINGS = {
    siteName: BRAND.NAME,
    siteTitle: BRAND.DEFAULT_SITE_TITLE,
    primaryColor: BRAND.PRIMARY_COLOR,
    metaDescription: 'A powerful modular backend engine',
    faviconUrl: BRAND.FAVICON_URL,
} as const;

/**
 * System Constants for Adapter logic
 */
export const SETTINGS_SYSTEM = {
    ENV_KEYS: {
        DATABASE_URL: 'DATABASE_URL',
    },
    STATUS: {
        SUCCESS: 'success' as const,
        ERROR: 'error' as const,
    },
    HTTP_CODE: {
        OK: 200,
        INTERNAL_ERROR: 500,
    },
    ERRORS: {
        DB_URL_MISSING: 'DATABASE_URL not found',
    },
    LOGS: {
        GET_ERROR: 'Settings.get Error:',
        UPDATE_ERROR: 'Settings.update Error:',
    },
} as const;
