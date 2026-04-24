/**
 * page-data-viewer-insert-row-post/model.ts
 */

export async function insertRow(db: any, tableName: string, data: Record<string, any>) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  
  if (keys.length === 0) return;

  const columnsStr = keys.map(k => `\`${k}\``).join(', ');
  const placeholdersStr = keys.map(() => '?').join(', ');

  await db.execute(
    `INSERT INTO \`${tableName}\` (${columnsStr}) VALUES (${placeholdersStr})`,
    values
  );
}
