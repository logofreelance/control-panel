/**
 * resource-update-put/model.ts
 *
 * SQL: UPDATE route_dynamic by rid
 */

export async function updateEndpoint(db: any, rid: string, body: any) {
  const handler_config = JSON.stringify(body);

  await db.execute(
    `UPDATE route_dynamic SET
     endpoint = ?, method = ?, handler_config = ?,
     category_id = ?, description = ?
     WHERE id = ?`,
    [
      body.slug || body.endpoint, body.method || 'GET',
      handler_config, body.category_id || null,
      body.description || '', rid
    ]
  );

  return { id: rid, ...body };
}
