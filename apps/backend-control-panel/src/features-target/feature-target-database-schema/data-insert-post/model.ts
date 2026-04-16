/**
 * data-insert-post/model.ts
 *
 * SQL: Find schema by ID + Insert row into physical table
 */
import { randomUUID } from 'node:crypto';

export async function findSchemaById(db: any, id: string) {
  const res: any = await db.execute('SELECT * FROM database_tables WHERE id = ?', [id]);
  const rows = Array.isArray(res) ? res : res.rows || [];
  return rows.length ? rows[0] : null;
}

export async function insertRow(db: any, tableName: string, data: any) {
  const rowId = data.id || randomUUID();
  const entries = Object.entries(data).filter(([k]) => k !== 'id');
  const fields = ['id', ...entries.map(([k]) => k)];
  const placeholders = ['?', ...entries.map(() => '?')];
  const values = [rowId, ...entries.map(([, v]) => v)];

  await db.execute(
    `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`,
    values
  );
  return { id: rowId };
}
