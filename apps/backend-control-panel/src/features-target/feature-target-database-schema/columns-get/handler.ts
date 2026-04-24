/**
 * columns-get/handler.ts
 *
 * ALUR: Request param :id → Find schema → Describe table → Return columns
 */
import { findSchemaById, getPhysicalColumns } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    
    let tableName = '';
    let schema: any = null;
    if (id === '0') {
      tableName = 'users';
    } else {
      schema = await findSchemaById(db, id);
      if (!schema) return c.json({ status: 'error', message: 'Not found' }, 404);
      tableName = schema.table_name;
    }

    const physicalCols = await getPhysicalColumns(db, tableName);
    
    // Merge with metadata order if available
    if (schema && schema.schema_json) {
      try {
        const parsed = JSON.parse(schema.schema_json);
        const metadataCols = parsed.columns || [];
        
        const physicalMap = new Map();
        physicalCols.forEach((col: any) => {
          const name = (col.name || "").toLowerCase();
          if (name) physicalMap.set(name, col);
        });

        const ordered: any[] = [];
        metadataCols.forEach((m: any) => {
          const key = (m.name || "").toLowerCase();
          if (physicalMap.has(key)) {
            ordered.push({ ...physicalMap.get(key), displayName: m.displayName });
            physicalMap.delete(key);
          }
        });

        physicalMap.forEach((val) => ordered.push(val));
        return c.json({ status: 'success', data: ordered });
      } catch (e) {
        console.error('[COLUMNS-MERGE-ERROR]', e);
      }
    }

    return c.json({ status: 'success', data: physicalCols });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
