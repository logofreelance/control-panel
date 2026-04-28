/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: GET /api/database-schema/page-data-viewer/header/:id
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: DataPage (untuk Header UI)
 * Composable: DataPage fetchSource()
 *
 * RESPONSE CONTRACT:
 *   { status: 'success', data: SchemaHeaderInfo }
 *   SchemaHeaderInfo: { id, name, table_name }
 * ═══════════════════════════════════════════════════════════════
 */
import { getSchemaHeader } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const data: any = await getSchemaHeader(db, id);
    
    if (!data) return c.json({ status: 'error', message: 'Not found' }, 404);

    // ✅ Map to frontend expected names
    const result = {
      ...data,
      tableName: data.table_name,
      schemaJson: data.schema_json
    };
    
    return c.json({ status: 'success', data: result });

  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
