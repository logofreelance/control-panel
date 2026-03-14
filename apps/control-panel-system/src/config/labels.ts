
export const APP_LABELS = {
    MESSAGES: {
        SERVER_RUNNING: 'Server is running',
        SETUP_SUCCESS: 'Setup completed successfully',
    },
    ERRORS: {
        INTERNAL_SERVER_ERROR: 'Internal Server Error',
        NOT_FOUND: 'Resource not found',
        UNAUTHORIZED: 'Unauthorized',
        FORBIDDEN: 'Forbidden',
        REQUEST_BODY_TOO_LARGE: 'Request body too large',
        MISSING_CONFIG: 'Server configuration error: Missing secure key',
        UPSTREAM_FAILED: 'Failed to connect to upstream service',
        UPSTREAM_REJECTED: 'Upstream service rejected the request',
    },
    STATUS: {
        OK: 'ok',
        ERROR: 'error',
        ONLINE: 'Online',
        DEGRADED: 'degraded',
        UNKNOWN: 'unknown',
        CONNECTED: 'connected',
        FAILED: 'failed',
    },
    MODULES: {
        SYSTEM: {
            SERVICE_NAME: 'control-panel-system',
            LAYER: 'Management',
        }
    },
    DEFAULTS: {
        CORS_ORIGIN: 'http://localhost:3000',
    },
    LOGS: {
        MISSING_BACKEND_SYSTEM_KEY: '❌ Missing BACKEND_SYSTEM_API_KEY in environment variables',
        AVAILABLE_KEYS: 'Available Env Keys:',
        PROXY_FETCH: '[Proxy] Fetching routes from Backend System:',
        BACKEND_SYSTEM_ERROR: 'Backend System returned',
        PROXY_FAILED: 'Failed to proxy request to Backend System:',
    }
} as const;
