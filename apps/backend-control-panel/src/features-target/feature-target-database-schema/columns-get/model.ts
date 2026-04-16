/**
 * columns-get/model.ts
 *
 * SQL: Find schema by ID + DESCRIBE physical table
 */
import type { PhysicalColumn } from './types';

export async function findSchemaById(db: any, id: string) {
  const res: any = await db.execute('SELECT * FROM database_tables WHERE id = ?', [id]);
  const rows = Array.isArray(res) ? res : res.rows || [];
  return rows.length ? rows[0] : null;
}

export async function getPhysicalColumns(db: any, tableName: string): Promise<PhysicalColumn[]> {
  const res: any = await db.execute(`DESCRIBE ${tableName}`);
  const cols = Array.isArray(res) ? res : res.rows || [];
  return cols.map((col: any) => ({
    name: col.Field || col.column_name,
    type: col.Type || col.column_type,
    nullable: (col.Null || col.is_nullable) === 'YES',
    isPrimary: (col.Key || col.column_key) === 'PRI',
    default: col.Default || col.column_default
  }));
}
