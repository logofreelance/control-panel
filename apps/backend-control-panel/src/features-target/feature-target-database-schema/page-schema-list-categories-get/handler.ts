/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: GET /api/database-schema/page-schema-list/categories
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: DatabaseSchemaView → CategoryManager
 * Composable: useDatabaseCategories()
 *
 * RESPONSE:
 *   { status: 'success', data: Category[] }
 *   Category: { id, name, color, icon, order_index, created_at, updated_at }
 * ═══════════════════════════════════════════════════════════════
 */
import { findAllCategories } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const categories = await findAllCategories(db);
    return c.json({ status: 'success', data: categories });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
