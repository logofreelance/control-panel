/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: GET /api/database-schema/page-schema-trash/schemas
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: DatabaseSchemaTrashView (Halaman Trash)
 * Composable: useTrash()
 *
 * RESPONSE CONTRACT:
 *   { status: 'success', data: TrashItem[] }
 *   TrashItem: { id, name, table_name, is_archived, deleted_at }
 *
 * (TIDAK PERLU columns info karena trash view tidak menampilkannya)
 * ═══════════════════════════════════════════════════════════════
 */
import { findArchivedSchemas } from './model';

const REQUIRED_FIELDS = ['id', 'name', 'table_name', 'is_archived'] as const;

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const schemas = await findArchivedSchemas(db);

    // Guard: validate contract
    if (schemas.length > 0) {
      const sample = schemas[0];
      for (const field of REQUIRED_FIELDS) {
        if (!(field in sample)) {
          console.error(`🚨 [CONTRACT VIOLATION] page-schema-trash-schemas-get — Missing: "${field}"`);
        }
      }
    }

    return c.json({ status: 'success', data: schemas });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
