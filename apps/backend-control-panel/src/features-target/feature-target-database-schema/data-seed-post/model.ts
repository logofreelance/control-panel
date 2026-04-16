/**
 * data-seed-post/model.ts
 *
 * SQL: Find schema by ID + DESCRIBE table + INSERT seed rows
 */
import { randomUUID } from 'node:crypto';

export async function findSchemaById(db: any, id: string) {
  const res: any = await db.execute('SELECT * FROM database_tables WHERE id = ?', [id]);
  const rows = Array.isArray(res) ? res : res.rows || [];
  return rows.length ? rows[0] : null;
}

export async function getColumnNames(db: any, tableName: string): Promise<string[]> {
  const res: any = await db.execute(`DESCRIBE ${tableName}`);
  const cols = Array.isArray(res) ? res : res.rows || [];
  return cols.map((col: any) => col.Field || col.column_name);
}

export async function insertSeedRow(db: any, tableName: string, colNames: string[], post: Record<string, any>) {
  const rowId = randomUUID();
  const fields = ['id'];
  const values: any[] = [rowId];
  const placeholders = ['?'];

  for (const [key, value] of Object.entries(post)) {
    if (colNames.includes(key)) {
      fields.push(key);
      placeholders.push('?');
      values.push(value);
    }
  }

  await db.execute(
    `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`,
    values
  );
}
