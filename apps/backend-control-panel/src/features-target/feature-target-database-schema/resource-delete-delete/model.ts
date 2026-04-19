/**
 * resource-delete-delete/model.ts
 *
 * SQL: DELETE from database_resources by rid
 */

export async function deleteEndpoint(db: any, rid: string | number) {
  await db.execute('DELETE FROM database_resources WHERE id = ?', [rid]);
}
