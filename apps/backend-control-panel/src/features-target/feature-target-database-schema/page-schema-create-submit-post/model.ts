/**
 * page-schema-create-submit-post/model.ts
 */
import { buildColumnSql } from '../shared-sql';

export async function executePhysicalCreate(db: any, tableName: string, schema: any) {
  let columnsSql: string[] = [];
  
  // Track if id is provided in the schema
  const hasCustomId = schema.columns && Array.isArray(schema.columns) && 
                      schema.columns.some((c: any) => c.name === 'id');

  // If no 'id' column provided by user, we add a default auto-increment one
  if (!hasCustomId) {
    columnsSql.push('`id` INT AUTO_INCREMENT PRIMARY KEY');
  }
  
  if (schema.columns && Array.isArray(schema.columns)) {
    for (const col of schema.columns) {
      columnsSql.push(buildColumnSql(col));
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
