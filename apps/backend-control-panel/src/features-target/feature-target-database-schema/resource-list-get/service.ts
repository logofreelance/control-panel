/**
 * resource-list-get/service.ts
 *
 * ALUR: Fetch all endpoints → Parse handler_config → Filter by tableId → Return filtered
 */

export function filterEndpointsByTableId(allEndpoints: any[], tableId: string) {
  return allEndpoints
    .map((e: any) => {
      const originalEndpoint = e.endpoint;
      try {
        const config = JSON.parse(e.handler_config || '{}');
        
        // --- Backward Compatibility for Legacy Endpoints ---
        // Legacy records used `path` instead of `slug` and didn't have `name`.
        const legacyPath = config.path ? config.path.replace(/^\//, '') : '';
        const fallbackSlug = config.slug || legacyPath || originalEndpoint || '';
        const fallbackName = config.name || config.description || fallbackSlug || 'Legacy Endpoint';

        return { 
          ...e, 
          ...config, 
          id: e.id, 
          name: fallbackName,
          slug: fallbackSlug,
          endpoint: originalEndpoint, 
          _originalEndpoint: originalEndpoint 
        };
      } catch {
        return { 
          ...e, 
          name: e.name || originalEndpoint || 'Legacy Endpoint',
          slug: e.slug || originalEndpoint || '',
          _originalEndpoint: originalEndpoint 
        };
      }
    })
    .filter((e: any) => {
      const dbEndpoint = e._originalEndpoint;

      // Never show the root '/' endpoint
      if (dbEndpoint === '/' || dbEndpoint === '') return false;

      // Match by data_source_id
      const sourceId = e.data_source_id || e.dataSourceId || e.DatabaseTableId;
      return sourceId && String(sourceId) === String(tableId);
    });
}
