/**
 * data-update-put/model.ts
 */

export async function findSchemaById(db: any, id: string) {
  const res: any = await db.execute('SELECT * FROM database_tables WHERE id = ?', [id]);
  const rows = Array.isArray(res) ? res : res.rows || [];
  return rows.length ? rows[0] : null;
}

export async function updateRow(db: any, tableName: string, rowId: string | number, data: any) {
  const entries = Object.entries(data).filter(([k]) => k !== 'id');
  const setClauses = entries.map(([k]) => `${k} = ?`);
  const values = [...entries.map(([, v]) => v), rowId];

  return db.execute(
    `UPDATE ${tableName} SET ${setClauses.join(', ')} WHERE id = ?`,
    values
  );
}
