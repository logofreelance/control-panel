/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: DELETE /api/database-schema/page-schema-list/resources/:id/:rid
 * ═══════════════════════════════════════════════════════════════
 */
import { deleteResource } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const rid = c.req.param('rid');
    
    await deleteResource(db, id, rid);
    return c.json({ status: 'success' });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
