/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: GET /api/database-schema/widget-stats-summary/get
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: Widget Dashboard (SchemaStats)
 * Composable: useSchemaStats()
 * ═══════════════════════════════════════════════════════════════
 */
import { getStatsSummary } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const stats = await getStatsSummary(db);
    return c.json({ status: 'success', data: stats });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
