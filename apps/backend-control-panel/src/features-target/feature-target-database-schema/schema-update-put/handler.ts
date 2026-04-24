/**
 * schema-update-put/handler.ts
 */
import { updateSchemaRecord } from './model';
import { findSchemaById } from '../schema-detail-get/model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const body = await c.req.json();

    await updateSchemaRecord(db, id, body);
    
    // Fetch updated record to return to frontend (required by useCrud)
    const updated = await findSchemaById(db, id);
    
    return c.json({ status: 'success', data: updated });
  } catch (err) {
    console.error('[SCHEMA-UPDATE-ERROR]', err);
    return c.json({ status: 'error', message: 'Failed to update schema' }, 500);
  }
};
