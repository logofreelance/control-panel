/**
 * shared/model.ts
 *
 * Unified model interface for Target Registry.
 * Proxies to specific action models to maintain modularity while supporting the Store.
 */

import { findAllTargetSystemsSafe } from '../list-get/model';
import { createTargetSystem } from '../create-post/model';
import { updateTargetSystem } from '../update-put/model';
import { removeTargetSystem } from '../delete-delete/model';

export async function getTargets(db: any) {
  return findAllTargetSystemsSafe(db);
}

export async function createTarget(db: any, target: any) {
  return createTargetSystem(db, target.id, target.name, target.description, target.databaseUrl, target.apiEndpoint);
}

export async function updateTarget(db: any, id: string, updates: any) {
  // Map camelCase to snake_case for DB
  const fields: Record<string, any> = {};
  if (updates.name !== undefined) fields.name = updates.name;
  if (updates.description !== undefined) fields.description = updates.description;
  if (updates.databaseUrl !== undefined) fields.database_url = updates.databaseUrl;
  if (updates.apiEndpoint !== undefined) fields.api_endpoint = updates.apiEndpoint;
  if (updates.status !== undefined) fields.status = updates.status;
  if (updates.routeCount !== undefined) fields.route_count = updates.routeCount;
  if (updates.lastHealthCheck !== undefined) fields.last_health_check = updates.lastHealthCheck;

  return updateTargetSystem(db, id, fields);
}

export async function deleteTarget(db: any, id: string) {
  return removeTargetSystem(db, id);
}
