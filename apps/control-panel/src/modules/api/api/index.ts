// API module - API endpoints
import { API_ROUTES } from '@cp/config';

export const API = {
    apiKeys: {
        list: API_ROUTES.apiKeys.list,
        create: API_ROUTES.apiKeys.create,
        delete: (id: number) => API_ROUTES.apiKeys.delete(id),
        toggle: (id: number) => API_ROUTES.apiKeys.toggle(id),
    },
    cors: {
        list: API_ROUTES.cors.list,
        create: API_ROUTES.cors.create,
        delete: (id: number) => API_ROUTES.cors.delete(id),
    },
};
