/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: GET /api/database-schema/page-relation-create/targets/:id
 * ═══════════════════════════════════════════════════════════════
 */
import { getAvailableTargets } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const targets = await getAvailableTargets(db, id);
    return c.json({ status: 'success', data: targets });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
