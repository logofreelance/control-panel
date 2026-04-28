/**
 * constants.ts
 * Kumpulan konstanta tabel dan query untuk Integrasi.
 */

export const TARGET_TABLES = {
    CATEGORIES: 'route_categories',
    ENDPOINTS: 'route_dynamic',
    CORE_ROUTES: 'route_core',
    DATABASE_TABLES: 'database_tables',
    DATABASE_RESOURCES: 'database_resources',
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
    { id: '8', route_path: '/auth/user/change-password', method: 'POST', category: 'Auth User', description: 'SENSITIVE: Update user account password. Requires verification with current password.' },
    { id: '9', route_path: '/auth/user/account', method: 'DELETE', category: 'Auth User', description: 'CRITICAL: Deactivate user account and invalidate sessions. Requires confirmation.' },
    { id: '10', route_path: '/auth/login/google', method: 'GET', category: 'Auth User', description: 'OAuth: Initiate Google login redirection.' },
    { id: '11', route_path: '/auth/login/google/callback', method: 'GET', category: 'Auth User', description: 'OAuth: Handle Google callback and issue session token.' },
    { id: '12', route_path: '/auth/users', method: 'GET', category: 'Auth Admin (Super Admin Only)', description: 'List all users with pagination and search. Query params: page, limit, search. Returns user list with metadata (total, page, totalPages).' },
    { id: '13', route_path: '/auth/users/:id', method: 'GET', category: 'Auth Admin (Super Admin Only)', description: 'Get detailed information for a single user by ID. Returns user data without password_hash.' },
    { id: '14', route_path: '/auth/users/:id', method: 'PUT', category: 'Auth Admin (Super Admin Only)', description: 'Update user data (role, is_active, username, email). Cannot modify own account or deactivate another super admin. Body: { role?, is_active?, username?, email? }' },
    { id: '15', route_path: '/auth/users/:id', method: 'DELETE', category: 'Auth Admin (Super Admin Only)', description: 'Soft-delete (deactivate) a user by setting is_active=0. Cannot deactivate own account or another super admin. Invalidates all target user sessions.' },
] as const;
