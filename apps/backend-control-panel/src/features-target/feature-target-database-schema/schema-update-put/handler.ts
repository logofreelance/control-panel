/**
 * schema-update-put/handler.ts
 */
import { updateSchemaRecord } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const body = await c.req.json();

    await updateSchemaRecord(db, id, body);
    return c.json({ status: 'success' });
  } catch (err) {
    console.error('[SCHEMA-UPDATE-ERROR]', err);
    return c.json({ status: 'error', message: 'Failed to update schema' }, 500);
  }
};
