/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: GET /api/database-schema/page-data-viewer/columns/:id
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: DataViewer (Tabel Data)
 * Composable: useDataViewer()
 * ═══════════════════════════════════════════════════════════════
 */
import { getPhysicalColumns } from './model';
import { getSchemaHeader } from '../page-data-viewer-header-get/model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    
    const schema = await getSchemaHeader(db, id);
    if (!schema) return c.json({ status: 'error', message: 'Not found' }, 404);

    const columns = await getPhysicalColumns(db, schema.table_name);
    return c.json({ status: 'success', data: columns });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
