/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: GET /api/database-schema/page-schema-list/schemas
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: DatabaseSchemaListPage (DatabaseSchemaView)
 * Composable: useDatabaseSchema()
 *
 * RESPONSE CONTRACT:
 *   { status: 'success', data: SchemaItem[] }
 *   SchemaItem: { id, name, table_name, display_name, description,
 *                 category_id, category_name, category_color, category_icon,
 *                 schema_json, is_archived, created_at, updated_at,
 *                 columns: { name, type, nullable, isPrimary, default }[] }
 *
 * ❌ DILARANG menghapus/rename field di atas
 * ✅ BOLEH menambah field baru
 * ═══════════════════════════════════════════════════════════════
 */
import { findActiveSchemas } from './model';

const REQUIRED_FIELDS = ['id', 'name', 'table_name', 'columns'] as const;

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const schemas = await findActiveSchemas(db);

    // Enrich each schema with physical columns from DESCRIBE
    const enriched = await Promise.all(
      schemas.map(async (schema: any) => {
        let columns: any[] = [];
        try {
          if (schema.table_name) {
            const res: any = await db.execute(`DESCRIBE ${schema.table_name}`);
            const cols = Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
            columns = cols.map((col: any) => ({
              name: col.Field || col.column_name,
              type: col.Type || col.column_type,
              nullable: (col.Null || col.is_nullable) === 'YES',
              isPrimary: (col.Key || col.column_key) === 'PRI',
              default: col.Default || col.column_default,
            }));
          }
        } catch {
          // Table might not exist, skip
        }
        return { ...schema, columns };
      })
    );

    // Guard: validate contract
    if (enriched.length > 0) {
      const sample = enriched[0];
      for (const field of REQUIRED_FIELDS) {
        if (!(field in sample)) {
          console.error(`🚨 [CONTRACT VIOLATION] page-schema-list-get — Missing: "${field}"`);
        }
      }
    }

    return c.json({ status: 'success', data: enriched });
  } catch {
    return c.json({ status: 'success', data: [] });
  }
};
