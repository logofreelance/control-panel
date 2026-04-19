/**
 * schema-list-get/handler.ts
 *
 * ALUR: Request → Parse query param → Fetch schemas → Enrich with columns → Return list
 */
import { findAllSchemas } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const isArchived = c.req.query('archived') === 'true' ? 1 : 0;
    const schemas = await findAllSchemas(db, isArchived);

    // Enrich each schema with physical columns from DESCRIBE
    const enriched = await Promise.all(
      schemas.map(async (schema: any) => {
        let columns: any[] = [];
        try {
          if (schema.table_name) {
            const res: any = await db.execute(`DESCRIBE ${schema.table_name}`);
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
          // Table might not exist, skip
        }
        return { ...schema, columns };
      })
    );

    return c.json({ status: 'success', data: enriched });
  } catch {
    return c.json({ status: 'success', data: [] });
  }
};
