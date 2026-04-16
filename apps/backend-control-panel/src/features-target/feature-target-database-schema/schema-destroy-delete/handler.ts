/**
 * schema-destroy-delete/handler.ts
 *
 * ALUR: Request param :id → Service destroys schema → Return success
 */
import { executeDestroySchema } from './service';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    await executeDestroySchema(db, c.req.param('id'));
    return c.json({ status: 'success', message: 'Destroyed' });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
