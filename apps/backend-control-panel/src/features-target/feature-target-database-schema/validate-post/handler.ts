/**
 * validate-post/handler.ts
 *
 * ALUR: Request body → Sanitize name → Check availability → Return result
 */
import { checkTableAvailability } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const body = await c.req.json();
    const name = (body.table_name || body.tableName || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
    const result = await checkTableAvailability(db, name);
    return c.json({ status: 'success', data: { valid: result.valid, sanitizedTableName: name } });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
