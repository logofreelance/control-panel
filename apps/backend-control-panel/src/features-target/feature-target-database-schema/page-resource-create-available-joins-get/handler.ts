/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: GET /api/database-schema/page-resource-create/available-joins
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: CreateResourcePage (Join Picker)
 * ═══════════════════════════════════════════════════════════════
 */
import { getAvailableTables } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const tables = await getAvailableTables(db);
    return c.json({ status: 'success', data: tables });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
