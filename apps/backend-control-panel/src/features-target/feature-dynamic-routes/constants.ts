/**
 * constants.ts
 * Menyimpan nilai config dan nama-nama entitas database untuk fitur ini,
 * sehingga mencegah penyebaran nilai hardcode di lapisan Service.
 */

export const TARGET_TABLES = {
    CATEGORIES: 'route_categories',
    ENDPOINTS: 'route_dynamic',
    CORE_ROUTES: 'route_core',
    LOGS: 'route_logs',
    ERROR_TEMPLATES: 'api_error_templates',
} as const;

export const DEFAULT_VALUES = {
    IS_ACTIVE: 1,
    HANDLER_TYPE: 'proxy',
    HTTP_METHOD: 'GET',
    STATUS_CODE: 400,
    RESPONSE_FORMAT: 'json'
} as const;

export const API_STATUS = {
    SUCCESS: 'success',
    ERROR: 'error'
} as const;

export const TARGET_HEADERS = {
    TARGET_ID: 'x-target-id'
} as const;

export const INTERNAL_TABLES = {
    TARGET_SYSTEMS: 'target_systems'
} as const;

export const SYSTEM_AUTH_ROUTES = [
    { 
        id: '1', path: '/api/auth/login', method: 'POST', handler: 'handleLoginRequest', 
        description: 'User login with credentials',
        metadata: JSON.stringify({
            auth: 'none',
            category: 'User Authentication',
            requestBody: {
                fields: [
                    { name: 'identifier', type: 'string', required: true, example: 'admin@example.com', description: 'Username or Email' },
                    { name: 'password', type: 'string', required: true, example: '********', description: 'User password' }
                ]
            },
            responseBody: {
                success: { 
                    status: 200, 
                    fields: [
                        { name: 'token', type: 'string', description: 'JWT Access Token' },
                        { name: 'user.id', type: 'number' },
                        { name: 'user.username', type: 'string' },
                        { name: 'user.role', type: 'string' }
                    ] 
                },
                errors: [
                    { code: 'AUTH_001', description: 'Invalid credentials provided' },
                    { code: 'AUTH_002', description: 'Account is temporarily locked' }
                ]
            }
        })
    },
    { 
        id: '2', path: '/api/auth/register', method: 'POST', handler: 'handleRegisterRequest', 
        description: 'Create new user account',
        metadata: JSON.stringify({
            auth: 'none',
            category: 'User Authentication',
            requestBody: {
                fields: [
                    { name: 'username', type: 'string', required: true, example: 'john_doe' },
                    { name: 'email', type: 'string', required: true, example: 'john@example.com' },
                    { name: 'password', type: 'string', required: true, example: 'StrongPassword123!' }
                ]
            },
            responseBody: {
                success: { 
                    status: 201, 
                    fields: [
                        { name: 'token', type: 'string' },
                        { name: 'user.username', type: 'string' }
                    ] 
                },
                errors: [
                    { code: 'REG_001', description: 'Email already registered' },
                    { code: 'REG_002', description: 'Username already taken' }
                ]
            }
        })
    },
    { 
        id: '3', path: '/api/auth/me', method: 'GET', handler: 'handleGetCurrentUser', 
        description: 'Get currently authenticated user',
        metadata: JSON.stringify({
            auth: 'required',
            category: 'User Session',
            responseBody: {
                success: { 
                    status: 200, 
                    fields: [
                        { name: 'id', type: 'number' },
                        { name: 'username', type: 'string' },
                        { name: 'email', type: 'string' },
                        { name: 'role', type: 'string' }
                    ] 
                },
                errors: [{ code: 'UNAUTH_001', description: 'Missing or invalid token' }]
            }
        })
    },
    { 
        id: '4', path: '/api/auth/verify', method: 'GET', handler: 'handleVerifySession', 
        description: 'Verify if session is still active',
        metadata: JSON.stringify({
            auth: 'required',
            category: 'User Session',
            responseBody: {
                success: { status: 200, fields: [{ name: 'valid', type: 'boolean' }] },
                errors: [{ code: 'UNAUTH_001', description: 'Token has expired' }]
            }
        })
    },
    { 
        id: '5', path: '/api/auth/logout', method: 'POST', handler: 'handleLogoutRequest', 
        description: 'Terminate user session',
        metadata: JSON.stringify({ 
            auth: 'required',
            category: 'User Session',
            responseBody: {
                success: { status: 200, fields: [{ name: 'success', type: 'boolean' }] }
            }
        })
    },
    { 
        id: '6', path: '/api/auth/user/data', method: 'GET', handler: 'handleGetUserData', 
        description: 'Get extended user profile data',
        metadata: JSON.stringify({ 
            auth: 'required',
            category: 'User Data',
            responseBody: {
                success: { 
                    status: 200, 
                    fields: [
                        { name: 'profileData', type: 'object' },
                        { name: 'preferences', type: 'array' }
                    ] 
                }
            }
        })
    },
    { 
        id: '7', path: '/api/auth/user/profile', method: 'PUT', handler: 'handleUpdateProfile', 
        description: 'Update user profile information',
        metadata: JSON.stringify({
            auth: 'required',
            category: 'User Data',
            requestBody: {
                fields: [
                    { name: 'username', type: 'string', required: false },
                    { name: 'email', type: 'string', required: false },
                    { name: 'bio', type: 'string', required: false }
                ]
            },
            responseBody: {
                success: { status: 200, fields: [{ name: 'updated', type: 'boolean' }] }
            }
        })
    },
    { 
        id: '8', path: '/api/auth/user/change-password', method: 'POST', handler: 'handleChangePassword', 
        description: 'Change user account password',
        metadata: JSON.stringify({
            auth: 'required',
            category: 'Security',
            requestBody: {
                fields: [
                    { name: 'currentPassword', type: 'string', required: true },
                    { name: 'newPassword', type: 'string', required: true }
                ]
            },
            responseBody: {
                success: { status: 200, fields: [{ name: 'success', type: 'boolean' }] },
                errors: [{ code: 'PWD_001', description: 'Incorrect current password' }]
            }
        })
    },
    { 
        id: '9', path: '/api/auth/user/account', method: 'DELETE', handler: 'handleDeleteAccount', 
        description: 'Delete user account and data',
        metadata: JSON.stringify({
            auth: 'required',
            category: 'Security',
            requestBody: {
                fields: [
                    { name: 'password', type: 'string', required: true },
                    { name: 'confirmDelete', type: 'boolean', required: true }
                ]
            },
            responseBody: {
                success: { status: 200, fields: [{ name: 'deleted', type: 'boolean' }] }
            }
        })
    },
    { 
        id: '10', path: '/api/auth/login/google', method: 'GET', handler: 'handleGoogleLoginRedirect', 
        description: 'Initiate Google OAuth flow',
        metadata: JSON.stringify({
            auth: 'none',
            category: 'OAuth Integration',
            notes: 'Redirects browser to Google login page. No body required.'
        })
    },
    { 
        id: '11', path: '/api/auth/login/google/callback', method: 'GET', handler: 'handleGoogleCallbackRequest', 
        description: 'Handle Google OAuth callback',
        metadata: JSON.stringify({
            auth: 'none',
            category: 'OAuth Integration',
            notes: 'Expected response from Google containting auth code.',
            responseBody: {
                success: { status: 200, fields: [{ name: 'token', type: 'string' }] }
            }
        })
    },
] as const;
