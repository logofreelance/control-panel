/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: DELETE /api/database-schema/page-schema-trash/destroy/:id
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: DatabaseSchemaTrashView
 * Composable: useTrash()
 * ═══════════════════════════════════════════════════════════════
 */
import { destroySchema, getSchemaTableName } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    
    const tableName = await getSchemaTableName(db, id);
    if (tableName) {
      try {
        await db.execute(`DROP TABLE IF EXISTS ${tableName}`);
      } catch (err: any) {
        console.error(`Failed to drop physical table ${tableName}:`, err.message);
      }
    }
    
    await destroySchema(db, id);
    return c.json({ status: 'success' });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
