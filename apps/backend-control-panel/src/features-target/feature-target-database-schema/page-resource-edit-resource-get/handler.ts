/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: GET /api/database-schema/page-resource-edit/resource/:id/:rid
 * ═══════════════════════════════════════════════════════════════
 */
import { getResource } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const rid = c.req.param('rid');
    
    const resource = await getResource(db, id, rid);
    if (!resource) return c.json({ status: 'error', message: 'Resource not found' }, 404);

    return c.json({ status: 'success', data: resource });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
