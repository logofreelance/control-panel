/**
 * services.ts
 * Lapisan abstraksi database untuk mengeksekusi kueri mentah
 * ke database target (Dynamic DB).
 */

import { TARGET_TABLES, DEFAULT_VALUES, SYSTEM_AUTH_ROUTES } from "./constants";

// Escape a value for safe SQL interpolation (matches TiDB driver's escape logic)
function escapeSqlValue(val: any): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number" || typeof val === "bigint") return String(val);
  if (typeof val === "boolean") return val ? "1" : "0";
  const str = String(val);
  const escaped = str.replace(/[\0\b\n\r\t\x1a\\"']/g, (ch: string) => {
    switch (ch) {
      case "'":
        return "\\'";
      case '"':
        return '\\"';
      case "\\":
        return "\\\\";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case "\t":
        return "\\t";
      case "\0":
        return "\\0";
      case "\b":
        return "\\b";
      case "\x1a":
        return "\\Z";
      default:
        return "";
    }
  });
  return `'${escaped}'`;
}

export const queryHelper = async (db: any, sql: string, params: any[] = []) => {
  // Interpolate params into SQL manually, then execute without params.
  // This avoids TiDB Cloud HTTP API issues with ? placeholders.
  let finalSql = sql;
  if (params.length > 0) {
    let index = 0;
    finalSql = sql.replace(/\?/g, () => {
      if (index >= params.length) return "?";
      return escapeSqlValue(params[index++]);
    });
  }

  try {
    console.log("[QUERY HELPER] Final SQL:", finalSql);

    // Execute WITHOUT params — no ? reaches TiDB server
    const res: any = await db.execute(finalSql);

    if (Array.isArray(res)) {
      return res;
    }
    return res.rows || [];
  } catch (error: any) {
    console.error(
      "[QUERY HELPER ERROR]",
      error.message,
      "Final SQL:",
      finalSql,
    );
    throw error;
  }
};

async function checkAndCreateTableIfNotExists(
  db: any,
  tableName: string,
): Promise<boolean> {
  try {
    const columns: any = await queryHelper(db, `DESCRIBE \`${tableName}\``).catch(() => []);
    if (columns.length > 0) {
      // Verify schema: check if 'id' column is VARCHAR(36)
      const idCol = columns.find((c: any) => (c.Field || c.column_name) === "id");
      if (idCol && idCol.Type && !idCol.Type.toLowerCase().includes("varchar")) {
        console.log(`[DB] Table ${tableName} has wrong id type: ${idCol.Type}, recreating...`);
        await queryHelper(db, `DROP TABLE \`${tableName}\``);
        // Fall through to create
      } else {
        return true;
      }
    }

    // Create table based on table name
    let createSql = "";
    switch (tableName) {
      case TARGET_TABLES.CATEGORIES:
        createSql = `
            CREATE TABLE \`${tableName}\` (
                \`id\` VARCHAR(36) PRIMARY KEY,
                \`name\` VARCHAR(255) NOT NULL UNIQUE,
                \`description\` TEXT,
                \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        break;
      case TARGET_TABLES.ENDPOINTS:
        createSql = `
            CREATE TABLE \`${tableName}\` (
                \`id\` VARCHAR(36) PRIMARY KEY,
                \`endpoint\` VARCHAR(255) NOT NULL,
                \`method\` VARCHAR(10) NOT NULL DEFAULT 'GET',
                \`handler_type\` VARCHAR(50) NOT NULL DEFAULT 'proxy',
                \`handler_config\` TEXT,
                \`category_id\` VARCHAR(36),
                \`is_active\` TINYINT NOT NULL DEFAULT 1,
                \`description\` TEXT,
                \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        break;
      case TARGET_TABLES.CORE_ROUTES:
        createSql = `
            CREATE TABLE \`${tableName}\` (
                \`id\` VARCHAR(36) PRIMARY KEY,
                \`route_path\` VARCHAR(255) NOT NULL,
                \`method\` VARCHAR(10) NOT NULL DEFAULT 'GET',
                \`handler\` TEXT NOT NULL,
                \`description\` TEXT,
                \`metadata\` TEXT,
                \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        break;
      case TARGET_TABLES.LOGS:
        createSql = `
            CREATE TABLE \`${tableName}\` (
                \`id\` VARCHAR(36) PRIMARY KEY,
                \`log_type\` VARCHAR(50) NOT NULL,
                \`message\` TEXT NOT NULL,
                \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        break;
      case TARGET_TABLES.ERROR_TEMPLATES:
        createSql = `
            CREATE TABLE \`${tableName}\` (
                \`id\` VARCHAR(36) PRIMARY KEY,
                \`status_code\` INT NOT NULL DEFAULT 400,
                \`title\` VARCHAR(255) NOT NULL DEFAULT 'Error',
                \`message_template\` TEXT,
                \`response_format\` VARCHAR(20) NOT NULL DEFAULT 'json',
                \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        break;
      default:
        console.error(`[DB] Unknown table: ${tableName}`);
        return false;
    }

    await queryHelper(db, createSql);
    console.log(`[DB] Created table ${tableName}`);

    // SEEDING: If this is CORE_ROUTES, insert default system routes
    if (tableName === TARGET_TABLES.CORE_ROUTES) {
      console.log(`[DB] Seeding ${tableName} with default auth routes...`);
      for (const route of SYSTEM_AUTH_ROUTES) {
        await queryHelper(
          db,
          `INSERT INTO \`${tableName}\` (id, route_path, method, handler, description, metadata) VALUES (?, ?, ?, ?, ?, ?)`,
          [route.id, route.path, route.method, route.handler, route.description, (route as any).metadata || null],
        ).catch((err) => console.warn(`[DB] Failed to seed route ${route.path}:`, err.message));
      }
    }

    return true;
  } catch (error: any) {
    console.error(`[DB] Failed to create table ${tableName}:`, error.message);
    return false;
  }
}

export const CategoryService = {
  getAll: async (db: any) => {
    await checkAndCreateTableIfNotExists(db, TARGET_TABLES.CATEGORIES);
    const rows = await queryHelper(
      db,
      `SELECT * FROM ${TARGET_TABLES.CATEGORIES} ORDER BY created_at DESC`,
    );
    return rows;
  },
  create: async (db: any, id: string, name: string, description: string) => {
    if (!name || name.trim().length === 0 || name.trim().length > 100) {
      throw new Error("Category name is required and must be 1-100 characters");
    }

    const tableOk = await checkAndCreateTableIfNotExists(
      db,
      TARGET_TABLES.CATEGORIES,
    );
    if (!tableOk) {
      throw new Error(
        `Failed to ensure table ${TARGET_TABLES.CATEGORIES} exists`,
      );
    }

    return queryHelper(
      db,
      `INSERT INTO ${TARGET_TABLES.CATEGORIES} (id, name, description) VALUES (?, ?, ?)`,
      [id, name.trim(), description || ""],
    );
  },
  update: async (db: any, id: string, name: string, description: string) => {
    if (!name || name.trim().length === 0 || name.trim().length > 100) {
      throw new Error("Category name is required and must be 1-100 characters");
    }

    const tableOk = await checkAndCreateTableIfNotExists(
      db,
      TARGET_TABLES.CATEGORIES,
    );
    if (!tableOk) {
      throw new Error(
        `Failed to ensure table ${TARGET_TABLES.CATEGORIES} exists`,
      );
    }

    return queryHelper(
      db,
      `UPDATE ${TARGET_TABLES.CATEGORIES} SET name = ?, description = ? WHERE id = ?`,
      [name.trim(), description || "", id],
    );
  },
  delete: async (db: any, id: string) => {
    const tableOk = await checkAndCreateTableIfNotExists(
      db,
      TARGET_TABLES.CATEGORIES,
    );
    if (!tableOk) {
      throw new Error(`Failed to access table ${TARGET_TABLES.CATEGORIES}`);
    }
    return queryHelper(
      db,
      `DELETE FROM ${TARGET_TABLES.CATEGORIES} WHERE id = ?`,
      [id],
    );
  },
};

export const EndpointService = {
  getAll: async (db: any) => {
    await checkAndCreateTableIfNotExists(db, TARGET_TABLES.ENDPOINTS);
    const rows = await queryHelper(
      db,
      `SELECT * FROM ${TARGET_TABLES.ENDPOINTS} ORDER BY created_at DESC`,
    );
    return rows.map((row: any) => {
      let config = {};
      try { if(row.handler_config) config = JSON.parse(row.handler_config); } catch {}
      return { ...config, ...row, path: row.endpoint, categoryId: row.category_id, isActive: row.is_active === 1 };
    });
  },
  getStats: async (db: any) => {
    await checkAndCreateTableIfNotExists(db, TARGET_TABLES.ENDPOINTS);
    const total = await queryHelper(
      db,
      `SELECT COUNT(*) as total FROM ${TARGET_TABLES.ENDPOINTS}`,
    );
    const active = await queryHelper(
      db,
      `SELECT COUNT(*) as active FROM ${TARGET_TABLES.ENDPOINTS} WHERE is_active = ?`,
      [DEFAULT_VALUES.IS_ACTIVE],
    );
    return { total: total[0]?.total || 0, active: active[0]?.active || 0 };
  },
  getById: async (db: any, id: string) => {
    await checkAndCreateTableIfNotExists(db, TARGET_TABLES.ENDPOINTS);
    const rows = await queryHelper(
      db,
      `SELECT * FROM ${TARGET_TABLES.ENDPOINTS} WHERE id = ?`,
      [id],
    );
    if (!rows.length) return null;
    const row = rows[0];
    let config = {};
    try { if(row.handler_config) config = JSON.parse(row.handler_config); } catch {}
    return { ...config, ...row, path: row.endpoint, categoryId: row.category_id, isActive: row.is_active === 1 };
  },
  create: async (db: any, id: string, body: any) => {
    const tableOk = await checkAndCreateTableIfNotExists(
      db,
      TARGET_TABLES.ENDPOINTS,
    );
    if (!tableOk) {
      throw new Error(
        `Failed to ensure table ${TARGET_TABLES.ENDPOINTS} exists`,
      );
    }
    const endpoint = body.path || body.endpoint;
    const method = body.method || 'GET';
    const category_id = body.categoryId || body.category_id || null;
    const is_active = body.isActive ?? body.is_active ?? 1;
    const description = body.description || "";
    const handler_type = body.handlerType || body.handler_type || 'proxy';
    
    // Store everything else in handler_config so we don't lose data
    const handler_config = JSON.stringify(body.handler_config || body);

    return queryHelper(
      db,
      `INSERT INTO ${TARGET_TABLES.ENDPOINTS} 
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
      [
        id, endpoint, method, handler_type, handler_config, category_id, is_active ? 1 : 0, description
      ]
    );
  },
  delete: async (db: any, id: string) =>
    queryHelper(db, `DELETE FROM ${TARGET_TABLES.ENDPOINTS} WHERE id = ?`, [
      id,
    ]),
  toggleActive: async (db: any, id: string, is_active: boolean) =>
    queryHelper(
      db,
      `UPDATE ${TARGET_TABLES.ENDPOINTS} SET is_active = ? WHERE id = ?`,
      [is_active ? 1 : 0, id],
    ),
};

export const CoreRouteService = {
  getAll: async (db: any) => {
    console.log("[CORE ROUTE SERVICE] getAll called");
    const tableOk = await checkAndCreateTableIfNotExists(db, TARGET_TABLES.CORE_ROUTES);
    if (!tableOk) {
      console.error("[CORE ROUTE SERVICE] Failed to ensure table exists");
      throw new Error(`Table ${TARGET_TABLES.CORE_ROUTES} could not be verified`);
    }

    // Secondary check: if table is empty, seed it
    const existing = await queryHelper(db, `SELECT COUNT(*) as cnt FROM \`${TARGET_TABLES.CORE_ROUTES}\``);
    const count = Number(existing[0]?.cnt || 0);
    console.log(`[CORE ROUTE SERVICE] Table ${TARGET_TABLES.CORE_ROUTES} has ${count} records`);
    
    // Proactive schema check: ensure metadata column exists
    await queryHelper(db, `ALTER TABLE \`${TARGET_TABLES.CORE_ROUTES}\` ADD COLUMN IF NOT EXISTS \`metadata\` TEXT`).catch(() => {});

    // ALWAYS ensure system routes are up to date with latest metadata
    console.log("[CORE ROUTE SERVICE] Syncing system routes metadata...");
    for (const route of SYSTEM_AUTH_ROUTES) {
        await queryHelper(
            db,
            `INSERT INTO \`${TARGET_TABLES.CORE_ROUTES}\` (id, route_path, method, handler, description, metadata) 
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
             route_path = VALUES(route_path),
             method = VALUES(method),
             handler = VALUES(handler),
             description = VALUES(description),
             metadata = VALUES(metadata)`,
            [route.id, route.path, route.method, route.handler, route.description, (route as any).metadata || null],
        ).catch((err) => console.warn(`[DB] Failed to update route ${route.path}:`, err.message));
    }

    const routes = await queryHelper(
      db,
      `SELECT id, route_path as path, method, handler, description, metadata, created_at FROM \`${TARGET_TABLES.CORE_ROUTES}\``,
    );
    console.log(`[CORE ROUTE SERVICE] Returning ${routes.length} routes`);
    return routes;
  },
};

export const LogService = {
  getRecent: async (db: any, limit = 100) => {
    await checkAndCreateTableIfNotExists(db, TARGET_TABLES.LOGS);
    return queryHelper(
      db,
      `SELECT * FROM ${TARGET_TABLES.LOGS} ORDER BY created_at DESC LIMIT ${limit}`,
    );
  },
};

export const ErrorTemplateService = {
  getAll: async (db: any) => {
    await checkAndCreateTableIfNotExists(db, TARGET_TABLES.ERROR_TEMPLATES);
    return queryHelper(
      db,
      `SELECT * FROM ${TARGET_TABLES.ERROR_TEMPLATES} ORDER BY created_at DESC`,
    );
  },
  create: async (db: any, id: string, body: any) => {
    const tableOk = await checkAndCreateTableIfNotExists(
      db,
      TARGET_TABLES.ERROR_TEMPLATES,
    );
    if (!tableOk) {
      throw new Error(
        `Failed to ensure table ${TARGET_TABLES.ERROR_TEMPLATES} exists`,
      );
    }
    return queryHelper(
      db,
      `INSERT INTO ${TARGET_TABLES.ERROR_TEMPLATES} (id, status_code, title, message_template, response_format) VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        body.statusCode || body.status_code || DEFAULT_VALUES.STATUS_CODE,
        body.title || "Error",
        body.messageTemplate || body.template || body.message_template || "",
        body.responseFormat || body.response_format || DEFAULT_VALUES.RESPONSE_FORMAT,
      ],
    );
  },
  delete: async (db: any, id: string) =>
    queryHelper(
      db,
      `DELETE FROM ${TARGET_TABLES.ERROR_TEMPLATES} WHERE id = ?`,
      [id],
    ),
};
