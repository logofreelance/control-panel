/**
 * Fitur: Dynamic Routes (Frontend Control Panel)
 * File: api/index.ts
 * Setiap page punya endpoint sendiri, TIDAK ADA route yang di-share.
 */

import { env } from '@/lib/env';

const BASE_URL = `${env.API_URL}/route-builder`;

export const DYNAMIC_ROUTES_API = {
    // ═══ Page: Route Builder (useRouteBuilder.ts) ═══
    pageBuilder: {
        categoriesList:  `${BASE_URL}/page-builder/categories`,
        categorySave:    `${BASE_URL}/page-builder/category`,
        categoryDelete:  (id: string) => `${BASE_URL}/page-builder/category/${id}`,
        endpointsList:   `${BASE_URL}/page-builder/endpoints`,
        endpointsStats:  `${BASE_URL}/page-builder/endpoints/stats`,
        endpointDelete:  (id: string) => `${BASE_URL}/page-builder/endpoint/${id}`,
        endpointToggle:  (id: string) => `${BASE_URL}/page-builder/endpoint/${id}/toggle`,
        logsList:        `${BASE_URL}/page-builder/logs`,
        apiRoutesList:   `${BASE_URL}/page-builder/api-routes`,
    },

    // ═══ Page: Endpoint Editor (useEndpointEditor.ts) ═══
    pageEditor: {
        categoriesDropdown:     `${BASE_URL}/page-editor/categories`,
        errorTemplatesDropdown: `${BASE_URL}/page-editor/error-templates`,
        endpointLoad:           (id: string) => `${BASE_URL}/page-editor/endpoint/${id}`,
        checkDuplicate:         `${BASE_URL}/page-editor/endpoints/check-duplicate`,
        endpointSave:           `${BASE_URL}/page-editor/endpoint`,
        endpointDelete:         (id: string) => `${BASE_URL}/page-editor/endpoint/${id}`,
    },

    // ═══ Page: Endpoint Detail (useEndpointDetail.ts) ═══
    pageDetail: {
        endpointLoad: (id: string) => `${BASE_URL}/page-detail/endpoint/${id}`,
    },

    // ═══ Page: Error Templates (useErrorTemplates.ts) ═══
    pageErrorTemplates: {
        list:   `${BASE_URL}/page-error-templates/list`,
        save:   `${BASE_URL}/page-error-templates/save`,
        delete: (id: string) => `${BASE_URL}/page-error-templates/${id}`,
    },
};
