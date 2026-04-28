/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: GET /api/database-schema/page-schema-editor/detail/:id
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: SchemaEditor (SchemaPage)
 * Composable: useSchemaEditor()
 *
 * RESPONSE CONTRACT:
 *   { status: 'success', data: SchemaDetail }
 *   SchemaDetail: { id, name, table_name, display_name, description,
 *                   schema_json, columns: Column[] }
 * ═══════════════════════════════════════════════════════════════
 */
import { getSchemaDetail } from './model';

const REQUIRED_FIELDS = ['id', 'name', 'table_name', 'columns'] as const;

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    
    const result: any = { 
      ...schema,
      tableName: schema.table_name,
      schemaJson: schema.schema_json
    };

    // Enrich with physical columns
    let columns: any[] = [];
    if (schema.table_name) {
      try {
        const res: any = await db.execute(`DESCRIBE \`${schema.table_name}\``);
        const cols = Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
        columns = cols.map((col: any) => ({
          name: col.Field || col.column_name,
          type: col.Type || col.column_type,
          nullable: (col.Null || col.is_nullable) === 'YES',
          isPrimary: (col.Key || col.column_key) === 'PRI',
          default: col.Default || col.column_default,
        }));

        // ✅ Sort columns based on schema_json order if available
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

              columns.sort((a, b) => {
                const orderA = orderMap.has(a.name) ? orderMap.get(a.name) : 999;
                const orderB = orderMap.has(b.name) ? orderMap.get(b.name) : 999;
                return orderA - orderB;
              });
            }
          } catch (err) {
            console.error('[SCHEMA-DETAIL] Failed to parse schema_json for sorting:', err);
          }
        }
      } catch {
        // ignore
      }
    }
    
    result.columns = columns;

    // Guard
    for (const field of REQUIRED_FIELDS) {
      if (!(field in result)) {
        console.error(`🚨 [CONTRACT VIOLATION] page-schema-editor-detail-get — Missing: "${field}"`);
      }
    }

    return c.json({ status: 'success', data: result });

  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
