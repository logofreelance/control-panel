/**
 * resource-delete-delete/model.ts
 *
 * SQL: DELETE from route_dynamic by rid
 */

export async function deleteEndpoint(db: any, rid: string) {
  await db.execute('DELETE FROM route_dynamic WHERE id = ?', [rid]);
}
