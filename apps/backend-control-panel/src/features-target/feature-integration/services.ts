/**
 * services.ts
 * Lapisan untuk introspeksi database target dan membuat dokumentasi.
 * Reload: 2026-04-11T18:56:00
 */

import { TARGET_TABLES, SYSTEM_CORE_ROUTES } from "./constants";

function escapeSqlValue(val: any): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number" || typeof val === "bigint") return String(val);
  if (typeof val === "boolean") return val ? "1" : "0";
  const str = String(val);
  const escaped = str.replace(/[\0\b\n\r\t\x1a\\"']/g, (ch: string) => {
    switch (ch) {
      case "'": return "\\'";
      case '"': return '\\"';
      case "\\": return "\\\\";
      case "\n": return "\\n";
      case "\r": return "\\r";
      case "\t": return "\\t";
      case "\0": return "\\0";
      case "\b": return "\\b";
      case "\x1a": return "\\Z";
      default: return "";
    }
  });
  return `'${escaped}'`;
}

export const queryHelper = async (db: any, sql: string, params: any[] = []) => {
  let finalSql = sql;
  if (params.length > 0) {
    let index = 0;
    finalSql = sql.replace(/\?/g, () => {
      if (index >= params.length) return "?";
      return escapeSqlValue(params[index++]);
    });
  }

  try {
    const res: any = await db.execute(finalSql);
    if (Array.isArray(res)) {
      return res;
    }
    return res.rows || [];
  } catch (error: any) {
    // Ignore error if table not found
    return [];
  }
};

export const IntegrationService = {
  getFullDocumentation: async (db: any, baseUrl: string) => {
    // 1. Gather static/core routes
    const coreRoutes = await queryHelper(db, "SELECT * FROM " + TARGET_TABLES.CORE_ROUTES + "");
    
    // 2. Gather dynamic routes
    const dynamicRoutes = await queryHelper(db, "SELECT * FROM " + TARGET_TABLES.ENDPOINTS + " WHERE is_active = 1");
    
    // 3. Gather categories
    const categories = await queryHelper(db, "SELECT * FROM " + TARGET_TABLES.CATEGORIES + "");
    
    // 4. Gather error templates
    const errorTemplates = await queryHelper(db, "SELECT * FROM " + TARGET_TABLES.ERROR_TEMPLATES + "");
    
    // 5. Gather data sources
    const dataSources = await queryHelper(db, "SELECT * FROM " + TARGET_TABLES.DATA_SOURCES + "");
    
    // 6. Introspect Table Schemas
    const schemas: any = {};
    for (const ds of dataSources) {
       try {
           const cols = await queryHelper(db, "DESCRIBE `" + ds.table_name + "`");
           schemas[ds.id] = cols;
       } catch (err) {
           schemas[ds.id] = [];
       }
    }
    
    // 7. Roles & Permissions (Safe check)
    let roles = [];
    let apiKeys = [];
    try {
        roles = await queryHelper(db, "SELECT id, name, display_name, level FROM " + TARGET_TABLES.ROLES + "");
        apiKeys = await queryHelper(db, "SELECT id, name, is_active FROM " + TARGET_TABLES.API_KEYS + " WHERE is_active = 1");
    } catch {
        // Tables might not exist initially, safe fallback
    }

    const normalizePath = (p: string, isDynamic = false) => {
        let clean = p || '';
        // Strip existing /api/ if present
        if (clean.startsWith('/api/')) clean = clean.substring(4);
        
        // Strip leading v1 if already there to prevent /v1/v1
        if (isDynamic && clean.startsWith('/v1/')) clean = clean.substring(3);
        if (isDynamic && clean.startsWith('v1/')) clean = clean.substring(3);

        // Ensure leading slash
        if (!clean.startsWith('/')) clean = '/' + clean;

        // Add v1 for dynamic routes
        if (isDynamic) {
            clean = '/v1' + clean;
        }

        return clean;
    };

    const normalizedCoreFromDb = coreRoutes.map((r: any) => ({
        ...r,
        route_path: normalizePath(r.route_path || r.endpoint, false)
    }));

    const normalizedDynamic = dynamicRoutes.map((r: any) => ({
        ...r,
        route_path: normalizePath(r.route_path || r.endpoint, true)
    }));

    const allStatic = [
        ...SYSTEM_CORE_ROUTES,
        ...normalizedCoreFromDb.filter((cr: any) => !SYSTEM_CORE_ROUTES.some(sr => sr.route_path === cr.route_path))
    ];

    return {
        meta: {
            generatedAt: new Date().toISOString(),
            baseUrl: baseUrl || 'https://api.example.com'
        },
        authentication: {
            method: 'Bearer Token OR API Key',
            headerName: 'x-api-key',
            roles,
            apiKeys
        },
        routes: {
            static: allStatic,
            dynamic: normalizedDynamic
        },
        categories,
        errorTemplates,
        dataSources,
        schemas
    };
  }
};
