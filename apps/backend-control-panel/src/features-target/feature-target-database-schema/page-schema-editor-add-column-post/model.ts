/**
 * page-schema-editor-add-column-post/model.ts
 */
import { mapTypeToSql, buildColumnSql } from '../shared-sql';

export async function addColumn(db: any, tableName: string, columnDef: any) {
  const columnSql = buildColumnSql(columnDef);
  const sql = `ALTER TABLE \`${tableName}\` ADD COLUMN ${columnSql}`.trim();
  await db.execute(sql);
}
