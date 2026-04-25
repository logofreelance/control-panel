/**
 * page-error-templates-save-post/model.ts
 */
import { randomUUID } from 'node:crypto';

export async function saveErrorTemplate(db: any, body: any) {
  const id = randomUUID();
  const statusCode = body.statusCode || body.status_code || 400;
  const title = body.title || 'Error';
  const messageTemplate = body.messageTemplate || body.template || body.message_template || '';
  const responseFormat = body.responseFormat || body.response_format || 'json';

  await db.execute(
    'INSERT INTO api_error_templates (id, status_code, title, message_template, response_format) VALUES (?, ?, ?, ?, ?)',
    [id, statusCode, title, messageTemplate, responseFormat]
  );

  return { id, statusCode };
}
