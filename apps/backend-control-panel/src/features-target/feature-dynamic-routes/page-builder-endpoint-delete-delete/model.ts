/**
 * page-builder-endpoint-delete-delete/model.ts
 */
export async function deleteEndpoint(db: any, id: string) {
  await db.execute('DELETE FROM route_dynamic WHERE id = ?', [id]);
}
