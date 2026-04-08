import { randomUUID } from 'node:crypto';
import { TABLES } from './constants';

/**
 * Escapes a value for safe SQL interpolation.
 * Required for TiDB Serverless HTTP driver which doesn't support ? placeholders perfectly.
 */
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

/**
 * Helper to execute SQL with manual parameter interpolation.
 */
async function queryHelper(db: any, sql: string, params: any[] = []) {
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
        return Array.isArray(res) ? res : (res.rows || []);
    } catch (e: any) {
        console.error(`[QUERY HELPER ERROR]`, e.message);
        throw e;
    }
}

/**
 * Ensures the target table exists in the target database with the correct schema.
 */
async function ensureTableExists(db: any) {
    const tableName = TABLES.CORS_DOMAINS;
    try {
        // DESCRIBE is safer as it targets the current connected database context
        const rows = await queryHelper(db, `DESCRIBE \`${tableName}\``).catch(() => []);
        
        if (rows.length > 0) {
            // Verify schema: check if 'domain_url' column exists
            const hasDomainUrl = rows.some((r: any) => 
                (r.Field === 'domain_url' || r.field === 'domain_url' || r.COLUMN_NAME === 'domain_url')
            );
            
            if (hasDomainUrl) return true;

            // Missing domain_url - need to recreate or alter. Recreate is safer for this module.
            await queryHelper(db, `DROP TABLE \`${tableName}\``);
        }

        const createSql = `
            CREATE TABLE \`${tableName}\` (
                \`id\` VARCHAR(36) PRIMARY KEY,
                \`domain_url\` VARCHAR(255) NOT NULL UNIQUE,
                \`description\` TEXT,
                \`is_active\` TINYINT NOT NULL DEFAULT 1,
                \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        await queryHelper(db, createSql);
        return true;
    } catch (e: any) {
        console.error(`[CORS SERVICE] Failed to ensure table ${tableName}:`, e.message);
        throw e;
    }
}

export const CorsService = {
    getAll: async (db: any) => {
        await ensureTableExists(db);
        return queryHelper(db, `SELECT * FROM ${TABLES.CORS_DOMAINS} ORDER BY created_at DESC`);
    },
    
    create: async (db: any, domainUrl: string, description: string) => {
        await ensureTableExists(db);
        const id = randomUUID();
        await queryHelper(db,
            `INSERT INTO \`${TABLES.CORS_DOMAINS}\` (\`id\`, \`domain_url\`, \`description\`) VALUES (?, ?, ?)`,
            [id, domainUrl, description || '']
        );
        return { id, domain_url: domainUrl, description };
    },
    
    toggleActive: async (db: any, id: string, isActive: boolean) => {
        await ensureTableExists(db);
        return queryHelper(db, `UPDATE ${TABLES.CORS_DOMAINS} SET is_active = ? WHERE id = ?`, [isActive ? 1 : 0, id]);
    },
    
    delete: async (db: any, id: string) => {
        await ensureTableExists(db);
        return queryHelper(db, `DELETE FROM ${TABLES.CORS_DOMAINS} WHERE id = ?`, [id]);
    }
};
