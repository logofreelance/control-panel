/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: DELETE /api/database-schema/page-schema-list/categories/:cid
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: DatabaseSchemaView → CategoryManager
 * ═══════════════════════════════════════════════════════════════
 */
import { deleteCategory } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const cid = c.req.param('cid');
    await deleteCategory(db, cid);
    return c.json({ status: 'success' });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
