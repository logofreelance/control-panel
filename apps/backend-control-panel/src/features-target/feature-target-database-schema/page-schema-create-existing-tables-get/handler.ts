/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: GET /api/database-schema/page-schema-create/existing-tables
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: CreateSchemaForm (untuk dropdown field target)
 * Composable: useCreateSchema()
 * ═══════════════════════════════════════════════════════════════
 */
import { getExistingTables } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const tables = await getExistingTables(db);
    return c.json({ status: 'success', data: tables });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
