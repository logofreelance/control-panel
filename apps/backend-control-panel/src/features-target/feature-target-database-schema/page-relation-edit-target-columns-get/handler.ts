/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: GET /api/database-schema/page-relation-edit/target-columns/:targetId
 * ═══════════════════════════════════════════════════════════════
 */
import { getColumns, getSchemaInfo } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const targetId = c.req.param('targetId');
    
    const schema = await getSchemaInfo(db, targetId);
    if (!schema) return c.json({ status: 'error', message: 'Not found' }, 404);

    const columns = await getColumns(db, schema.table_name);
    return c.json({ status: 'success', data: columns });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
