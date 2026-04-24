import { RESOURCE_ROUTES } from '@/lib/constants';

const BASE = `/api${RESOURCE_ROUTES.DATABASE_SCHEMA}`;

/**
 * BFF ARCHITECTURE API ROUTES
 * Setiap page memiliki endpoint isolasinya sendiri.
 */
export const API = {
  // 1. Schema List Page
  pageSchemaList: {
    schemas:             `${BASE}/page-schema-list/schemas`,
    categories:          `${BASE}/page-schema-list/categories`,
    categoryById:        (cid: string) => `${BASE}/page-schema-list/categories/${cid}`,
    archive:             (id: string) => `${BASE}/page-schema-list/archive/${id}`,
    resources:           (id: string) => `${BASE}/page-schema-list/resources/${id}`,
    deleteResource:      (id: string, rid: string) => `${BASE}/page-schema-list/resources/${id}/${rid}`,
  },

  // 2. Trash Page
  pageSchemaTrash: {
    schemas:             `${BASE}/page-schema-trash/schemas`,
    restore:             (id: string) => `${BASE}/page-schema-trash/restore/${id}`,
    destroy:             (id: string) => `${BASE}/page-schema-trash/destroy/${id}`,
  },

  // 3. Create Schema Page
  pageSchemaCreate: {
    templates:           `${BASE}/page-schema-create/templates`,
    existingTables:      `${BASE}/page-schema-create/existing-tables`,
    validate:            `${BASE}/page-schema-create/validate`,
    submit:              `${BASE}/page-schema-create/submit`,
  },

  // 4. Data Viewer Page
  pageDataViewer: {
    header:              (id: string) => `${BASE}/page-data-viewer/header/${id}`,
    columns:             (id: string) => `${BASE}/page-data-viewer/columns/${id}`,
    rows:                (id: string) => `${BASE}/page-data-viewer/rows/${id}`,
    insertRow:           (id: string) => `${BASE}/page-data-viewer/insert-row/${id}`,
    updateRow:           (id: string, rowId: string) => `${BASE}/page-data-viewer/update-row/${id}/${rowId}`,
    deleteRow:           (id: string, rowId: string) => `${BASE}/page-data-viewer/delete-row/${id}/${rowId}`,
    importBulk:          (id: string) => `${BASE}/page-data-viewer/import-bulk/${id}`,
    seed:                (id: string) => `${BASE}/page-data-viewer/seed/${id}`,
  },

  // 5. Schema Editor Page
  pageSchemaEditor: {
    detail:              (id: string) => `${BASE}/page-schema-editor/detail/${id}`,
    addColumn:           (id: string) => `${BASE}/page-schema-editor/add-column/${id}`,
    dropColumn:          (id: string, name: string) => `${BASE}/page-schema-editor/drop-column/${id}/${name}`,
    update:              (id: string) => `${BASE}/page-schema-editor/update/${id}`,
  },

  // 6. Create Resource Page
  pageResourceCreate: {
    schemaInfo:          (id: string) => `${BASE}/page-resource-create/schema-info/${id}`,
    availableJoins:      `${BASE}/page-resource-create/available-joins`,
    submit:              (id: string) => `${BASE}/page-resource-create/submit/${id}`,
  },

  // 7. Edit Resource Page
  pageResourceEdit: {
    schemaInfo:          (id: string) => `${BASE}/page-resource-edit/schema-info/${id}`,
    resource:            (id: string, rid: string) => `${BASE}/page-resource-edit/resource/${id}/${rid}`,
    availableJoins:      `${BASE}/page-resource-edit/available-joins`,
    submit:              (id: string, rid: string) => `${BASE}/page-resource-edit/submit/${id}/${rid}`,
  },

  // 8. Create Relation Page
  pageRelationCreate: {
    sourceColumns:       (id: string) => `${BASE}/page-relation-create/source-columns/${id}`,
    targets:             (id: string) => `${BASE}/page-relation-create/targets/${id}`,
    targetColumns:       (targetId: string) => `${BASE}/page-relation-create/target-columns/${targetId}`,
    submit:              (id: string) => `${BASE}/page-relation-create/submit/${id}`,
  },

  // 9. Edit Relation Page
  pageRelationEdit: {
    relations:           (id: string) => `${BASE}/page-relation-edit/relations/${id}`,
    sourceColumns:       (id: string) => `${BASE}/page-relation-edit/source-columns/${id}`,
    targets:             (id: string) => `${BASE}/page-relation-edit/targets/${id}`,
    targetColumns:       (targetId: string) => `${BASE}/page-relation-edit/target-columns/${targetId}`,
    submit:              (id: string, rid: string) => `${BASE}/page-relation-edit/submit/${id}/${rid}`,
    delete:              (id: string, rid: string) => `${BASE}/page-relation-edit/delete/${id}/${rid}`,
  },

  // 10. Widget Stats
  widgetStats: {
    summary:             `${BASE}/widget-stats-summary/get`,
  },
};
