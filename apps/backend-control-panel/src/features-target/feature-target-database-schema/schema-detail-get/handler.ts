/**
 * schema-detail-get/handler.ts
 *
 * ALUR: Request param :id → Find by ID → Enrich with physical columns → Return schema or 404
 */
import { findSchemaById } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const data = await findSchemaById(db, c.req.param('id'));
    if (!data) {
      return c.json({ status: 'error', message: 'Not found' }, 404);
    }

    // Enrich with physical columns from DESCRIBE if the table exists
    let columns: any[] = [];
    try {
      if (data.table_name) {
        const res: any = await db.execute(`DESCRIBE ${data.table_name}`);
        const cols = Array.isArray(res) ? res : res.rows || [];
        columns = cols.map((col: any) => ({
          name: col.Field || col.column_name,
          type: col.Type || col.column_type,
          nullable: (col.Null || col.is_nullable) === 'YES',
          isPrimary: (col.Key || col.column_key) === 'PRI',
          default: col.Default || col.column_default,
        }));
      }
    } catch {
      // Table might not exist yet, ignore
    }

    return c.json({
      status: 'success',
      data: { ...data, columns },
    });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
