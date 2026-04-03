// API module - API endpoints
import { ORANGE_ROUTES } from '@/lib/config';

export const API = {
    apiKeys: {
        list: ORANGE_ROUTES.apiKeys.list,
        create: ORANGE_ROUTES.apiKeys.create,
        delete: (id: number) => ORANGE_ROUTES.apiKeys.delete(id),
        toggle: (id: number) => ORANGE_ROUTES.apiKeys.toggle(id),
    },
    cors: {
        list: ORANGE_ROUTES.cors.list,
        create: ORANGE_ROUTES.cors.create,
        delete: (id: number) => ORANGE_ROUTES.cors.delete(id),
    },
};
