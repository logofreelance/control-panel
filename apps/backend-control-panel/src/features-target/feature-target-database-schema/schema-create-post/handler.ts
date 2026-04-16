/**
 * schema-create-post/handler.ts
 *
 * ALUR: Request body → Service creates schema → Return id
 */
import { executeCreateSchema } from './service';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const body = await c.req.json();
    const result = await executeCreateSchema(db, body);
    return c.json({ status: 'success', data: result });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
