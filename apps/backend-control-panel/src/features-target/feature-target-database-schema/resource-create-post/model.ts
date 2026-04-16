/**
 * resource-create-post/model.ts
 *
 * SQL: INSERT into route_dynamic
 */
import { randomUUID } from 'node:crypto';

export async function insertEndpoint(db: any, tableId: string, body: any) {
  const id = randomUUID();

  // Ensure source IDs are set
  body.data_source_id = tableId;
  body.DatabaseTableId = tableId;

  const endpoint = body.slug || body.endpoint;
  const handler_config = JSON.stringify(body);

  await db.execute(
    `INSERT INTO route_dynamic
     (id, endpoint, method, handler_type, handler_config, category_id, is_active, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, endpoint, body.method || 'GET', 'proxy',
      handler_config, body.category_id || null, 1, body.description || ''
    ]
  );

  return { id, ...body };
}
