/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: POST /api/database-schema/page-schema-list/categories
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: DatabaseSchemaView → CategoryManager
 * Composable: useDatabaseCategories()
 *
 * REQUEST BODY: { name: string, id?: string, description?: string }
 * RESPONSE: { status: 'success', data: { id, name } }
 * ═══════════════════════════════════════════════════════════════
 */
import { randomUUID } from 'node:crypto';
import { insertCategory } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const body = await c.req.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string') {
      return c.json({ status: 'error', message: 'name is required and must be string' }, 400);
    }

    const id = body.id || randomUUID();
    await insertCategory(db, id, name.trim(), description || '');
    return c.json({ status: 'success', data: { id, name: name.trim() } });
  } catch (e: any) {
    console.error('[CATEGORY-POST-ERROR]', e);
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
