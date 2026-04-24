/**
 * data-delete-delete/handler.ts
 */
import { findSchemaById, deleteRow } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const tableId = c.req.param('id');
    const rowId = c.req.param('rowId');

    const schema = await findSchemaById(db, tableId);
    if (!schema) {
      return c.json({ status: 'error', message: 'Table schema not found' }, 404);
    }

    await deleteRow(db, schema.table_name, rowId);
    
    return c.json({
      status: 'success',
      message: 'Row deleted successfully',
    });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
