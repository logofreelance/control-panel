/**
 * page-builder-endpoint-toggle-put/model.ts
 */
export async function toggleEndpoint(db: any, id: string, isActive: boolean) {
  await db.execute('UPDATE route_dynamic SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
}
