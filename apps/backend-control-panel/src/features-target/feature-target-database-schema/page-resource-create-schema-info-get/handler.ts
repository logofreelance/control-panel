/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: GET /api/database-schema/page-resource-create/schema-info/:id
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: CreateResourcePage
 * ═══════════════════════════════════════════════════════════════
 */
import { getSchemaInfo } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    
    const schema = await getSchemaInfo(db, id);
    if (!schema) return c.json({ status: 'error', message: 'Not found' }, 404);

    let columns: any[] = [];
    if (schema.table_name) {
      try {
        const res: any = await db.execute(`DESCRIBE ${schema.table_name}`);
        const cols = Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
        columns = cols.map((col: any) => ({
          name: col.Field || col.column_name,
          type: col.Type || col.column_type
        }));
      } catch {}
    }
    
    return c.json({ status: 'success', data: { ...schema, columns } });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
