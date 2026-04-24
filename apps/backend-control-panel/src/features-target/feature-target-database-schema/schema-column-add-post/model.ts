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
  
  let defaultValue = '';
  if (column.default !== undefined && column.default !== '') {
    // Basic escaping: if it's a string and not a keyword like CURRENT_TIMESTAMP, wrap in quotes
    const isKeyword = ['CURRENT_TIMESTAMP', 'NULL', 'TRUE', 'FALSE'].includes(String(column.default).toUpperCase());
    defaultValue = isKeyword ? `DEFAULT ${column.default}` : `DEFAULT '${column.default}'`;
  }
  
  // Step 1: Add column WITHOUT unique constraint (TiDB/MySQL doesn't support inline UNIQUE on ALTER TABLE ADD COLUMN)
  const addSql = `ALTER TABLE ${tableName} ADD COLUMN ${column.name} ${sqlType} ${nullable} ${defaultValue}`.replace(/\s+/g, ' ').trim();
  await db.execute(addSql);

  // Step 2: Add unique index separately if needed
  if (column.unique) {
    const uniqueSql = `ALTER TABLE ${tableName} ADD UNIQUE INDEX \`idx_${column.name}_unique\` (\`${column.name}\`)`;
    await db.execute(uniqueSql);
  }
}
