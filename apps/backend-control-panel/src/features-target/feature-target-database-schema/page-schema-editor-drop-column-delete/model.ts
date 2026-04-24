/**
 * page-schema-editor-drop-column-delete/model.ts
 */

export async function dropColumn(db: any, tableName: string, colName: string) {
  await db.execute(`ALTER TABLE \`${tableName}\` DROP COLUMN \`${colName}\``);
}
