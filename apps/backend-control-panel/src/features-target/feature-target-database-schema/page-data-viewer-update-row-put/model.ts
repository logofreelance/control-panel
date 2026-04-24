/**
 * page-data-viewer-update-row-put/model.ts
 */

export async function updateRow(db: any, tableName: string, rowId: string, data: Record<string, any>) {
  const keys = Object.keys(data).filter(k => k !== 'id'); // Don't update PK
  if (keys.length === 0) return;

  const setStr = keys.map(k => `\`${k}\` = ?`).join(', ');
  const values = keys.map(k => data[k]);
  
  // Assume primary key is always 'id' for simple cases
  values.push(rowId);

  await db.execute(
    `UPDATE \`${tableName}\` SET ${setStr} WHERE id = ?`,
    values
  );
}
