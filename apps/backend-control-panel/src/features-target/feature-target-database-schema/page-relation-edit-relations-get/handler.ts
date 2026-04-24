/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: GET /api/database-schema/page-relation-edit/relations/:id
 * ═══════════════════════════════════════════════════════════════
 */
import { getRelations } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const relations = await getRelations(db, id);
    return c.json({ status: 'success', data: relations });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
