/**
 * page-schema-editor-add-column-post/model.ts
 */
import { mapTypeToSql } from '../shared-sql';

export async function addColumn(db: any, tableName: string, columnDef: any) {
  const sqlType = mapTypeToSql(columnDef.type, columnDef);
  const nullable = columnDef.required ? 'NOT NULL' : 'NULL';
  const unique = columnDef.unique ? 'UNIQUE' : '';
  
  let defaultVal = '';
  if (columnDef.default !== undefined && columnDef.default !== null && columnDef.default !== '') {
    if (typeof columnDef.default === 'boolean') {
      defaultVal = `DEFAULT ${columnDef.default ? 1 : 0}`;
    } else if (typeof columnDef.default === 'number') {
      defaultVal = `DEFAULT ${columnDef.default}`;
    } else if (columnDef.type === 'string' || columnDef.type === 'text') {
      defaultVal = `DEFAULT '${columnDef.default}'`;
    }
  }

  const sql = `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnDef.name}\` ${sqlType} ${nullable} ${defaultVal} ${unique}`.trim();
  await db.execute(sql);
}
