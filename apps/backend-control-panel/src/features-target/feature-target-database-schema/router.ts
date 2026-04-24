/**
 * router.ts
 *
 * HANYA PENDAFTARAN ROUTE. Zero logic.
 * Setiap handler di-import dari folder terisolir.
 * Arsitektur: Backend For Frontend (BFF) - 1 Route per Frontend Consumer
 */
import { Hono } from 'hono';
import { middleware as resolveTarget } from './middleware/handler';

// ============================================================================
// HANDLER IMPORTS
// ============================================================================

// 1. Group: Schema List Page
import { handler as pageSchemaListSchemasGet } from './page-schema-list-get/handler';
import { handler as pageSchemaListCategoriesGet } from './page-schema-list-categories-get/handler';
import { handler as pageSchemaListCategoryPost } from './page-schema-list-category-post/handler';
import { handler as pageSchemaListCategoryPut } from './page-schema-list-category-put/handler';
import { handler as pageSchemaListCategoryDelete } from './page-schema-list-category-delete/handler';
import { handler as pageSchemaListArchiveDelete } from './page-schema-list-archive-delete/handler';
import { handler as pageSchemaListResourcesGet } from './page-schema-list-resources-get/handler';
import { handler as pageSchemaListResourceDelete } from './page-schema-list-resource-delete/handler';

// 2. Group: Trash Page
import { handler as pageSchemaTrashSchemasGet } from './page-schema-trash-schemas-get/handler';
import { handler as pageSchemaTrashRestorePost } from './page-schema-trash-restore-post/handler';
import { handler as pageSchemaTrashDestroyDelete } from './page-schema-trash-destroy-delete/handler';

// 3. Group: Create Schema Page
import { handler as pageSchemaCreateTemplatesGet } from './page-schema-create-templates-get/handler';
import { handler as pageSchemaCreateExistingTablesGet } from './page-schema-create-existing-tables-get/handler';
import { handler as pageSchemaCreateValidatePost } from './page-schema-create-validate-post/handler';
import { handler as pageSchemaCreateSubmitPost } from './page-schema-create-submit-post/handler';

// 4. Group: Data Viewer Page
import { handler as pageDataViewerHeaderGet } from './page-data-viewer-header-get/handler';
import { handler as pageDataViewerColumnsGet } from './page-data-viewer-columns-get/handler';
import { handler as pageDataViewerRowsGet } from './page-data-viewer-rows-get/handler';
import { handler as pageDataViewerInsertRowPost } from './page-data-viewer-insert-row-post/handler';
import { handler as pageDataViewerUpdateRowPut } from './page-data-viewer-update-row-put/handler';
import { handler as pageDataViewerDeleteRowDelete } from './page-data-viewer-delete-row-delete/handler';
import { handler as pageDataViewerImportBulkPost } from './page-data-viewer-import-bulk-post/handler';
import { handler as pageDataViewerSeedPost } from './page-data-viewer-seed-post/handler';

// 5. Group: Schema Editor Page
import { handler as pageSchemaEditorDetailGet } from './page-schema-editor-detail-get/handler';
import { handler as pageSchemaEditorAddColumnPost } from './page-schema-editor-add-column-post/handler';
import { handler as pageSchemaEditorDropColumnDelete } from './page-schema-editor-drop-column-delete/handler';
import { handler as pageSchemaEditorUpdatePut } from './page-schema-editor-update-put/handler';

// 6. Group: Create Resource Page
import { handler as pageResourceCreateSchemaInfoGet } from './page-resource-create-schema-info-get/handler';
import { handler as pageResourceCreateAvailableJoinsGet } from './page-resource-create-available-joins-get/handler';
import { handler as pageResourceCreateSubmitPost } from './page-resource-create-submit-post/handler';

// 7. Group: Edit Resource Page
import { handler as pageResourceEditSchemaInfoGet } from './page-resource-edit-schema-info-get/handler';
import { handler as pageResourceEditResourceGet } from './page-resource-edit-resource-get/handler';
import { handler as pageResourceEditAvailableJoinsGet } from './page-resource-edit-available-joins-get/handler';
import { handler as pageResourceEditSubmitPut } from './page-resource-edit-submit-put/handler';

// 8. Group: Create Relation Page
import { handler as pageRelationCreateSourceColumnsGet } from './page-relation-create-source-columns-get/handler';
import { handler as pageRelationCreateTargetsGet } from './page-relation-create-targets-get/handler';
import { handler as pageRelationCreateTargetColumnsGet } from './page-relation-create-target-columns-get/handler';
import { handler as pageRelationCreateSubmitPost } from './page-relation-create-submit-post/handler';

// 9. Group: Edit Relation Page
import { handler as pageRelationEditRelationsGet } from './page-relation-edit-relations-get/handler';
import { handler as pageRelationEditSourceColumnsGet } from './page-relation-edit-source-columns-get/handler';
import { handler as pageRelationEditTargetsGet } from './page-relation-edit-targets-get/handler';
import { handler as pageRelationEditTargetColumnsGet } from './page-relation-edit-target-columns-get/handler';
import { handler as pageRelationEditSubmitPut } from './page-relation-edit-submit-put/handler';
import { handler as pageRelationEditDeleteDelete } from './page-relation-edit-delete-delete/handler';

// 10. Group: Widget Stats
import { handler as widgetStatsSummaryGet } from './widget-stats-summary-get/handler';

// Shared
import { handler as pingGet } from './ping-get/handler';

import type { EnvironmentConfig } from '../../env';

export function createFeatureTargetDatabaseSchema(env: EnvironmentConfig) {
  const router = new Hono();

  // Middleware
  router.use('*', resolveTarget(env));

  // Shared
  router.get('/ping', pingGet);

  // 1. Schema List Page
  router.get('/page-schema-list/schemas', pageSchemaListSchemasGet);
  router.get('/page-schema-list/categories', pageSchemaListCategoriesGet);
  router.post('/page-schema-list/categories', pageSchemaListCategoryPost);
  router.put('/page-schema-list/categories/:cid', pageSchemaListCategoryPut);
  router.delete('/page-schema-list/categories/:cid', pageSchemaListCategoryDelete);
  router.delete('/page-schema-list/archive/:id', pageSchemaListArchiveDelete);
  router.get('/page-schema-list/resources/:id', pageSchemaListResourcesGet);
  router.delete('/page-schema-list/resources/:id/:rid', pageSchemaListResourceDelete);

  // 2. Trash Page
  router.get('/page-schema-trash/schemas', pageSchemaTrashSchemasGet);
  router.post('/page-schema-trash/restore/:id', pageSchemaTrashRestorePost);
  router.delete('/page-schema-trash/destroy/:id', pageSchemaTrashDestroyDelete);

  // 3. Create Schema Page
  router.get('/page-schema-create/templates', pageSchemaCreateTemplatesGet);
  router.get('/page-schema-create/existing-tables', pageSchemaCreateExistingTablesGet);
  router.post('/page-schema-create/validate', pageSchemaCreateValidatePost);
  router.post('/page-schema-create/submit', pageSchemaCreateSubmitPost);

  // 4. Data Viewer Page
  router.get('/page-data-viewer/header/:id', pageDataViewerHeaderGet);
  router.get('/page-data-viewer/columns/:id', pageDataViewerColumnsGet);
  router.get('/page-data-viewer/rows/:id', pageDataViewerRowsGet);
  router.post('/page-data-viewer/insert-row/:id', pageDataViewerInsertRowPost);
  router.put('/page-data-viewer/update-row/:id/:rowId', pageDataViewerUpdateRowPut);
  router.delete('/page-data-viewer/delete-row/:id/:rowId', pageDataViewerDeleteRowDelete);
  router.post('/page-data-viewer/import-bulk/:id', pageDataViewerImportBulkPost);
  router.post('/page-data-viewer/seed/:id', pageDataViewerSeedPost);

  // 5. Schema Editor Page
  router.get('/page-schema-editor/detail/:id', pageSchemaEditorDetailGet);
  router.post('/page-schema-editor/add-column/:id', pageSchemaEditorAddColumnPost);
  router.delete('/page-schema-editor/drop-column/:id/:name', pageSchemaEditorDropColumnDelete);
  router.put('/page-schema-editor/update/:id', pageSchemaEditorUpdatePut);

  // 6. Create Resource Page
  router.get('/page-resource-create/schema-info/:id', pageResourceCreateSchemaInfoGet);
  router.get('/page-resource-create/available-joins', pageResourceCreateAvailableJoinsGet);
  router.post('/page-resource-create/submit/:id', pageResourceCreateSubmitPost);

  // 7. Edit Resource Page
  router.get('/page-resource-edit/schema-info/:id', pageResourceEditSchemaInfoGet);
  router.get('/page-resource-edit/resource/:id/:rid', pageResourceEditResourceGet);
  router.get('/page-resource-edit/available-joins', pageResourceEditAvailableJoinsGet);
  router.put('/page-resource-edit/submit/:id/:rid', pageResourceEditSubmitPut);

  // 8. Create Relation Page
  router.get('/page-relation-create/source-columns/:id', pageRelationCreateSourceColumnsGet);
  router.get('/page-relation-create/targets/:id', pageRelationCreateTargetsGet);
  router.get('/page-relation-create/target-columns/:targetId', pageRelationCreateTargetColumnsGet);
  router.post('/page-relation-create/submit/:id', pageRelationCreateSubmitPost);

  // 9. Edit Relation Page
  router.get('/page-relation-edit/relations/:id', pageRelationEditRelationsGet);
  router.get('/page-relation-edit/source-columns/:id', pageRelationEditSourceColumnsGet);
  router.get('/page-relation-edit/targets/:id', pageRelationEditTargetsGet);
  router.get('/page-relation-edit/target-columns/:targetId', pageRelationEditTargetColumnsGet);
  router.put('/page-relation-edit/submit/:id/:rid', pageRelationEditSubmitPut);
  router.delete('/page-relation-edit/delete/:id/:rid', pageRelationEditDeleteDelete);

  // 10. Widget Stats
  router.get('/widget-stats-summary/get', widgetStatsSummaryGet);

  return router as any;
}
