/**
 * resource-list-get/model.ts
 *
 * SQL: Query `database_resources` table
 */

export async function findSchemaById(db: any, id: string) {
  const res: any = await db.execute('SELECT * FROM database_tables WHERE id = ?', [id]);
  const rows = Array.isArray(res) ? res : res.rows || [];
  return rows.length ? rows[0] : null;
}

export async function ensureDatabaseResourcesTable(db: any): Promise<void> {
  // Table initialization is now primarily handled in middleware/handler.ts
  const res: any = await db.execute(`SHOW TABLES LIKE 'database_resources'`);
  const rows = Array.isArray(res) ? res : res.rows || [];
  if (rows.length === 0) {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS database_resources (
          id INT AUTO_INCREMENT PRIMARY KEY,
          database_table_id VARCHAR(36) NOT NULL,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL,
          description TEXT,
          fields_json TEXT,
          filters_json TEXT,
          relations_json TEXT,
          order_by VARCHAR(255) DEFAULT 'id',
          order_direction VARCHAR(10) DEFAULT 'DESC',
          default_limit INT DEFAULT 10,
          max_limit INT DEFAULT 100,
          is_public TINYINT DEFAULT 0,
          is_active TINYINT DEFAULT 1,
          aggregates_json TEXT,
          computed_json TEXT,
          joins_json TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_table_id (database_table_id)
      )
    `);
  }
}

export async function fetchResourcesByTableId(db: any, tableId: string) {
  const res: any = await db.execute('SELECT * FROM database_resources WHERE database_table_id = ? ORDER BY created_at DESC', [tableId]);
  return Array.isArray(res) ? res : res.rows || [];
}
