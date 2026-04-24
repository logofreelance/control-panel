/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: DELETE /api/database-schema/page-schema-editor/drop-column/:id/:name
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: SchemaEditor
 * Composable: useSchemaEditor()
 * ═══════════════════════════════════════════════════════════════
 */
import { dropColumn } from './model';
import { getSchemaDetail } from '../page-schema-editor-detail-get/model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const colName = c.req.param('name');
    
    const schema = await getSchemaDetail(db, id);
    if (!schema) return c.json({ status: 'error', message: 'Not found' }, 404);

    await dropColumn(db, schema.table_name, colName);
    return c.json({ status: 'success' });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
