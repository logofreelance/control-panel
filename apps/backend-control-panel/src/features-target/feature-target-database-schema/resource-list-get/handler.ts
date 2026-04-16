/**
 * resource-list-get/handler.ts
 *
 * ALUR: Request param :id → Find schema → Check table exists → Fetch endpoints → Filter → Return
 */
import { findSchemaById, routeDynamicTableExists, fetchAllEndpoints } from './model';
import { filterEndpointsByTableId } from './service';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const tableId = c.req.param('id');

    // Step 1: Validate schema exists
    const schema = await findSchemaById(db, tableId);
    if (!schema) return c.json({ status: 'error', message: 'Schema not found' }, 404);

    // Step 2: Check if route_dynamic table exists
    const tableExists = await routeDynamicTableExists(db);
    if (!tableExists) return c.json({ status: 'success', data: [] });

    // Step 3: Fetch and filter
    const allEndpoints = await fetchAllEndpoints(db);
    console.log(`[DEBUG] RAW ENDPOINTS FROM DB (count: ${allEndpoints.length})`);
    if(allEndpoints.length > 0) {
      console.log(`[DEBUG] FIRST RAW ENDPOINT:`, JSON.stringify(allEndpoints[0], null, 2));
    }

    const filtered = filterEndpointsByTableId(allEndpoints, tableId);
    console.log(`[DEBUG] FILTERED ENDPOINTS FOR TARGET ${tableId} (count: ${filtered.length})`);
    if(filtered.length > 0) {
      console.log(`[DEBUG] FIRST FILTERED ENDPOINT:`, JSON.stringify(filtered[0], null, 2));
    }

    return c.json({ status: 'success', data: filtered });
  } catch (e: any) {
    console.error(`[DEBUG] ERROR: `, e);
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
