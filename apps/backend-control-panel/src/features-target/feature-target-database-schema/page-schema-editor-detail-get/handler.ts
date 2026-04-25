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
    
    const schema = await getSchemaDetail(db, id);
    if (!schema) return c.json({ status: 'error', message: 'Not found' }, 404);

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
      } catch {
        // ignore
      }
    }
    
    const result = { ...schema, columns };

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
