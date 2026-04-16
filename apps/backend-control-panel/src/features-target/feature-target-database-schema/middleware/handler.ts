/**
 * middleware/handler.ts
 *
 * ALUR: Cookie/Header → Validate session → Resolve target DB → Ensure metadata tables → next()
 *
 * Satu-satunya file yang di-share ke semua route via router.use('*', ...)
 */
import { buildInternalDatabaseConnection } from '../../../features-internal/internal.db';
import { buildTargetDatabaseConnection } from '../../target.db';
import { findTargetSystemById } from '../../../features-internal/feature-target-registry/target-registry.repository';
import { buildAuthPanelLucia } from '../../../features-internal/feature-auth/auth.lucia';
import type { EnvironmentConfig } from '../../../env';

export function middleware(env: EnvironmentConfig) {
  return async (c: any, next: any) => {
    // Step 1: Session Validation
    try {
      if (!env.DATABASE_URL_INTERNAL_CONTROL_PANEL) throw new Error('INTERNAL DB URL MISSING');
      const internalDb = buildInternalDatabaseConnection(env.DATABASE_URL_INTERNAL_CONTROL_PANEL);
      const lucia = buildAuthPanelLucia(internalDb);

      const sessionId = lucia.readSessionCookie(c.req.header('Cookie') ?? "")
                     ?? lucia.readBearerToken(c.req.header('Authorization') ?? "");

      if (sessionId) {
        const { session, user } = await lucia.validateSession(sessionId);
        c.set('session', session);
        c.set('user', user);
      }
    } catch (err) {
      console.error('[DB-SCHEMA-AUTH-ERROR]', err);
    }

    // Step 2: Target System Resolution
    const targetId = c.req.header('x-target-id');
    if (targetId && !c.get('targetDb')) {
      try {
        const internalDb = buildInternalDatabaseConnection(env.DATABASE_URL_INTERNAL_CONTROL_PANEL);
        const target = await findTargetSystemById(internalDb, targetId);

        if (target) {
          const targetDb = buildTargetDatabaseConnection(target.database_url);
          c.set('targetDb', targetDb);
          c.set('targetId', targetId);
        }
      } catch (err) {
        console.error('[DB-SCHEMA-TARGET-ERROR]', err);
      }
    }

    // Step 3: Guard
    if (!c.get('targetDb')) {
      return c.json({ status: 'error', message: 'Target database connection not established.' }, 400);
    }

    // Step 4: Ensure metadata tables exist
    await ensureMetadataTables(c.get('targetDb'));

    await next();
  };
}

async function ensureMetadataTables(db: any) {
  // --- database_tables ---
  const exists: any = await db.execute("SHOW TABLES LIKE 'database_tables'");
  const existsRows = Array.isArray(exists) ? exists : exists.rows || [];
  if (existsRows.length === 0) {
    await db.execute(`
      CREATE TABLE database_tables (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        table_name VARCHAR(255) NOT NULL,
        display_name VARCHAR(255),
        description TEXT,
        schema_json TEXT,
        is_archived TINYINT DEFAULT 0,
        connection_config TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  } else {
    try {
      await db.execute("ALTER TABLE database_tables ADD COLUMN schema_json TEXT AFTER description");
    } catch (e) {
      // Column already exists
    }
  }

  // --- database_relations ---
  const relationsExist: any = await db.execute("SHOW TABLES LIKE 'database_relations'");
  const relationsExistRows = Array.isArray(relationsExist) ? relationsExist : relationsExist.rows || [];
  if (relationsExistRows.length === 0) {
    await db.execute(`
      CREATE TABLE database_relations (
        id VARCHAR(36) PRIMARY KEY,
        source_id VARCHAR(36) NOT NULL,
        target_id VARCHAR(36) NOT NULL,
        relation_type VARCHAR(50) NOT NULL,
        local_key VARCHAR(255),
        foreign_key VARCHAR(255),
        pivot_table VARCHAR(255),
        alias VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_source (source_id),
        INDEX idx_target (target_id)
      )
    `);
  }
}
