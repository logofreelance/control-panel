/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: POST /api/database-schema/page-resource-create/submit/:id
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: CreateResourcePage
 * ═══════════════════════════════════════════════════════════════
 */
import { createResource } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const resource = await createResource(db, id, body);
    return c.json({ status: 'success', data: resource });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
