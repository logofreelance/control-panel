/**
 * ═══════════════════════════════════════════════════════════════
 * ROUTE: POST /api/database-schema/page-schema-create/validate
 * ═══════════════════════════════════════════════════════════════
 *
 * HANYA digunakan oleh: CreateSchemaForm
 * Composable: useCreateSchema()
 * ═══════════════════════════════════════════════════════════════
 */
export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const body = await c.req.json();
    const { tableName, schema } = body;

    let errors: string[] = [];
    let valid = true;

    if (!tableName) {
      errors.push('Table name is required');
      valid = false;
    } else {
      // Check if physical table already exists
      try {
        const res: any = await db.execute(`SHOW TABLES LIKE ?`, [tableName]);
        const rows = Array.isArray(res) ? (Array.isArray(res[0]) ? res[0] : res) : (res.rows || []);
        if (rows.length > 0) {
          errors.push(`Table '${tableName}' already exists in the database`);
          valid = false;
        }
      } catch (err: any) {
        // Ignore show tables error
      }
    }

    if (!schema || !Array.isArray(schema.columns) || schema.columns.length === 0) {
      errors.push('Schema must have at least one column');
      valid = false;
    }

    return c.json({
      status: 'success',
      data: { valid, errors, sanitizedTableName: tableName }
    });
  } catch (e: any) {
    return c.json({ status: 'error', message: e.message }, 500);
  }
};
