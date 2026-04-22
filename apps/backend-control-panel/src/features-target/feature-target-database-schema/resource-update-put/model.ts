/**
 * resource-update-put/model.ts
 *
 * SQL: UPDATE database_resources by rid
 */

export async function updateEndpoint(db: any, rid: string | number, body: any) {
  const name = body.name || 'API Resource';
  const slug = body.slug || body.endpoint || '';
  const description = body.description || '';
  const fieldsJson = body.fields_json || '[]';
  const filtersJson = body.filters_json || '[]';
  const relationsJson = body.relations_json || '{}';
  const orderBy = body.order_by || 'id';
  const orderDirection = body.order_direction || 'DESC';
  const defaultLimit = body.default_limit || 10;
  const isPublic = body.is_public ? 1 : 0;
  const aggregatesJson = body.aggregates_json || '[]';
  const computedJson = body.computed_json || '[]';
  const joinsJson = body.joins_json || '[]';

  await db.execute(
    `UPDATE database_resources SET
     name = ?, slug = ?, description = ?, fields_json = ?, filters_json = ?, relations_json = ?,
     order_by = ?, order_direction = ?, default_limit = ?, is_public = ?,
     aggregates_json = ?, computed_json = ?, joins_json = ?
     WHERE id = ?`,
    [
      name, slug, description, fieldsJson, filtersJson, relationsJson,
      orderBy, orderDirection, defaultLimit, isPublic,
      aggregatesJson, computedJson, joinsJson, rid
    ]
  );

  return { id: rid, ...body };
}
