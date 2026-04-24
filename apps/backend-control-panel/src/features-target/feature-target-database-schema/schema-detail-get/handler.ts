/**
 * schema-detail-get/handler.ts
 *
 * ALUR: Request param :id → Find by ID → Enrich with physical columns → Return schema or 404
 */
import { findSchemaById } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const data = await findSchemaById(db, c.req.param('id'));
    if (!data) {
      return c.json({ status: 'error', message: 'Not found' }, 404);
    }

    // 2. Enrich with physical columns and MERGE with metadata order
    let columns: any[] = [];
    try {
      if (data.table_name) {
        const res: any = await db.execute(`DESCRIBE ${data.table_name}`);
        const physicalCols = Array.isArray(res) ? res : res.rows || [];
        
        // Map physical columns
        const physicalMap = new Map();
        physicalCols.forEach((col: any) => {
          const name = (col.Field || col.column_name || "").toLowerCase();
          if (name) {
            physicalMap.set(name, {
              name: col.Field || col.column_name,
              type: col.Type || col.column_type,
              nullable: (col.Null || col.is_nullable) === 'YES',
              isPrimary: (col.Key || col.column_key) === 'PRI',
              default: col.Default || col.column_default,
            });
          }
        });

        // Parse metadata for order
        let metadataCols: any[] = [];
        try {
          if (data.schema_json) {
            const parsed = JSON.parse(data.schema_json);
            metadataCols = parsed.columns || [];
          }
        } catch {}

        // Construct ordered columns
        const ordered: any[] = [];
        metadataCols.forEach((m: any) => {
          const key = (m.name || "").toLowerCase();
          if (physicalMap.has(key)) {
            ordered.push({ ...physicalMap.get(key), displayName: m.displayName });
            physicalMap.delete(key);
          }
        });

        // Append remaining physical columns
        physicalMap.forEach((val) => ordered.push(val));
        
        columns = ordered.length > 0 ? ordered : Array.from(physicalMap.values());
      }
    } catch {
      // Table might not exist yet, ignore
    }

    return c.json({
      status: 'success',
      data: { ...data, columns },
    });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
