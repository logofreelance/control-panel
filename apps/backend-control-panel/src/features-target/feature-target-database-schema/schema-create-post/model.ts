/**
 * schema-create-post/model.ts
 *
 * SQL: Create physical table + Insert metadata into database_tables
 */
import type { ColumnDefinition } from './types';

const SQL_TYPE_MAP: Record<string, string> = {
  string: 'VARCHAR(255)',
  integer: 'INT',
  number: 'INT',
  decimal: 'DECIMAL(10,2)',
  float: 'DECIMAL(10,2)',
  text: 'TEXT',
  longtext: 'TEXT',
  json: 'JSON',
  jsonb: 'JSON',
  boolean: 'TINYINT(1)',
  datetime: 'DATETIME',
  date: 'DATE',
  status: 'VARCHAR(50)',
  slug: 'VARCHAR(255)',
  relation: 'VARCHAR(36)',
};

export async function createPhysicalTable(
  db: any,
  tableName: string,
  columns: ColumnDefinition[],
  options: { timestamps?: boolean; softDelete?: boolean } = {}
) {
  let ddl = `CREATE TABLE ${tableName} (id VARCHAR(36) PRIMARY KEY, `;

  for (const col of columns) {
    if (col.name === 'id') continue;
    const sqlType = SQL_TYPE_MAP[col.type] || 'VARCHAR(255)';
    const nullable = col.required ? 'NOT NULL' : '';
    const unique = col.unique ? 'UNIQUE' : '';
    ddl += `${col.name} ${sqlType} ${nullable} ${unique}, `;
  }

  if (options.timestamps !== false) {
    ddl += `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `;
  }

  if (options.softDelete) {
    ddl += `is_archived TINYINT DEFAULT 0, `;
  }

  ddl = ddl.slice(0, -2) + `);`;
  return db.execute(ddl);
}

export async function insertSchemaRecord(db: any, data: {
  id: string;
  name: string;
  table_name: string;
  description: string;
  schema_json: string;
  connection_config: string;
}) {
  await db.execute(
    `INSERT INTO database_tables (id, name, table_name, display_name, description, schema_json, connection_config)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.id, data.name, data.table_name, data.name, data.description, data.schema_json, data.connection_config]
  );
}
