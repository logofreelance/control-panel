/**
 * resource-list-get/handler.ts
 *
 * ALUR: Request param :id → Find schema → Initialize table if not exists → Fetch resources → Return
 */
import { findSchemaById, ensureDatabaseResourcesTable, fetchResourcesByTableId } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const tableId = c.req.param('id');

    // Step 1: Validate schema exists
    const schema = await findSchemaById(db, tableId);
    if (!schema) return c.json({ status: 'error', message: 'Schema not found' }, 404);

    // Step 2: Ensure database_resources table exists
    await ensureDatabaseResourcesTable(db);

    // Step 3: Fetch
    const resources = await fetchResourcesByTableId(db, tableId);
    console.log(`[DEBUG] RESOURCES FETCHED FOR TARGET ${tableId} (count: ${resources.length})`);
    
    return c.json({ status: 'success', data: resources });
  } catch (e: any) {
    console.error(`[DEBUG] ERROR: `, e);
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
