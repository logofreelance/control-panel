/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: PUT /api/database-schema/page-schema-list/categories/:cid
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: DatabaseSchemaView → CategoryManager
 * ═══════════════════════════════════════════════════════════════
 */
import { updateCategory } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const cid = c.req.param('cid');
    const body = await c.req.json();

    if (!body.name || typeof body.name !== 'string') {
      return c.json({ status: 'error', message: 'name is required' }, 400);
    }

    await updateCategory(db, cid, body.name.trim(), body.description || '');
    return c.json({ status: 'success', data: { id: cid, name: body.name.trim() } });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
