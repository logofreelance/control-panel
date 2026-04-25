/**
 * page-schema-create-submit-post/model.ts
 */
import { mapTypeToSql } from '../shared-sql';

export async function executePhysicalCreate(db: any, tableName: string, schema: any) {
  let columnsSql = ['`id` INT AUTO_INCREMENT PRIMARY KEY'];
  
  if (schema.columns && Array.isArray(schema.columns)) {
    for (const col of schema.columns) {
      if (col.name === 'id') continue;
      
      const sqlType = mapTypeToSql(col.type, col);
      const nullable = col.required ? 'NOT NULL' : 'NULL';
      const unique = col.unique ? 'UNIQUE' : '';
      let defaultVal = '';
      
      if (col.default !== undefined && col.default !== null && col.default !== '') {
        if (typeof col.default === 'boolean') {
          defaultVal = `DEFAULT ${col.default ? 1 : 0}`;
        } else if (typeof col.default === 'number') {
          defaultVal = `DEFAULT ${col.default}`;
        } else if (col.type === 'string' || col.type === 'text') {
          defaultVal = `DEFAULT '${String(col.default).replace(/'/g, "''")}'`;
        }
      }
      
      columnsSql.push(`\`${col.name}\` ${sqlType} ${nullable} ${defaultVal} ${unique}`.trim());
    }
  }

  if (schema.timestamps) {
    columnsSql.push('`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    columnsSql.push('`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
  }

  if (schema.softDelete) {
    columnsSql.push('`deleted_at` TIMESTAMP NULL DEFAULT NULL');
  }

  const createTableSql = `CREATE TABLE \`${tableName}\` (\n  ${columnsSql.join(',\n  ')}\n)`;
  console.log('[DEBUG-SQL] Creating physical table:', createTableSql);
  await db.execute(createTableSql);
}

export async function saveSchemaMetadata(db: any, data: { id: string, name: string, tableName: string, description: string, categoryId: string | null, schemaJson: string }) {
  await db.execute(
    `INSERT INTO database_tables (id, name, table_name, description, category_id, schema_json)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.id, data.name, data.tableName, data.description, data.categoryId, data.schemaJson]
  );
}
