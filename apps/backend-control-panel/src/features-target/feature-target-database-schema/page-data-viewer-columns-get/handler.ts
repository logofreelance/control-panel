/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: GET /api/database-schema/page-data-viewer/columns/:id
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: DataViewer (Tabel Data)
 * Composable: useDataViewer()
 * ═══════════════════════════════════════════════════════════════
 */
import { getPhysicalColumns } from './model';
import { getSchemaHeader } from '../page-data-viewer-header-get/model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    
    const schema = await getSchemaHeader(db, id);
    if (!schema) return c.json({ status: 'error', message: 'Not found' }, 404);

    const columns = await getPhysicalColumns(db, schema.table_name);

    // ✅ Sort columns based on schema_json order if available
    let sortedColumns = [...columns];
    if (schema.schema_json) {
      try {
        const schemaData = typeof schema.schema_json === 'string' 
          ? JSON.parse(schema.schema_json) 
          : schema.schema_json;
        
        const definedColumns = schemaData.columns || [];
        if (Array.isArray(definedColumns) && definedColumns.length > 0) {
          const orderMap = new Map();
          definedColumns.forEach((col: any, index: number) => {
            orderMap.set(col.name, index);
          });

          sortedColumns.sort((a, b) => {
            const orderA = orderMap.has(a.name) ? orderMap.get(a.name) : 999;
            const orderB = orderMap.has(b.name) ? orderMap.get(b.name) : 999;
            return orderA - orderB;
          });
        }
      } catch (err) {
        console.error('[DATA-VIEWER] Failed to parse schema_json for sorting:', err);
      }
    }

    return c.json({ status: 'success', data: sortedColumns });

  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
