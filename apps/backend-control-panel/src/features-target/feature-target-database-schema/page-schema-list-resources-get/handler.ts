/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: GET /api/database-schema/page-schema-list/resources/:id
 * ═══════════════════════════════════════════════════════════════
 */
import { getResources } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    
    const resources = await getResources(db, id);
    return c.json({ status: 'success', data: resources });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
