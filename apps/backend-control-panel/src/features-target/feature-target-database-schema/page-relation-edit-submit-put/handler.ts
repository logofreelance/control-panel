/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: PUT /api/database-schema/page-relation-edit/submit/:id/:rid
 * ═══════════════════════════════════════════════════════════════
 */
import { updateRelation } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const rid = c.req.param('rid');
    const body = await c.req.json();
    
    const relation = await updateRelation(db, id, rid, body);
    return c.json({ status: 'success', data: relation });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
