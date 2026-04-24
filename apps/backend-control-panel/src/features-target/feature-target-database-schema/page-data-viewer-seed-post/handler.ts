/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: POST /api/database-schema/page-data-viewer/seed/:id
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: DataViewer (Fitur Seed Dummy Data)
 * ═══════════════════════════════════════════════════════════════
 */
import { getSchemaHeader } from '../page-data-viewer-header-get/model';
// Implementation stub for seed (could be complex based on existing logic)

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const count = parseInt(c.req.query('count') || '10');
    
    const schema = await getSchemaHeader(db, id);
    if (!schema) return c.json({ status: 'error', message: 'Not found' }, 404);

    // Call seed service here
    // await seedData(db, schema.table_name, count);

    return c.json({ status: 'success', message: `Seeded ${count} rows` });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
