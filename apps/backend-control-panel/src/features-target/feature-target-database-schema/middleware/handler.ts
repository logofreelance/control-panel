/**
 * middleware/handler.ts
 *
 * ALUR: Cookie/Header → Validate session → Resolve target DB → Ensure metadata tables → next()
 *
 * Satu-satunya file yang di-share ke semua route via router.use('*', ...)
 */
import { buildInternalDatabaseConnection } from '../../../features-internal/internal.db';
import { buildTargetDatabaseConnection } from '../../target.db';

import type { EnvironmentConfig } from '../../../env';

export function middleware(env: EnvironmentConfig) {
  return async (c: any, next: any) => {
    // Step 1: Session Validation
    try {
      if (!env.DATABASE_URL_INTERNAL_CONTROL_PANEL) throw new Error('INTERNAL DB URL MISSING');
      const internalDb = buildInternalDatabaseConnection(env.DATABASE_URL_INTERNAL_CONTROL_PANEL);
      
      const { Lucia } = await import('lucia');
      const authAdapter = {
          async deleteSession(sessionId: string): Promise<void> { await internalDb.execute('DELETE FROM admin_sessions WHERE id = ?', [sessionId]); },
          async deleteUserSessions(userId: string): Promise<void> { await internalDb.execute('DELETE FROM admin_sessions WHERE user_id = ?', [userId]); },
          async getSessionAndUser(sessionId: string): Promise<[any, any]> {
              const resSession: any = await internalDb.execute('SELECT * FROM admin_sessions WHERE id = ?', [sessionId]);
              const sessionRows = Array.isArray(resSession) ? resSession : resSession.rows;
              if (!sessionRows || sessionRows.length === 0) return [null, null];
              const session = sessionRows[0];
              const resUser: any = await internalDb.execute('SELECT id, username, role FROM admin_users WHERE id = ?', [session.user_id]);
              const userRows = Array.isArray(resUser) ? resUser : resUser.rows;
              if (!userRows || userRows.length === 0) return [null, null];
              const user = userRows[0];
              return [{ id: session.id, userId: session.user_id, expiresAt: new Date(session.expires_at) }, { id: user.id, username: user.username, role: user.role }];
          },
          async getTargetSessions(userId: string): Promise<any[]> { return []; },
          async setSession(session: any): Promise<void> {
              const expiresAt = session.expiresAt.toISOString().slice(0, 19).replace('T', ' ');
              await internalDb.execute('INSERT INTO admin_sessions (id, user_id, expires_at) VALUES (?, ?, ?)', [session.id, session.userId, expiresAt]);
          },
          async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
              const expiresAtStr = expiresAt.toISOString().slice(0, 19).replace('T', ' ');
              await internalDb.execute('UPDATE admin_sessions SET expires_at = ? WHERE id = ?', [expiresAtStr, sessionId]);
          },
          async deleteExpiredSessions(): Promise<void> {}
      };
      const lucia = new Lucia(authAdapter as any, {
          sessionCookie: { attributes: { secure: env.NODE_ENV === 'production', sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax' } },
          getUserAttributes: (attributes: any) => ({ username: attributes?.username ?? '', role: attributes?.role ?? '' })
      });

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
        const res: any = await internalDb.execute('SELECT database_url FROM target_systems WHERE id = ? LIMIT 1', [targetId]);
        const rows = Array.isArray(res) ? res : (res.rows || []);
        const target = rows.length > 0 ? rows[0] : null;

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

// Helper: TiDB serverless driver returns [rows, fields] tuple from db.execute()
// This normalizes the result to always return the rows array.
function extractRows(result: any): any[] {
  if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) {
    return result[0]; // [rows, fields] tuple → rows
  }
  if (Array.isArray(result)) return result;
  return result?.rows || [];
}

async function ensureMetadataTables(db: any) {
  // --- database_tables ---
  const exists: any = await db.execute("SHOW TABLES LIKE 'database_tables'");
  const existsRows = extractRows(exists);
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
  const relationsExistRows = extractRows(relationsExist);
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

  // --- database_resources ---
  const resourcesExist: any = await db.execute("SHOW TABLES LIKE 'database_resources'");
  const resourcesExistRows = extractRows(resourcesExist);
  if (resourcesExistRows.length > 0) {
    // Check for old column name and migrate if needed
    try {
      const columns: any = await db.execute("DESCRIBE database_resources");
      const columnRows = extractRows(columns);
      const hasOldId = columnRows.some((c: any) => c.Field === 'DatabaseTableId');
      const hasNewId = columnRows.some((c: any) => c.Field === 'database_table_id');
      console.log('[MIGRATION CHECK] hasOldId:', hasOldId, 'hasNewId:', hasNewId, 'columnCount:', columnRows.length);
      if (hasOldId && !hasNewId) {
        console.log('[MIGRATION] Renaming DatabaseTableId to database_table_id in database_resources');
        await db.execute("ALTER TABLE database_resources CHANGE DatabaseTableId database_table_id VARCHAR(36)");
        console.log('[MIGRATION] Successfully renamed column.');
      }
    } catch (e) {
      console.error('[MIGRATION ERROR] Failed to check/migrate database_resources columns:', e);
    }
  }

  if (resourcesExistRows.length === 0) {
    await db.execute(`
      CREATE TABLE database_resources (
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
