/**
 * router.ts — Feature Dynamic Routes (BFF Architecture)
 * Setiap route 100% terisolasi, 1 folder = 1 handler.
 */
import { Hono } from 'hono';

// ═══ Page: Route Builder ════════════════════════════════
import { handler as builderCategoriesListGet } from './page-builder-categories-list-get/handler';
import { handler as builderCategorySavePost } from './page-builder-category-save-post/handler';
import { handler as builderCategoryDeleteDelete } from './page-builder-category-delete-delete/handler';
import { handler as builderEndpointsListGet } from './page-builder-endpoints-list-get/handler';
import { handler as builderEndpointsStatsGet } from './page-builder-endpoints-stats-get/handler';
import { handler as builderEndpointDeleteDelete } from './page-builder-endpoint-delete-delete/handler';
import { handler as builderEndpointTogglePut } from './page-builder-endpoint-toggle-put/handler';
import { handler as builderLogsListGet } from './page-builder-logs-list-get/handler';
import { handler as builderApiRoutesListGet } from './page-builder-api-routes-list-get/handler';

// ═══ Page: Endpoint Editor ══════════════════════════════
import { handler as editorCategoriesDropdownGet } from './page-editor-categories-dropdown-get/handler';
import { handler as editorErrorTemplatesDropdownGet } from './page-editor-error-templates-dropdown-get/handler';
import { handler as editorEndpointLoadGet } from './page-editor-endpoint-load-get/handler';
import { handler as editorEndpointsCheckDuplicateGet } from './page-editor-endpoints-check-duplicate-get/handler';
import { handler as editorEndpointSavePost } from './page-editor-endpoint-save-post/handler';
import { handler as editorEndpointDeleteDelete } from './page-editor-endpoint-delete-delete/handler';

// ═══ Page: Endpoint Detail ══════════════════════════════
import { handler as detailEndpointLoadGet } from './page-detail-endpoint-load-get/handler';

// ═══ Page: Error Templates ══════════════════════════════
import { handler as errorTemplatesListGet } from './page-error-templates-list-get/handler';
import { handler as errorTemplatesSavePost } from './page-error-templates-save-post/handler';
import { handler as errorTemplatesDeleteDelete } from './page-error-templates-delete-delete/handler';

// ═══ Cross-Feature: Database Schema View ═════════════════
import { handler as schemaViewEndpointsGet } from './page-schema-view-endpoints-get/handler';

export function setupDynamicRoutesRouter() {
    const router = new Hono<{ Variables: { targetDb: any, targetId: string } }>();

    // Middleware guard
    router.use('*', async (c, next) => {
        if (!c.get('targetDb')) {
            return c.json({ status: 'error', message: 'Target database connection not established.' }, 400);
        }
        await next();
    });

    // ═══ Page: Route Builder ════════════════════════════
    router.get('/page-builder/categories', builderCategoriesListGet);
    router.post('/page-builder/category', builderCategorySavePost);
    router.delete('/page-builder/category/:id', builderCategoryDeleteDelete);
    router.get('/page-builder/endpoints', builderEndpointsListGet);
    router.get('/page-builder/endpoints/stats', builderEndpointsStatsGet);
    router.delete('/page-builder/endpoint/:id', builderEndpointDeleteDelete);
    router.put('/page-builder/endpoint/:id/toggle', builderEndpointTogglePut);
    router.get('/page-builder/logs', builderLogsListGet);
    router.get('/page-builder/api-routes', builderApiRoutesListGet);

    // ═══ Page: Endpoint Editor ══════════════════════════
    router.get('/page-editor/categories', editorCategoriesDropdownGet);
    router.get('/page-editor/error-templates', editorErrorTemplatesDropdownGet);
    router.get('/page-editor/endpoint/:id', editorEndpointLoadGet);
    router.get('/page-editor/endpoints/check-duplicate', editorEndpointsCheckDuplicateGet);
    router.post('/page-editor/endpoint', editorEndpointSavePost);
    router.delete('/page-editor/endpoint/:id', editorEndpointDeleteDelete);

    // ═══ Page: Endpoint Detail ══════════════════════════
    router.get('/page-detail/endpoint/:id', detailEndpointLoadGet);

    // ═══ Page: Error Templates ══════════════════════════
    router.get('/page-error-templates/list', errorTemplatesListGet);
    router.post('/page-error-templates/save', errorTemplatesSavePost);
    router.delete('/page-error-templates/:id', errorTemplatesDeleteDelete);

    // ═══ Cross-Feature: Database Schema View ═════════════
    router.get('/page-schema-view/endpoints', schemaViewEndpointsGet);

    return router as any;
}
