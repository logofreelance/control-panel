/**
 * router.ts
 *
 * HANYA PENDAFTARAN ROUTE. Zero logic.
 * Setiap handler di-import dari folder terisolir.
 */
import { Hono } from 'hono';
import { middleware as resolveTarget } from './middleware/handler';

// --- Handler imports (1 folder = 1 handler) ---
import { handler as pingGet } from './ping-get/handler';
import { handler as statsGet } from './stats-get/handler';
import { handler as templatesGet } from './templates-get/handler';
import { handler as validatePost } from './validate-post/handler';

import { handler as schemaListGet } from './schema-list-get/handler';
import { handler as schemaCreatePost } from './schema-create-post/handler';
import { handler as schemaDetailGet } from './schema-detail-get/handler';
import { handler as schemaArchiveDelete } from './schema-archive-delete/handler';
import { handler as schemaRestorePost } from './schema-restore-post/handler';
import { handler as schemaDestroyDelete } from './schema-destroy-delete/handler';
import { handler as schemaUpdatePut } from './schema-update-put/handler';
import { handler as schemaColumnAddPost } from './schema-column-add-post/handler';
import { handler as schemaColumnDropDelete } from './schema-column-drop-delete/handler';

import { handler as columnsGet } from './columns-get/handler';
import { handler as dataListGet } from './data-list-get/handler';
import { handler as dataInsertPost } from './data-insert-post/handler';
import { handler as dataSeedPost } from './data-seed-post/handler';

import { handler as resourceListGet } from './resource-list-get/handler';
import { handler as resourceCreatePost } from './resource-create-post/handler';
import { handler as resourceUpdatePut } from './resource-update-put/handler';
import { handler as resourceDeleteDelete } from './resource-delete-delete/handler';

import { handler as availableTargetsGet } from './available-targets-get/handler';
import { handler as relationListGet } from './relation-list-get/handler';
import { handler as relationCreatePost } from './relation-create-post/handler';
import { handler as relationDeleteDelete } from './relation-delete-delete/handler';
import { handler as categoryListGet } from './category-list-get/handler';
import { handler as categoryCreatePost } from './category-create-post/handler';
import { handler as categoryUpdatePut } from './category-update-put/handler';
import { handler as categoryDeleteDelete } from './category-delete-delete/handler';

import type { EnvironmentConfig } from '../../env';

export function createFeatureTargetDatabaseSchema(env: EnvironmentConfig) {
  const router = new Hono();

  // Middleware
  router.use('*', resolveTarget(env));

  // --- Static routes ---
  router.get('/ping', pingGet);
  router.get('/stats', statsGet);
  router.get('/templates', templatesGet);
  router.post('/validate', validatePost);
  router.get('/categories', categoryListGet);
  router.post('/categories', categoryCreatePost);
  router.put('/categories/:cid', categoryUpdatePut);
  router.delete('/categories/:cid', categoryDeleteDelete);

  // --- Collection ---
  router.get('/', schemaListGet);
  router.post('/', schemaCreatePost);

  // --- Schema sub-routes (specific paths FIRST) ---
  router.post('/:id/seed', dataSeedPost);
  router.get('/:id/columns', columnsGet);
  router.get('/:id/data', dataListGet);
  router.post('/:id/data', dataInsertPost);
  router.post('/:id/restore', schemaRestorePost);
  router.delete('/:id/destroy', schemaDestroyDelete);
  router.post('/:id/schema/column', schemaColumnAddPost);
  router.delete('/:id/schema/column/:name', schemaColumnDropDelete);

  // --- Resources ---
  router.get('/:id/resources', resourceListGet);
  router.post('/:id/resources', resourceCreatePost);
  router.put('/:id/resources/:rid', resourceUpdatePut);
  router.delete('/:id/resources/:rid', resourceDeleteDelete);

  // --- Relations ---
  router.get('/:id/available-targets', availableTargetsGet);
  router.get('/:id/relations', relationListGet);
  router.post('/:id/relations', relationCreatePost);
  router.delete('/:id/relations/:rid', relationDeleteDelete);

  // --- Generic (LAST to avoid catching specific routes) ---
  router.get('/:id', schemaDetailGet);
  router.put('/:id', schemaUpdatePut);
  router.delete('/:id', schemaArchiveDelete);

  return router as any;
}
