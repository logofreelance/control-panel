/**
 * schema-list-get/handler.ts
 *
 * ALUR: Request → Parse query param → Fetch schemas → Return list
 */
import { findAllSchemas } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const isArchived = c.req.query('archived') === 'true' ? 1 : 0;
    const data = await findAllSchemas(db, isArchived);
    return c.json({ status: 'success', data });
  } catch {
    return c.json({ status: 'success', data: [] });
  }
};
