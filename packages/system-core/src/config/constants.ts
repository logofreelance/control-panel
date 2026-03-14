/**
 * System Core Constants
 * Centralized constant values for the system-core package.
 */
export const CORE_CONSTANTS = {
    // Add constants here as needed during refactoring
    // Add constants here as needed during refactoring
    DB: {
        REGEX: /^mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)(\?.*)?$/,
        PROVIDERS: {
            TIDB: {
                HOST: 'tidbcloud.com',
                NAME: 'TiDB Cloud',
                PARAM: 'multipleStatements=true',
                ICON: '🐯'
            },
            PLANETSCALE: {
                HOST: 'planetscale.com',
                NAME: 'PlanetScale',
                ICON: '🌐'
            },
            AIVEN: {
                HOST: 'aiven.io',
                NAME: 'Aiven MySQL',
                ICON: '☁️'
            },
            MYSQL: {
                NAME: 'MySQL',
                ICON: '🐬'
            }
        },
        URL_SEPARATORS: {
            QUERY: '?',
            PARAM: '&'
        },
        KEYWORDS: {
            DUPLICATE: 'Duplicate'
        },
        MASK: 'mysql://****:****@${host}:${port}/${database}'
    },
    PLACEHOLDERS: {
        TOKEN: '%s',
        Replacement: '%s',
        HIDDEN: '***'
    },
    SEPARATORS: {
        COMMA_SPACE: ', '
    },
    DEFAULTS: {
        SITE_NAME: 'Modular Engine',
        SITE_TITLE: 'Dashboard',
        PRIMARY_COLOR: '#8B5CF6',
        ROLES: {
            SUPER_ADMIN: { NAME: 'super_admin', DISPLAY: 'Super Administrator' },
            ADMIN: { NAME: 'admin', DISPLAY: 'Administrator' },
            USER: { NAME: 'user', DISPLAY: 'User' }
        },
        SCOPE: {
            GLOBAL: 'global'
        },
        PREFIX: {
            USER_TABLE: 'usr_'
        },
        NODE_ENV: 'development',
        CORS_ORIGIN: '* (all origins)',
        ENV_KEYS: {
            DB_URL: 'DATABASE_URL=',
            JWT_SECRET: 'JWT_SECRET='
        },
        ENCODING: {
            HEX: 'hex' as BufferEncoding,
            UTF8: 'utf8' as BufferEncoding
        },
        ENV_FILE: '.env',
        AUTH: {
            SALT_ROUNDS: 10
        }
    }
};
