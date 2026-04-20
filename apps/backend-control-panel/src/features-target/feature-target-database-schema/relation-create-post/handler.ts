/**
 * relation-create-post/handler.ts
 *
 * ALUR: Request param :id + body → Insert relation → Return id
 */
import { insertRelation } from './model';
import * as fs from 'fs';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const tableId = c.req.param('id');
    const body = await c.req.json();
    
    try {
      fs.writeFileSync('D:/6 WEBSITE/2 2025/desember/backend-engine/debug_relation.txt', JSON.stringify({
        tableId,
        body,
        safeTargetIdStr: body.targetId !== undefined ? String(body.targetId) : String(body.target_id)
      }, null, 2));
    } catch(err) {}

    if (body.targetId === undefined && body.target_id === undefined) {
       return c.json({ status: 'error', message: 'Payload is missing targetId. Received: ' + JSON.stringify(body) }, 400);
    }
    
    const result = await insertRelation(db, tableId, body);
    return c.json({ status: 'success', data: result });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
