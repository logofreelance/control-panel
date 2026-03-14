// packages/config/src/index.ts
// @cp/config - Centralized Configuration Package
// 
// Usage:
// import { getEnv, AUTH, BRAND, MSG, HEADERS, LABELS, ROUTES, Icons } from '@cp/config';

// ICONS REMOVED - Use direct import from './icons' in frontend apps
// This prevents React dependencies from leaking into backend workers
/* 
export {
    Icons,
    MenuIcons,
    StatusIcons,
    HttpMethodStyles,
    DataTypeIcons,
    ToastIcons,
    getMenuItems,
    type LucideIcon,
    type IconKey,
    type MenuIconKey,
    type StatusIconKey,
    type HttpMethod,
    type DataType,
    type ToastIconType,
} from './icons';
*/

// ============================================
// DEFAULTS - Centralized Default Values (Single Source)
// ============================================
export {
    DEFAULTS,
    API_STATUS,
    TOAST_TYPE,
    type ApiStatus,
    type ToastType,
    type SortOrder,
} from './defaults';

// ============================================
// LABELS - Centralized UI Text (Single Source)
// ============================================
export {
    COMMON_LABELS,
    MODULE_LABELS,
    LABELS,
    type CommonLabels,
    type ModuleLabels,
    type Labels,
} from './labels';

// ============================================
// MESSAGES - Centralized Toast/Notification Messages (Single Source)
// ============================================
export {
    ERROR,
    SUCCESS,
    CORE_MESSAGES,
    DATA_SOURCES_MESSAGES,
    MSG,
    formatMsg,
    AUTH_ERRORS,
    getAuthError,
    type AuthErrorInfo,
} from './messages';

// ============================================
// ROUTES - Centralized API Routes (Single Source)
// ============================================
export {
    API_ROUTES,
    BACKEND_SYSTEM_ROUTES,
    ROUTES,
    type ApiRoutes,
    type BackendSystemRoutes,
    type Routes,
} from './routes';

// ============================================
// LEGACY EXPORTS (existing)
// ============================================

// Environment configuration
export {
    getEnv,
    requireEnv,
    validateEnv,
    isDev,
    isProd,
    EnvCore,
    type AppEnv,
    type IEnvDriver
} from './env';

// Authentication configuration
export {
    AUTH,
    JWT,
    PASSWORD,
    SESSION,
    RATE_LIMIT,
    TOKEN_BLACKLIST,
    LOGIN_FAILURE,
    getJwtExpiry,
    getLoginExpiry,
    validatePassword
} from './auth';

// Validation utilities
export {
    USERNAME_RULES,
    EMAIL_RULES,
    RESERVED_USERNAMES,
    validateUsername,
    validateEmail,
    type ValidationResult,
} from './validation';

// Branding configuration
export {
    BRAND,
    DEFAULT_SITE_SETTINGS,
    buildPageTitle,
    getCopyright
} from './brand';

// Role configuration
export {
    DEFAULT_ROLES,
    PROTECTED_ROLES,
    DEFAULT_USER_ROLE,
    isProtectedRole,
    isSuperRole,
    getRoleLevel,
    hasHigherOrEqualRole,
    type RoleDefinition
} from './roles';

// CORS configuration
export {
    CORS,
    DEV_ORIGINS,
    CORS_METHODS,
    getAllowedOrigins,
    isOriginAllowed
} from './cors';

// Pagination
export {
    PAGINATION,
    QUERY_LIMITS,
    parsePagination,
    buildPaginationMeta,
    type PaginationParams,
    type PaginationMeta
} from './pagination';

// API utilities
export {
    HEADERS,
    CONTENT_TYPE,
    ALLOWED_HEADERS,
    EXPOSED_HEADERS,
    CACHE_CONTROL
} from './api/headers';

export {
    HTTP_STATUS,
    ERROR_CODES,
    success,
    error,
    validationError,
    paginated,
    notFound,
    unauthorized,
    forbidden,
    badRequest,
    serverError,
    systemNotReady,
    conflict,
    type ApiResponse,
    type ErrorCode
} from './api/responses';

// Database utilities
export {
    FIELD_LENGTH,
    DDL,
    varchar,
    timestampColumns
} from './database/fields';

// Column types (shared between frontend + backend)
export {
    COLUMN_TYPES,
    getColumnTypeOptions,
    isValidColumnType,
    type ColumnTypeDefinition
} from './database/column-types';

// DDL templates (backend)
export {
    DDL_TEMPLATES,
    TABLE_OPTIONS,
    TABLE_ENGINE,
    TABLE_CHARSET,
    TABLE_COLLATE,
    formatDDL,
    escapeIdentifier,
    escapeString
} from './database/ddl-templates';

// Backend messages
export {
    DATA_SOURCES_BACKEND,
    BACKEND_ERRORS,
    BACKEND_MESSAGES,
    MIDDLEWARE_ERRORS,
    getMiddlewareError,
    SETTINGS_TRANSLATIONS,
    getSettingsTranslation,
} from './messages';

// Nuclear Zero Hardcode Constants
export {
    DB_TABLES,
    DB_COLUMNS,
    SQL,
    SQL_TYPES,
    API_PARAMS,
    DB_ERROR_PATTERNS,
    CACHE_KEYS,
    SYSTEM,
    RELATION_TYPES,
    VALIDATION_TYPES,
    COLUMN_TYPE_KEYS,
    TABLE_PREFIXES,
    EXPORT_FORMATS,
    CONTENT_TYPES,
    CLONE_LABELS,
    HTTP_HEADERS,
    OPERATIONS,
    STRING_PATTERNS,
    CRYPTO,
    MUTATION_ACTIONS,
    OPERATION_TYPES,
    SYSTEM_PROTECTED_FIELDS,
    HTTP_METHODS,
    SQL_OPERATORS,
    SQL_OPERATORS_LIST,
    RESPONSE_STATUS,
    ROLE_NAMES,
    CONTEXT_KEYS,
    ERROR_SCOPES,
} from './constants';
export * from './templates';

// Security utilities
export {
    SECURITY_LIMITS,
    RATE_LIMITS,
    escapeSQL,
    sanitizeIdentifier,
    isSafeInteger,
    validateBulkIds,
    safeJsonParse,
    safeJsonStringify,
    validateJwtSecret,
    validateAllowedKeys,
    isNonEmptyString,
    getClientIp,
    SECURITY_EVENTS,
    logSecurityEvent,
} from './security';
