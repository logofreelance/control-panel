/**
 * schema-column-add-post/model.ts
 */
import { SQL_TYPE_MAP } from '../shared-sql';

export async function findSchemaById(db: any, id: string) {
  const res: any = await db.execute('SELECT * FROM database_tables WHERE id = ?', [id]);
  const rows = Array.isArray(res) ? res : res.rows || [];
  return rows.length ? rows[0] : null;
}

export async function addPhysicalColumn(db: any, tableName: string, column: any) {
  const sqlType = SQL_TYPE_MAP[column.type] || 'VARCHAR(255)';
  const nullable = column.required ? 'NOT NULL' : '';
  const unique = column.unique ? 'UNIQUE' : '';
  
  const sql = `ALTER TABLE ${tableName} ADD COLUMN ${column.name} ${sqlType} ${nullable} ${unique}`;
  return db.execute(sql);
}
