
import { Context } from 'hono';
import { getEnv, serverError, unauthorized } from '@cp/config';
import { APP_LABELS } from '../../config/labels';

export const getApiRoutes = async (c: Context) => {
    const env = getEnv(c);

    // 1. Verify Backend System API Key exists
    if (!env.BACKEND_SYSTEM_API_KEY) {
        console.error(APP_LABELS.LOGS.MISSING_BACKEND_SYSTEM_KEY);
        console.log(APP_LABELS.LOGS.AVAILABLE_KEYS, Object.keys(env));
        return serverError(c, APP_LABELS.ERRORS.MISSING_CONFIG);
    }

    // 2. Determine Backend System URL using centralized ENV
    const backendSystemUrl = env.BACKEND_SYSTEM_URL || 'http://localhost:3002/api';

    try {
        console.log(`${APP_LABELS.LOGS.PROXY_FETCH} ${backendSystemUrl}`);

        // 3. Make Server-to-Server Request
        const response = await fetch(`${backendSystemUrl}/auth/routes`, {
            method: 'GET',
            headers: {
                'x-api-key': env.BACKEND_SYSTEM_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        // 4. Handle Response
        if (!response.ok) {
            console.error(`${APP_LABELS.LOGS.BACKEND_SYSTEM_ERROR} ${response.status}: ${response.statusText}`);
            if (response.status === 401) return unauthorized(c, APP_LABELS.ERRORS.UPSTREAM_REJECTED);
            return serverError(c, `Upstream error: ${response.status}`);
        }

        const data = await response.json();
        return c.json(data);

    } catch (error: any) {
        console.error(APP_LABELS.LOGS.PROXY_FAILED, error);
        return serverError(c, APP_LABELS.ERRORS.UPSTREAM_FAILED);
    }
};
