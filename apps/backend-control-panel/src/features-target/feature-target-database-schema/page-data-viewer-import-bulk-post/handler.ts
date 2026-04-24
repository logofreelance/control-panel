/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: POST /api/database-schema/page-data-viewer/import-bulk/:id
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: DataViewer -> ImportModal
 * Composable: useImportData()
 * ═══════════════════════════════════════════════════════════════
 */
import { importRowsBulk } from './model';
import { getSchemaHeader } from '../page-data-viewer-header-get/model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const body = await c.req.json(); // array of objects
    
    if (!Array.isArray(body) || body.length === 0) {
      return c.json({ status: 'error', message: 'Data must be a non-empty array' }, 400);
    }
    
    const schema = await getSchemaHeader(db, id);
    if (!schema) return c.json({ status: 'error', message: 'Not found' }, 404);

    const insertedCount = await importRowsBulk(db, schema.table_name, body);
    return c.json({ status: 'success', message: `Imported ${insertedCount} rows` });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
