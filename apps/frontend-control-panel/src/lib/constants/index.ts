// packages/constants/src/index.ts
// Barrel export for all constants

// API Routes
export {
    API_LAYERS,
    AUTH_ROUTES,
    RESOURCE_ROUTES,
    buildOrangeUrl,
    buildGreenUrl,
    type ApiLayer,
    type AuthRoute,
    type ResourceRoute,
} from './api';

// Database Constants
export {
    TABLE_PREFIX,
    RESERVED_PREFIXES,
    SQL_RESERVED_WORDS,
    isReservedWord,
    isReservedPrefix,
    withUserPrefix,
    type TablePrefixKey,
    type ReservedPrefix,
    type SqlReservedWord,
} from './database';
