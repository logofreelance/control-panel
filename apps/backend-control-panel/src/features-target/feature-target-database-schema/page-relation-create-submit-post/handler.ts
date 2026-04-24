/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: POST /api/database-schema/page-relation-create/submit/:id
 * ═══════════════════════════════════════════════════════════════
 */
import { createRelation } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const relation = await createRelation(db, id, body);
    return c.json({ status: 'success', data: relation });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
