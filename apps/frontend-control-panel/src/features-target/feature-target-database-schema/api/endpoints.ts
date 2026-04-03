/**
 * database-schema/api/endpoints.ts
 * 
 * Backend API endpoints
 */

import { env } from '@/lib/env';
import { RESOURCE_ROUTES } from '@/lib/constants';

const BASE = `${env.API_URL}${RESOURCE_ROUTES.DATABASE_SCHEMA}`;

export const API = {
    // CRUD
    list: BASE,
    save: BASE,
    validate: `${BASE}/validate`,
    types: `${BASE}/types`,
    detail: (id: string | number) => `${BASE}/${id}`,
    update: (id: string | number) => `${BASE}/${id}`,
    archive: (id: string | number) => `${BASE}/${id}`,
    restore: (id: string | number) => `${BASE}/${id}/restore`,
    destroy: (id: string | number) => `${BASE}/${id}/destroy`,
    delete: (id: string | number) => `${BASE}/${id}`,

    // Schema
    addColumn: (id: string | number) => `${BASE}/${id}/schema/column`,
    dropColumn: (id: string | number, name: string) => `${BASE}/${id}/schema/column/${name}`,
    columns: (id: string | number) => `${BASE}/${id}/columns`,

    // Resources
    resources: (id: string | number) => `${BASE}/${id}/resources`,
    createResource: (id: string | number) => `${BASE}/${id}/resources`,
    updateResource: (id: string | number, rid: number) => `${BASE}/${id}/resources/${rid}`,
    deleteResource: (id: string | number, rid: number) => `${BASE}/${id}/resources/${rid}`,

    // Relations
    relations: (id: string | number) => `${BASE}/${id}/relations`,
    addRelation: (id: string | number) => `${BASE}/${id}/relations`,
    updateRelation: (id: string | number, rid: number) => `${BASE}/${id}/relations/${rid}`,
    deleteRelation: (id: string | number, rid: number) => `${BASE}/${id}/relations/${rid}`,
    availableTargets: (id: string | number) => `${BASE}/${id}/available-targets`,

    // Data
    data: (id: string | number) => `${BASE}/${id}/data`,
    insertRow: (id: string | number) => `${BASE}/${id}/data`,
    updateRow: (id: string | number, rowId: number) => `${BASE}/${id}/data/${rowId}`,
    deleteRow: (id: string | number, rowId: number) => `${BASE}/${id}/data/${rowId}`,
};
