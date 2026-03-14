/**
 * data-sources/api/endpoints.ts
 * 
 * Backend API endpoints
 */

import { env } from '@/lib/env';
import { RESOURCE_ROUTES } from '@cp/constants';

const BASE = `${env.API_BASE}${RESOURCE_ROUTES.DATA_SOURCES}`;

export const API = {
    // CRUD
    list: BASE,
    create: BASE,
    validate: `${BASE}/validate`,
    types: `${BASE}/types`,
    detail: (id: number) => `${BASE}/${id}`,
    update: (id: number) => `${BASE}/${id}`,
    archive: (id: number) => `${BASE}/${id}`,
    restore: (id: number) => `${BASE}/${id}/restore`,
    destroy: (id: number) => `${BASE}/${id}/destroy`,
    delete: (id: number) => `${BASE}/${id}`,

    // Schema
    addColumn: (id: number) => `${BASE}/${id}/schema/column`,
    dropColumn: (id: number, name: string) => `${BASE}/${id}/schema/column/${name}`,
    columns: (id: number) => `${BASE}/${id}/columns`,

    // Resources
    resources: (id: number) => `${BASE}/${id}/resources`,
    createResource: (id: number) => `${BASE}/${id}/resources`,
    updateResource: (id: number, rid: number) => `${BASE}/${id}/resources/${rid}`,
    deleteResource: (id: number, rid: number) => `${BASE}/${id}/resources/${rid}`,

    // Relations
    relations: (id: number) => `${BASE}/${id}/relations`,
    addRelation: (id: number) => `${BASE}/${id}/relations`,
    updateRelation: (id: number, rid: number) => `${BASE}/${id}/relations/${rid}`,
    deleteRelation: (id: number, rid: number) => `${BASE}/${id}/relations/${rid}`,
    availableTargets: (id: number) => `${BASE}/${id}/available-targets`,

    // Data
    data: (id: number) => `${BASE}/${id}/data`,
    insertRow: (id: number) => `${BASE}/${id}/data`,
    updateRow: (id: number, rowId: number) => `${BASE}/${id}/data/${rowId}`,
    deleteRow: (id: number, rowId: number) => `${BASE}/${id}/data/${rowId}`,
};
