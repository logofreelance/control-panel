/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: PUT /api/database-schema/page-data-viewer/update-row/:id/:rowId
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: DataViewer
 * Composable: useDataViewer()
 * ═══════════════════════════════════════════════════════════════
 */
import { updateRow } from './model';
import { getSchemaHeader } from '../page-data-viewer-header-get/model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const rowId = c.req.param('rowId');
    const body = await c.req.json();
    
    const schema = await getSchemaHeader(db, id);
    if (!schema) return c.json({ status: 'error', message: 'Not found' }, 404);

    await updateRow(db, schema.table_name, rowId, body);
    return c.json({ status: 'success' });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
