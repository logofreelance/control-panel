/**
 * constants.ts
 * Kumpulan konstanta tabel dan query untuk Integrasi.
 */

export const TARGET_TABLES = {
    CATEGORIES: 'route_categories',
    ENDPOINTS: 'route_dynamic',
    CORE_ROUTES: 'route_core',
    DATA_SOURCES: 'database_tables',
    RESOURCES: 'data_source_resources',
    ROLES: 'roles',
    PERMISSIONS: 'permissions',
    API_KEYS: 'api_keys',
    ERROR_TEMPLATES: 'api_error_templates',
} as const;

export const SYSTEM_CORE_ROUTES = [
    { id: 'h1', route_path: '/health/status', method: 'GET', category: 'System Check', description: 'Basic health check for system reachability.' },
    { id: 'h2', route_path: '/health/check', method: 'GET', category: 'System Check', description: 'Full health check including database connection status.' },
    { id: '1', route_path: '/auth/login', method: 'POST', category: 'Auth User', description: 'Secure user login with email and password.' },
    { id: '2', route_path: '/auth/register', method: 'POST', category: 'Auth User', description: 'User account registration for new users.' },
    { id: '3', route_path: '/auth/me', method: 'GET', category: 'Auth User', description: 'Retrieve current authenticated user basic data.' },
    { id: '4', route_path: '/auth/verify', method: 'GET', category: 'Auth User', description: 'Verify if the current session token is valid.' },
    { id: '5', route_path: '/auth/logout', method: 'POST', category: 'Auth User', description: 'Invalidate current session and clear authentication cookies.' },
    { id: '6', route_path: '/auth/user/data', method: 'GET', category: 'Auth User', description: 'Retrieve granular user metadata and extended profile.' },
    { id: '7', route_path: '/auth/user/profile', method: 'PUT', category: 'Auth User', description: 'Update user profile information (name, bio, etc).' },
    { id: '8', route_path: '/auth/user/change-password', method: 'POST', category: 'Auth (only for super admin)', description: 'SENSITIVE: Update user account password. Requires verification.' },
    { id: '9', route_path: '/auth/user/account', method: 'DELETE', category: 'Auth (only for super admin)', description: 'CRITICAL: Permanently delete user account and associated data.' },
    { id: '10', route_path: '/auth/login/google', method: 'GET', category: 'Auth User', description: 'OAuth: Initiate Google login redirection.' },
    { id: '11', route_path: '/auth/login/google/callback', method: 'GET', category: 'Auth User', description: 'OAuth: Handle Google callback and issue session token.' },
] as const;
