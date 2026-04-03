/**
 * @repo/config/messages
 * 
 * Centralized messages for the entire application
 * - Backend: ERROR, SUCCESS (API responses)
 * - Frontend: MSG (toast notifications)
 * 
 * 🤖 AI INSTRUCTIONS:
 * - Import MSG from '@/lib/config' for frontend toasts
 * - Import ERROR/SUCCESS from '@/lib/config' for backend responses
 * - Never hardcode toast/error messages
 */

// ============================================
// BACKEND ERROR MESSAGES (API Responses)
// ============================================
export const ERROR = {
    // System errors
    SYSTEM_NOT_READY: 'System not ready',
    DB_NOT_CONFIGURED: 'Database not configured',
    DB_CONNECTION_FAILED: 'Database connection failed',

    // Authentication errors
    UNAUTHORIZED: 'Unauthorized',
    FORBIDDEN: 'Access forbidden',
    INVALID_CREDENTIALS: 'Invalid credentials',
    TOKEN_EXPIRED: 'Token expired',
    TOKEN_INVALID: 'Invalid token',

    // Validation errors
    VALIDATION_FAILED: 'Validation failed',
    INVALID_INPUT: 'Invalid input',
    REQUIRED_FIELD: 'This field is required',

    // Resource errors
    NOT_FOUND: 'Resource not found',
    ALREADY_EXISTS: 'Resource already exists',
    CONFLICT: 'Resource conflict',
    REGISTRATION_FAILED: 'Registration failed. Please try again with different credentials.',

    // Permission errors
    MISSING_CREDENTIALS: 'Email/username and password are required',
    MISSING_REGISTRATION_FIELDS: 'Username, email, and password are required',
    ACCOUNT_DISABLED: 'Account is disabled',
    NOT_AUTHENTICATED: 'Not authenticated',
    INVALID_TOKEN: 'Invalid token',
    INSUFFICIENT_ROLE: 'Insufficient role',
    MISSING_PERMISSION: 'Missing required permission',

    // Username validation errors
    USERNAME_TOO_SHORT: 'Username must be at least 5 characters',
    USERNAME_TOO_LONG: 'Username must be at most 20 characters',
    USERNAME_INVALID_FORMAT: 'Username can only contain letters, numbers, and underscores',
    USERNAME_MUST_START_LETTER: 'Username must start with a letter',
    USERNAME_CONSECUTIVE_CHARS: 'Username cannot have 3 or more consecutive same characters',
    USERNAME_RESERVED: 'This username is reserved and cannot be used',

    // Email validation errors
    EMAIL_INVALID_FORMAT: 'Invalid email format',
    EMAIL_TOO_LONG: 'Email address is too long',

    // Password validation errors
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
    PASSWORD_NEEDS_UPPERCASE: 'Password must contain at least one uppercase letter',
    PASSWORD_NEEDS_NUMBER: 'Password must contain at least one number',
    PASSWORD_NEEDS_SPECIAL: 'Password must contain at least one special character',

    // Rate limiting errors
    RATE_LIMITED: 'Too many attempts. Please try again later.',
} as const;

// ============================================
// AUTH ERROR MAPPING (Frontend-Friendly)
// Maps error codes to user-friendly messages with field indicators
// ============================================
export interface AuthErrorInfo {
    code: string;
    message: string;
    field: string | null;
    httpStatus: number;
}

export const AUTH_ERRORS: Record<string, AuthErrorInfo> = {
    // Login errors
    [ERROR.INVALID_CREDENTIALS]: {
        code: 'INVALID_CREDENTIALS',
        message: 'Email atau password yang Anda masukkan salah',
        field: null,
        httpStatus: 401,
    },
    [ERROR.ACCOUNT_DISABLED]: {
        code: 'ACCOUNT_DISABLED',
        message: 'Akun Anda dinonaktifkan. Silakan hubungi support.',
        field: null,
        httpStatus: 403,
    },
    [ERROR.MISSING_CREDENTIALS]: {
        code: 'MISSING_CREDENTIALS',
        message: 'Email/username dan password harus diisi',
        field: null,
        httpStatus: 400,
    },
    [ERROR.RATE_LIMITED]: {
        code: 'RATE_LIMITED',
        message: 'Terlalu banyak percobaan. Silakan coba lagi dalam 30 menit.',
        field: null,
        httpStatus: 429,
    },

    // Registration errors
    [ERROR.REGISTRATION_FAILED]: {
        code: 'REGISTRATION_FAILED',
        message: 'Registrasi gagal. Silakan coba dengan kredensial berbeda.',
        field: null,
        httpStatus: 400,
    },
    [ERROR.MISSING_REGISTRATION_FIELDS]: {
        code: 'MISSING_REGISTRATION_FIELDS',
        message: 'Username, email, dan password harus diisi',
        field: null,
        httpStatus: 400,
    },

    // Username validation
    [ERROR.USERNAME_TOO_SHORT]: {
        code: 'USERNAME_TOO_SHORT',
        message: 'Username minimal 5 karakter',
        field: 'username',
        httpStatus: 400,
    },
    [ERROR.USERNAME_TOO_LONG]: {
        code: 'USERNAME_TOO_LONG',
        message: 'Username maksimal 20 karakter',
        field: 'username',
        httpStatus: 400,
    },
    [ERROR.USERNAME_INVALID_FORMAT]: {
        code: 'USERNAME_INVALID_FORMAT',
        message: 'Username hanya boleh huruf, angka, dan underscore',
        field: 'username',
        httpStatus: 400,
    },
    [ERROR.USERNAME_MUST_START_LETTER]: {
        code: 'USERNAME_MUST_START_LETTER',
        message: 'Username harus diawali dengan huruf',
        field: 'username',
        httpStatus: 400,
    },
    [ERROR.USERNAME_CONSECUTIVE_CHARS]: {
        code: 'USERNAME_CONSECUTIVE_CHARS',
        message: 'Username tidak boleh memiliki 3 karakter sama berturut-turut',
        field: 'username',
        httpStatus: 400,
    },
    [ERROR.USERNAME_RESERVED]: {
        code: 'USERNAME_RESERVED',
        message: 'Username ini sudah dipakai sistem',
        field: 'username',
        httpStatus: 400,
    },

    // Email validation
    [ERROR.EMAIL_INVALID_FORMAT]: {
        code: 'EMAIL_INVALID_FORMAT',
        message: 'Format email tidak valid',
        field: 'email',
        httpStatus: 400,
    },
    [ERROR.EMAIL_TOO_LONG]: {
        code: 'EMAIL_TOO_LONG',
        message: 'Email terlalu panjang',
        field: 'email',
        httpStatus: 400,
    },

    // Password validation
    [ERROR.PASSWORD_TOO_SHORT]: {
        code: 'PASSWORD_TOO_SHORT',
        message: 'Password minimal 8 karakter',
        field: 'password',
        httpStatus: 400,
    },
    [ERROR.PASSWORD_NEEDS_UPPERCASE]: {
        code: 'PASSWORD_NEEDS_UPPERCASE',
        message: 'Password harus mengandung huruf besar',
        field: 'password',
        httpStatus: 400,
    },
    [ERROR.PASSWORD_NEEDS_NUMBER]: {
        code: 'PASSWORD_NEEDS_NUMBER',
        message: 'Password harus mengandung angka',
        field: 'password',
        httpStatus: 400,
    },
    [ERROR.PASSWORD_NEEDS_SPECIAL]: {
        code: 'PASSWORD_NEEDS_SPECIAL',
        message: 'Password harus mengandung karakter khusus',
        field: 'password',
        httpStatus: 400,
    },
};

/**
 * Helper: Resolve auth error
 */
export function getAuthError(code: string): AuthErrorInfo | undefined {
    return Object.values(AUTH_ERRORS).find(e => e.code === code);
}

// ============================================
// MIDDLEWARE_ERRORS (Frontend-Friendly)
// Maps middleware error codes (MW.ERROR.XXX) to user-friendly messages
// ============================================
export const MIDDLEWARE_ERRORS: Record<string, string> = {
    'MW.ERROR.UNAUTHORIZED': 'Unauthorized Access',
    'MW.ERROR.FORBIDDEN': 'Forbidden Access',
    'MW.ERROR.INVALID_TOKEN': 'Invalid or Expired Token',
    'MW.ERROR.RATE_LIMIT_EXCEEDED': 'Rate limit exceeded. Please try again later.',
    'MW.ERROR.CSRF_INVALID': 'Invalid CSRF Token',
    'MW.ERROR.CORS_BLOCKED': 'CORS: Origin not allowed',
    'MW.ERROR.MISSING_AUTH_HEADER': 'Missing or invalid Authorization header',
    'MW.ERROR.USER_NOT_AUTHENTICATED': 'User not authenticated',
    'MW.ERROR.INSUFFICIENT_ROLE': 'Forbidden: Insufficient role',
    'MW.ERROR.MISSING_PERMISSIONS': 'Forbidden: Missing required permissions',
    'MW.ERROR.SUPER_ADMIN_REQUIRED': 'Access denied: Super admin required',
    'MW.ERROR.TOKEN_EXPIRED': 'Token Expired',
    'MW.ERROR.TOKEN_INVALID': 'Invalid Token',
    'MW.ERROR.TOO_MANY_REQUESTS': 'Too many requests',
    'MW.ERROR.TOO_MANY_REQUESTS_RETRY': 'Too many requests. Please try again later.',
    'MW.ERROR.TOO_MANY_WRITE_OPS': 'Too many write operations. Please slow down.',
    'MW.ERROR.REGISTRATION_LIMIT_EXCEEDED': 'Registration limit exceeded. Please try again later.',
    'MW.ERROR.TOO_MANY_LOGIN_ATTEMPTS': 'Too many login attempts. Please try again in 15 minutes.',
    'MW.ERROR.MISSING_API_KEY': 'Missing API Key',
    'MW.ERROR.INVALID_API_KEY': 'Invalid or Inactive API Key',
    'MW.ERROR.SECURITY_ERROR': 'Security processing error',
    'MW.ERROR.CSRF_MISSING': 'CSRF token missing',
    'MW.ERROR.CSRF_MISMATCH': 'CSRF token mismatch',
};

/**
 * Helper: Resolve middleware error message
 * If key exists in MIDDLEWARE_ERRORS, return translated string.
 * Otherwise return the key itself (fallback).
 */
export function getMiddlewareError(key: string): string {
    return MIDDLEWARE_ERRORS[key] || key;
}

// ============================================
// SETTINGS_TRANSLATIONS (Frontend-Friendly)
// Maps settings label keys to user-friendly messages
// ============================================
export const SETTINGS_TRANSLATIONS: Record<string, string> = {
    'SETTINGS.TITLE': 'Settings',
    'SETTINGS.SUBTITLE': 'Configure your engine branding, SEO, and visual identity.',
    'SETTINGS.SECTIONS.BRAND': 'Brand',
    'SETTINGS.SECTIONS.SEO': 'SEO',
    'SETTINGS.SECTIONS.ASSETS': 'Assets',
    'SETTINGS.SECTIONS.GENERAL': 'General',
    'SETTINGS.SECTIONS.SECURITY': 'Security',
    'SETTINGS.SECTIONS.APPEARANCE': 'Appearance',
    'SETTINGS.SECTIONS.NOTIFICATIONS': 'Notifications',
    'SETTINGS.LABELS.SEARCH_PREVIEW': 'Search Preview',
    'SETTINGS.LABELS.SITE_NAME': 'Site Name',
    'SETTINGS.LABELS.PRIMARY_COLOR': 'Primary Color',
    'SETTINGS.LABELS.META_TITLE': 'Meta Title',
    'SETTINGS.LABELS.META_DESCRIPTION': 'Meta Description',
    'SETTINGS.LABELS.FAVICON': 'Favicon',
    'SETTINGS.LABELS.FAVICON_PLACEHOLDER': 'https://example.com/favicon.ico',
    'SETTINGS.LABELS.DESCRIPTION_PLACEHOLDER': 'Describe your site for search engines...',
    'SETTINGS.LABELS.DEFAULT_META_DESCRIPTION': 'Add a meta description for better SEO visibility...',
    'SETTINGS.LABELS.PREVIEW_URL': 'https://yourdomain.com/',
    'SETTINGS.LABELS.CHANGES_APPLIED_NOTE': 'Your changes will be applied instantly across the entire hub.',
    'SETTINGS.LABELS.SEPARATOR': '—',
    'SETTINGS.BUTTONS.SAVE': 'Save Configuration',
    'SETTINGS.MESSAGES.SAVE_SUCCESS': 'Settings saved successfully!',
    'SETTINGS.MESSAGES.SAVE_FAILED': 'Failed to save settings',
    'SETTINGS.MESSAGES.LOAD_FAILED': 'Failed to load settings',
    'SETTINGS.MESSAGES.CONNECTION_FAILED': 'Connection failed',
};

/**
 * Helper: Resolve settings translation
 */
export function getSettingsTranslation(key: string): string {
    return SETTINGS_TRANSLATIONS[key] || key;
}


// ============================================
// BACKEND SUCCESS MESSAGES (API Responses)
// ============================================
export const SUCCESS = {
    // CRUD operations
    CREATED: 'Created successfully',
    UPDATED: 'Updated successfully',
    DELETED: 'Deleted successfully',
    SAVED: 'Saved successfully',

    // Authentication
    LOGIN: 'Login successful',
    LOGOUT: 'Logout successful',
    REGISTERED: 'Registration successful',
    PASSWORD_CHANGED: 'Password changed successfully',
    LOGGED_OUT: 'Logged out successfully',

    // System
    DB_CONNECTED: 'Database connected',
    MIGRATION_COMPLETE: 'Migration completed',
} as const;

// ============================================
// FRONTEND CORE MESSAGES (Toast Notifications)
// ============================================
export const CORE_MESSAGES = {
    success: {
        created: 'Created successfully',
        updated: 'Updated successfully',
        deleted: 'Deleted successfully',
        saved: 'Saved successfully',
        copied: 'Copied to clipboard',
    },
    error: {
        generic: 'An error occurred',
        network: 'Network error. Please try again.',
        notFound: 'Resource not found',
        unauthorized: 'Unauthorized access',
        validation: 'Please check your input',
        loadFailed: 'Failed to load data',
        saveFailed: 'Failed to save',
        loginFailed: 'Login failed',
        registrationFailed: 'Registration failed',
        resolverError: 'Internal Resolver Error',
        invalidResponseFormat: 'Invalid response format defined',
    },
    confirm: {
        delete: 'Are you sure you want to delete this?',
        unsavedChanges: 'You have unsaved changes. Are you sure you want to leave?',
    },
    validation: {
        required: (field: string) => `${field} is required`,
        minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
        maxLength: (field: string, max: number) => `${field} must be at most ${max} characters`,
    },
} as const;

// ============================================
// DATABASE SCHEMA MODULE MESSAGES
// ============================================
export const DATABASE_SCHEMA_MESSAGES = {
    success: {
        sourceCreated: 'Database schema created successfully',
        sourceDeleted: 'Database schema deleted',
        sourceCloned: 'Database schema cloned successfully',
        sourceArchived: 'Database schema archived',
        sourceRestored: 'Database schema restored',
        schemaUpdated: 'Schema updated successfully',
        columnAdded: 'Column added successfully',
        columnDropped: 'Column dropped successfully',
        resourceCreated: 'Resource created successfully',
        resourceUpdated: 'Resource updated',
        resourceDeleted: 'Resource deleted',
        dataImported: 'Data imported successfully',
        rowInserted: 'Row inserted successfully',
        rowUpdated: 'Row updated successfully',
        rowDeleted: 'Row deleted successfully',
        rowsDeleted: (count: number) => `${count} row(s) deleted`,
        relationAdded: 'Relation added successfully',
        relationUpdated: 'Relation updated successfully',
        relationDeleted: 'Relation deleted successfully',
    },
    error: {
        schemaFailed: 'Failed to update schema',
        loadFailed: 'Failed to load database schema',
        cloneFailed: 'Failed to clone database schema',
        archiveFailed: 'Failed to archive database schema',
        restoreFailed: 'Failed to restore database schema',
        resourceLoadFailed: 'Failed to load resources',
        resourceCreateFailed: 'Failed to create resource',
        resourceUpdateFailed: 'Failed to update resource',
        resourceDeleteFailed: 'Failed to delete resource',
        dataLoadFailed: 'Failed to load data',
        rowInsertFailed: 'Failed to insert row',
        rowUpdateFailed: 'Failed to update row',
        rowDeleteFailed: 'Failed to delete row',
        relationFailed: 'Failed to manage relation',
    },
    confirm: {
        deleteSource: 'Are you sure you want to delete this database schema? This will also delete all associated tables and data.',
        dropColumn: 'Dropping this column will permanently delete all data in it.',
        deleteRow: 'Are you sure you want to delete this record? This action cannot be undone.',
    },
    validation: {
        columnNameRequired: 'Column name is required',
        columnTypeRequired: 'Column type is required',
        columnValuesRequired: (colName: string, typeName: string) => `Column "${colName}": Values are required for ${typeName}`,
        columnTargetRequired: (colName: string, typeName: string) => `Column "${colName}": Target table is required for ${typeName}`,
        duplicateColumnNames: (names: string[]) => `Duplicate column names: ${names.join(', ')}`,
        resourceNameRequired: 'Resource name is required',
        slugRequired: 'Slug is required',
        fieldsRequired: 'At least one field must be selected',
        selectTargetTable: 'Please select a target table',
        tableNameRequired: 'Table name is required',
        minOneColumn: 'Add at least one column',
        invalidSchema: 'Invalid schema definition',
    },
} as const;

// ============================================
// COMBINED MSG OBJECT (Frontend)
// Use: MSG.databaseSchema.success.xxx or MSG.success.xxx
// ============================================
export const MSG = {
    ...CORE_MESSAGES,
    databaseSchema: DATABASE_SCHEMA_MESSAGES,
} as const;

/**
 * Helper: Format message with parameters
 * @example formatMsg('User {name} created', { name: 'John' }) => 'User John created'
 */
export function formatMsg(template: string, params: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}

// ============================================
// BACKEND MESSAGES
// ============================================
export { DATABASE_SCHEMA_BACKEND, BACKEND_ERRORS, BACKEND_MESSAGES } from './backend';
