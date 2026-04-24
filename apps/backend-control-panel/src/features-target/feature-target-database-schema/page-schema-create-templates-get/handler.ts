/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: GET /api/database-schema/page-schema-create/templates
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: CreateSchemaForm
 * Composable: useCreateSchema()
 * ═══════════════════════════════════════════════════════════════
 */
import { getTemplates } from './model';

export const handler = async (c: any) => {
  try {
    const templates = getTemplates();
    return c.json({ status: 'success', data: templates });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
