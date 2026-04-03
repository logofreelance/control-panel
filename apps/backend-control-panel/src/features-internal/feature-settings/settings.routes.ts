/**
 * feature-settings — Route Registration
 * 
 * 🤖 AI: Binds HTTP methods to handler functions.
 * GET  / → handleGetSettings
 * PUT  / → handleUpdateSettings
 */

import type { Hono } from 'hono';
import type { InternalDatabaseConnection } from '../internal.db';
import { handleGetSettings, handleUpdateSettings } from './settings.handlers';
import { SETTINGS_ROUTE_PATHS } from './settings.config';

export function setupSettingsRoutes(
    router: Hono<any>,
    db: InternalDatabaseConnection
) {
    router.get(SETTINGS_ROUTE_PATHS.getAll, (c) => handleGetSettings(c, db));
    router.put(SETTINGS_ROUTE_PATHS.update, (c) => handleUpdateSettings(c, db));
}
