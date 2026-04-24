/**
 * data-update-put/handler.ts
 */
import { findSchemaById, updateRow } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const tableId = c.req.param('id');
    const rowId = c.req.param('rowId');
    const body = await c.req.json();

    const schema = await findSchemaById(db, tableId);
    if (!schema) {
      return c.json({ status: 'error', message: 'Table schema not found' }, 404);
    }

    await updateRow(db, schema.table_name, rowId, body);
    
    return c.json({
      status: 'success',
      message: 'Row updated successfully',
    });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
