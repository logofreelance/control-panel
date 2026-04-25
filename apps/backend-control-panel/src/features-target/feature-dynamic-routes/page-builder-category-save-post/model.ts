/**
 * page-builder-category-save-post/model.ts
 */
import { randomUUID } from 'node:crypto';

export async function saveCategory(db: any, id: string | undefined, name: string, description: string) {
  if (id) {
    await db.execute(
      'UPDATE route_categories SET name = ?, description = ? WHERE id = ?',
      [name.trim(), description || '', id]
    );
    return { id, name: name.trim() };
  }

  const newId = randomUUID();
  await db.execute(
    'INSERT INTO route_categories (id, name, description) VALUES (?, ?, ?)',
    [newId, name.trim(), description || '']
  );
  return { id: newId, name: name.trim() };
}
