/**
 * data-seed-post/handler.ts
 *
 * ALUR: Request param :id → Service seeds data → Return count
 */
import { executeSeedData } from './service';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const count = await executeSeedData(db, c.req.param('id'));

    if (count === null) {
      return c.json({ status: 'error', message: 'Schema not found' }, 404);
    }

    return c.json({ status: 'success', message: `Seed successful: ${count} records` });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
