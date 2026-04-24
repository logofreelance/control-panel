/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: GET /api/database-schema/page-data-viewer/rows/:id
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: DataViewer (Tabel Data)
 * Composable: useDataViewer()
 *
 * RESPONSE CONTRACT:
 *   { status: 'success', data: { data: RowData[], total: number } }
 *
 * ❌ DILARANG mengubah nesting 'data' dan 'total'
 * ═══════════════════════════════════════════════════════════════
 */
import { getRows, getTotalCount } from './model';
import { getSchemaHeader } from '../page-data-viewer-header-get/model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const id = c.req.param('id');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const sortBy = c.req.query('sortBy') || 'id';
    const sortDir = c.req.query('sortDir') || 'DESC';
    
    const schema = await getSchemaHeader(db, id);
    if (!schema) return c.json({ status: 'error', message: 'Not found' }, 404);

    const [rows, total] = await Promise.all([
      getRows(db, schema.table_name, page, limit, sortBy, sortDir),
      getTotalCount(db, schema.table_name)
    ]);

    const result = { data: rows, total };

    // Guard contract
    if (!('data' in result) || !('total' in result)) {
      console.error(`🚨 [CONTRACT VIOLATION] page-data-viewer-rows-get — Must have data[] and total`);
    }

    return c.json({ status: 'success', data: result });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
