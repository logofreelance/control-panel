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
    
    let tableName = '';
    
    if (targetId === '0' || targetId === 0) {
      tableName = 'users';
    } else {
      const schema = await getSchemaInfo(db, targetId);
      if (!schema) return c.json({ status: 'error', message: 'Not found' }, 404);
      tableName = schema.table_name;
    }

    const columns = await getColumns(db, tableName);
    return c.json({ status: 'success', data: columns });

  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
