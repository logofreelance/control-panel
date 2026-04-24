/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: DELETE /api/database-schema/page-relation-edit/delete/:id/:rid
 * ═══════════════════════════════════════════════════════════════
 */
import { deleteRelation } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const rid = c.req.param('rid');
    
    await deleteRelation(db, id, rid);
    return c.json({ status: 'success' });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
