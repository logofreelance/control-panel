/**
 * resource-create-post/model.ts
 *
 * SQL: INSERT into database_resources
 */

export async function insertEndpoint(db: any, tableId: string, body: any) {
  const name = body.name || 'API Resource';
  const slug = body.slug || body.endpoint || '';
  const description = body.description || '';
  const fieldsJson = body.fields_json || '[]';
  const filtersJson = body.filters_json || '[]';
  const relationsJson = body.relations_json || '[]';
  const orderBy = body.order_by || 'id';
  const orderDirection = body.order_direction || 'DESC';
  const defaultLimit = body.default_limit || 10;
  const isPublic = body.is_public ? 1 : 0;
  const aggregatesJson = body.aggregates_json || '[]';
  const computedJson = body.computed_json || '[]';
  const joinsJson = body.joins_json || '[]';

  const sql = `INSERT INTO database_resources
     (database_table_id, name, slug, description, fields_json, filters_json, relations_json, order_by, order_direction, default_limit, is_public, is_active, aggregates_json, computed_json, joins_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  console.log('[DEBUG] Executing INSERT with database_table_id:', tableId);

  const res: any = await db.execute(sql, [
      tableId, name, slug, description, fieldsJson, filtersJson, relationsJson, orderBy, orderDirection, defaultLimit, isPublic, 1, aggregatesJson, computedJson, joinsJson
    ]
  );
  
  const autoId = res.insertId || res[0]?.insertId;

  return { id: autoId, ...body };
}
