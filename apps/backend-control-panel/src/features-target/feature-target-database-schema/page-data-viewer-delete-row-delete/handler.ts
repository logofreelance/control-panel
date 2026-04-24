/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: DELETE /api/database-schema/page-data-viewer/delete-row/:id/:rowId
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: DataViewer
 * Composable: useDataViewer()
 * ═══════════════════════════════════════════════════════════════
 */
import { deleteRow } from './model';
import { getSchemaHeader } from '../page-data-viewer-header-get/model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const rowId = c.req.param('rowId');
    
    const schema = await getSchemaHeader(db, id);
    if (!schema) return c.json({ status: 'error', message: 'Not found' }, 404);

    await deleteRow(db, schema.table_name, rowId);
    return c.json({ status: 'success' });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
