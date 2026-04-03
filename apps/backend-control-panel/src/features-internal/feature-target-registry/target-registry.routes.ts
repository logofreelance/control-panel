/**
 * feature-target-registry — Route Registration
 * 
 * 🤖 AI: Binds HTTP methods to handler functions.
 * GET    /                → list all target systems
 * POST   /                → register new target system
 * PUT    /:id             → update target system
 * DELETE /:id             → remove target system
 * POST   /test-connection → test database connection
 * POST   /:id/health      → run health check on a target system
 */

import type { Hono } from 'hono';
import type { InternalDatabaseConnection } from '../internal.db';
import { TARGET_REGISTRY_ROUTE_PATHS } from './target-registry.config';
import {
    handleListTargetSystems,
    handleCreateTargetSystem,
    handleUpdateTargetSystem,
    handleDeleteTargetSystem,
    handleTestConnection,
    handleHealthCheck,
} from './target-registry.handlers';

export function setupTargetRegistryRoutes(
    router: Hono<any>,
    db: InternalDatabaseConnection
) {
    router.get(TARGET_REGISTRY_ROUTE_PATHS.list, (c) => handleListTargetSystems(c, db));
    router.post(TARGET_REGISTRY_ROUTE_PATHS.create, (c) => handleCreateTargetSystem(c, db));
    router.put(TARGET_REGISTRY_ROUTE_PATHS.update, (c) => handleUpdateTargetSystem(c, db));
    router.delete(TARGET_REGISTRY_ROUTE_PATHS.delete, (c) => handleDeleteTargetSystem(c, db));
    router.post(TARGET_REGISTRY_ROUTE_PATHS.testConnection, (c) => handleTestConnection(c));
    router.post(TARGET_REGISTRY_ROUTE_PATHS.healthCheck, (c) => handleHealthCheck(c, db));
}
