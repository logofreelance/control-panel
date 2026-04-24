/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: PUT /api/database-schema/page-resource-edit/submit/:id/:rid
 * ═══════════════════════════════════════════════════════════════
 */
import { updateResource } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const rid = c.req.param('rid');
    const body = await c.req.json();
    
    const resource = await updateResource(db, id, rid, body);
    return c.json({ status: 'success', data: resource });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
