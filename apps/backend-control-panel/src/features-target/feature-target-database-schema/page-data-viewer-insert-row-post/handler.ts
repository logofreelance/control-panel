/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: POST /api/database-schema/page-data-viewer/insert-row/:id
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: DataViewer
 * Composable: useDataViewer()
 * ═══════════════════════════════════════════════════════════════
 */
import { insertRow } from './model';
import { getSchemaHeader } from '../page-data-viewer-header-get/model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const schema = await getSchemaHeader(db, id);
    if (!schema) return c.json({ status: 'error', message: 'Not found' }, 404);

    await insertRow(db, schema.table_name, body);
    return c.json({ status: 'success' });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
