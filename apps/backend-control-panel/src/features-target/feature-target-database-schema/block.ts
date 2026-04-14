/**
 * feature-target-database-schema (SaaS REFACTOR)
 * Controls database connection and schema management in the target system.
 */
import { Hono } from 'hono';

type AppEnv = { Variables: { targetDb: any; targetId: string } };

export function createFeatureTargetDatabaseSchema() {
  const router = new Hono<AppEnv>();

  const getDb = (c: any) => c.get('targetDb');

  const checkAndCreateTable = async (c: any) => {
    try {
      const db = getDb(c);
      const exists: any = await db.execute("SHOW TABLES LIKE 'database_tables'");
      const existsRows = Array.isArray(exists) ? exists : exists.rows || [];
      if (existsRows.length > 0) {
        // Check if it's the legacy table with BIGINT id
        const cols: any = await db.execute('DESCRIBE database_tables');
        const colRows = Array.isArray(cols) ? cols : cols.rows || [];
        const idCol = colRows.find((c: any) => c.Field === 'id');
        if (idCol && String(idCol.Type).toLowerCase().includes('int')) {
          // Legacy table detected, drop it to recreate with clean VARCHAR(36)
          await db.execute('DROP TABLE database_tables');
        } else {
          // Auto patch for updated schema
          try {
            await db.execute('ALTER TABLE database_tables ADD COLUMN display_name VARCHAR(255)');
          } catch {}
          try {
            await db.execute('ALTER TABLE database_tables ADD COLUMN connection_config TEXT');
          } catch {}
          return true;
        }
      }

      // Check if old table exists for migration
      const oldExists: any = await db.execute("SHOW TABLES LIKE 'data_sources'");
      const oldExistsRows = Array.isArray(oldExists) ? oldExists : oldExists.rows || [];
      if (oldExistsRows.length > 0) {
        // Do not rename to preserve old garbage data. Just drop it because we are doing a clean refactor.
        await db.execute('DROP TABLE data_sources');
      }

      // Create new table
      await db.execute(`
                CREATE TABLE database_tables (
                    id VARCHAR(36) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    table_name VARCHAR(255) NOT NULL,
                    display_name VARCHAR(255),
                    description TEXT,
                    is_archived TINYINT DEFAULT 0,
                    connection_config TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
      return true;
    } catch (e: any) {
      console.error('[SCHEMA] Table init failed:', e.message);
      return false;
    }
  };

  // Middleware guard
  router.use('*', async (c, next) => {
    if (!getDb(c)) {
      return c.json(
        {
          status: 'error',
          message:
            'Target database connection not established. Make sure x-target-id header is provided.',
        },
        400,
      );
    }
    await checkAndCreateTable(c);
    await next();
  });

  const q = async (c: any, sql: string, params: any[] = []) => {
    const res: any = await getDb(c).execute(sql, params);
    return Array.isArray(res) ? res : res.rows || [];
  };

  const handleQueryError = (e: any) => {
    return { status: 'error', message: e.message };
  };

  // Database Schema CRUD
  router.get('/', async (c) => {
    try {
      const data = await q(
        c,
        'SELECT * FROM database_tables WHERE is_archived = 0 ORDER BY created_at DESC',
      );
      return c.json({ status: 'success', data });
    } catch (e: any) {
      return c.json({ status: 'success', data: [] }); // Safe fallback
    }
  });

  router.get('/stats', async (c) => {
    try {
      const totalRes = await q(c, 'SELECT COUNT(*) as total FROM database_tables');
      const activeRes = await q(
        c,
        'SELECT COUNT(*) as active FROM database_tables WHERE is_archived = 0',
      );
      return c.json({
        status: 'success',
        data: {
          total: Number(totalRes[0]?.total || totalRes[0]?.['COUNT(*)'] || 0),
          active: Number(activeRes[0]?.active || activeRes[0]?.['COUNT(*)'] || 0),
        },
      });
    } catch (e: any) {
      return c.json({ status: 'success', data: { total: 0, active: 0 } });
    }
  });

  router.get('/templates', async (c) => {
    // Return an empty array so the frontend falls back to default templates without throwing 404
    return c.json({ status: 'success', data: [] });
  });

  router.post('/validate', async (c) => {
    try {
      const body = await c.req.json();
      const tableName = body.table_name || body.tableName || '';
      const errors: string[] = [];

      // Sanitation (matches frontend logic)
      const sanitized = tableName.toLowerCase().replace(/[^a-z0-9_]/g, '');
      const finalName = `usr_${sanitized}`;
      
      if (!tableName) {
        errors.push('Table name is required');
      } else {
        if (tableName.includes(' ')) errors.push('Table name cannot contain spaces');
        
        // CHECK AVAILABILITY IN TARGET DB
        try {
          const db = getDb(c);
          // Standard check for MySQL/MariaDB/TiDB
          const exists: any = await db.execute(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?", 
            [finalName]
          );
          const existsRows = Array.isArray(exists) ? exists : exists.rows || [];
          if (existsRows.length > 0) {
            errors.push(`Table name '${finalName}' is already taken in the target database`);
          }
        } catch (dbErr: any) {
          console.error('[VALIDATE-DB] Check failed:', dbErr.message);
        }
      }

      return c.json({
        status: 'success',
        data: {
          valid: errors.length === 0,
          sanitizedTableName: sanitized,
          errors: errors.length > 0 ? errors : undefined,
        }
      });
    } catch (e: any) {
      return c.json({ status: 'error', message: e.message }, 500);
    }
  });

  const handleCreate = async (c: any) => {
    try {
      const body = await c.req.json();
      const id = crypto.randomUUID();
      const tableName = body.tableName || body.table_name || body.name;
      const displayName = body.name || body.display_name || tableName;

      // Generate DDL to create physical table
      if (body.schema && Array.isArray(body.schema.columns)) {
        let ddl = `CREATE TABLE ${tableName} (id VARCHAR(36) PRIMARY KEY, `;
        for (const col of body.schema.columns) {
          let sqlT = 'VARCHAR(255)';
          if (col.type === 'integer' || col.type === 'number') sqlT = 'INT';
          if (col.type === 'decimal' || col.type === 'float') sqlT = 'DECIMAL(10,2)';
          if (col.type === 'text' || col.type === 'longtext') sqlT = 'TEXT';
          if (col.type === 'json' || col.type === 'jsonb') sqlT = 'JSON';
          if (col.type === 'boolean') sqlT = 'TINYINT(1)';
          if (col.type === 'datetime') sqlT = 'DATETIME';
          if (col.type === 'date') sqlT = 'DATE';
          if (col.type === 'status') sqlT = 'VARCHAR(50)';

          ddl += `${col.name} ${sqlT} ${col.required ? 'NOT NULL' : ''}, `;
        }

        if (body.schema.timestamps !== false) {
          ddl += `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `;
        }
        if (body.schema.softDelete || body.schema.soft_delete) {
          ddl += `is_archived TINYINT DEFAULT 0, `;
        }
        ddl = ddl.slice(0, -2) + `);`;

        await q(c, ddl);
      }

      await q(
        c,
        `INSERT INTO database_tables (id, name, table_name, display_name, description, connection_config)
                        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          displayName,
          tableName,
          displayName,
          body.description || '',
          JSON.stringify(body.connection_config || {}),
        ],
      );
      return c.json({ status: 'success', data: { id } });
    } catch (e: any) {
      return c.json({ status: 'error', message: e.message }, 500);
    }
  };

  router.post('/', handleCreate);
  router.post('/save', handleCreate);

  router.get('/:id', async (c) => {
    try {
      const rows = await q(c, 'SELECT * FROM database_tables WHERE id = ?', [c.req.param('id')]);
      return rows.length
        ? c.json({ status: 'success', data: rows[0] })
        : c.json({ status: 'error', message: 'Not found' }, 404);
    } catch (e: any) {
      return c.json(handleQueryError(e), 500);
    }
  });

  return router as any;
}
