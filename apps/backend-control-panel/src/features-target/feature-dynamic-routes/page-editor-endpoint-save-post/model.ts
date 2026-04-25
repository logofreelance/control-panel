/**
 * page-editor-endpoint-save-post/model.ts
 */
import { randomUUID } from 'node:crypto';

export async function saveEndpoint(db: any, body: any) {
  const id = body.id || randomUUID();
  const endpoint = body.path || body.endpoint;
  const method = body.method || 'GET';
  const category_id = body.categoryId || body.category_id || null;
  const is_active = body.isActive ?? body.is_active ?? 1;
  const description = body.description || '';
  const handler_type = body.handlerType || body.handler_type || 'proxy';

  const cleanBody = { ...body };
  delete cleanBody.handler_config;
  delete cleanBody.handler_type;
  delete cleanBody.id;
  delete cleanBody.endpoint;
  delete cleanBody.method;

  const handler_config = JSON.stringify(cleanBody);

  await db.execute(
    `INSERT INTO route_dynamic 
     (id, endpoint, method, handler_type, handler_config, category_id, is_active, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
     endpoint = VALUES(endpoint),
     method = VALUES(method),
     handler_type = VALUES(handler_type),
     handler_config = VALUES(handler_config),
     category_id = VALUES(category_id),
     is_active = VALUES(is_active),
     description = VALUES(description)`,
    [id, endpoint, method, handler_type, handler_config, category_id, is_active ? 1 : 0, description]
  );

  return { id };
}
