import { sql } from '@modular/database';
import { createDb, adminUsers, siteSettings } from '@modular/database';
import { ISystemRepository, AdminData, CORE_CONSTANTS, CORE_LABELS } from '@cp/core';

const LOGS = CORE_LABELS.LOGS;
const T = CORE_LABELS.TEMPLATES;

export class DrizzleSystemRepository implements ISystemRepository {

    // SystemRepo is unique: it manages the connection itself for some operations
    // or checks connection validity given a URL.

    // Inject the Factory so the Consumer (Backend) controls the DB capability
    constructor(private dbFactory: typeof createDb) { }

    async createSystemTables(dbUrl: string): Promise<number> {
        const db = this.dbFactory(dbUrl);
        const tables = this.getTableDDLs();
        for (const tableQuery of tables) {
            await db.execute(tableQuery);
        }
        return tables.length;
    }

    private getTableDDLs() {
        return [
            sql`CREATE TABLE IF NOT EXISTS \`databases\` (
                \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                \`name\` varchar(255) NOT NULL,
                \`host\` varchar(255) NOT NULL,
                \`port\` int DEFAULT 4000,
                \`user\` varchar(255) NOT NULL,
                \`password\` text NOT NULL,
                \`db_name\` varchar(255) NOT NULL,
                \`status\` varchar(50) DEFAULT 'healthy',
                \`storage_used\` bigint DEFAULT 0,
                \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB`,

            sql`CREATE TABLE IF NOT EXISTS \`sites\` (
                \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                \`name\` varchar(255) NOT NULL,
                \`url\` varchar(255) NOT NULL UNIQUE,
                \`is_active\` boolean DEFAULT true,
                \`database_id\` BIGINT UNSIGNED,
                \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB`,

            sql`CREATE TABLE IF NOT EXISTS \`admin_users\` (
                \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                \`username\` varchar(255) NOT NULL UNIQUE,
                \`password_hash\` text NOT NULL,
                \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB`,

            sql`CREATE TABLE IF NOT EXISTS \`site_settings\` (
                \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                \`site_name\` varchar(255) DEFAULT 'Modular Engine',
                \`site_title\` varchar(255) DEFAULT 'Dashboard',
                \`meta_description\` text,
                \`favicon_url\` text,
                \`primary_color\` varchar(20) DEFAULT '#059669',
                \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB`,

            sql`CREATE TABLE IF NOT EXISTS \`api_keys\` (
                \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                \`name\` varchar(255) NOT NULL,
                \`key\` varchar(255) NOT NULL UNIQUE,
                \`is_active\` boolean DEFAULT true,
                \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
                \`last_used_at\` timestamp NULL
            ) ENGINE=InnoDB`,

            sql`CREATE TABLE IF NOT EXISTS \`cors_domains\` (
                \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                \`domain\` varchar(255) NOT NULL UNIQUE,
                \`is_active\` boolean DEFAULT true,
                \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB`,

            sql`CREATE TABLE IF NOT EXISTS \`api_logs\` (
                \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                \`api_key_id\` int DEFAULT NULL,
                \`endpoint\` varchar(255) DEFAULT NULL,
                \`method\` varchar(10) DEFAULT NULL,
                \`status_code\` int DEFAULT NULL,
                \`duration_ms\` int DEFAULT NULL,
                \`origin\` varchar(255) DEFAULT NULL,
                \`ip\` varchar(45) DEFAULT NULL,
                \`user_agent\` text,
                \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB`,

            sql`CREATE TABLE IF NOT EXISTS \`api_categories\` (
                \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                \`name\` varchar(255) NOT NULL,
                \`description\` text,
                \`roles\` text,
                \`permissions\` text,
                \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB`,

            sql`CREATE TABLE IF NOT EXISTS \`api_endpoints\` (
                \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                \`category_id\` int DEFAULT NULL,
                \`data_source_id\` int DEFAULT NULL,
                \`path\` varchar(255) NOT NULL,
                \`method\` varchar(10) DEFAULT 'GET',
                \`response_data\` text,
                \`roles\` text,
                \`permissions\` text,
                \`is_active\` boolean DEFAULT true,
                \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB`,

            sql`CREATE TABLE IF NOT EXISTS \`users\` (
                \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                \`username\` varchar(255) NOT NULL UNIQUE,
                \`email\` varchar(255) NOT NULL UNIQUE,
                \`password_hash\` text NOT NULL,
                \`role\` varchar(20) DEFAULT 'user',
                \`is_active\` boolean DEFAULT true,
                \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB`,

            sql`CREATE TABLE IF NOT EXISTS \`permissions\` (
                \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                \`name\` varchar(100) NOT NULL UNIQUE,
                \`group\` varchar(50) DEFAULT NULL,
                \`description\` text,
                \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB`,

            sql`CREATE TABLE IF NOT EXISTS \`user_permissions\` (
                \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                \`user_id\` int NOT NULL,
                \`permission_id\` int NOT NULL,
                \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB`,

            sql`CREATE TABLE IF NOT EXISTS \`data_sources\` (
                \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                \`name\` varchar(255) NOT NULL,
                \`table_name\` varchar(255) NOT NULL,
                \`description\` text,
                \`schema_json\` text,
                \`indexes_json\` text,
                \`constraints_json\` text,
                \`relations_json\` text,
                \`validation_json\` text,
                \`selectable_columns\` text,
                \`filterable_columns\` text,
                \`prefix\` varchar(10) DEFAULT 'usr_',
                \`is_system\` boolean DEFAULT false,
                \`is_archived\` boolean DEFAULT false,
                \`row_count\` int DEFAULT 0,
                \`version\` int DEFAULT 1,
                \`created_by\` int,
                \`updated_by\` int,
                \`archived_at\` timestamp NULL,
                \`is_active\` boolean DEFAULT true,
                \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB`,

            sql`CREATE TABLE IF NOT EXISTS \`data_source_resources\` (
                \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                \`data_source_id\` int NOT NULL,
                \`name\` varchar(100) NOT NULL,
                \`slug\` varchar(100),
                \`description\` text,
                \`fields_json\` text,
                \`filters_json\` text,
                \`joins_json\` text,
                \`aggregates_json\` text,
                \`computed_fields_json\` text,
                \`fields\` text,
                \`filters\` text,
                \`order_by\` varchar(255),
                \`order_direction\` varchar(4) DEFAULT 'DESC',
                \`default_limit\` int DEFAULT 100,
                \`max_limit\` int DEFAULT 1000,
                \`limit\` int DEFAULT 100,
                \`cache_ttl\` int DEFAULT 0,
                \`cache_key\` varchar(255),
                \`is_public\` boolean DEFAULT false,
                \`required_roles\` text,
                \`required_permissions\` text,
                \`is_active\` boolean DEFAULT true,
                \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB`,

            sql`CREATE TABLE IF NOT EXISTS \`data_source_migrations\` (
                \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                \`data_source_id\` int NOT NULL,
                \`version\` int NOT NULL,
                \`action\` varchar(20) NOT NULL,
                \`changes_json\` text NOT NULL,
                \`executed_ddl\` text,
                \`rollback_ddl\` text,
                \`status\` varchar(20) DEFAULT 'PENDING',
                \`error_message\` text,
                \`executed_at\` timestamp NULL,
                \`executed_by\` int,
                \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB`,

            sql`CREATE TABLE IF NOT EXISTS \`data_source_templates\` (
                \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                \`name\` varchar(100) NOT NULL,
                \`description\` text,
                \`category\` varchar(50),
                \`icon\` varchar(10),
                \`schema_json\` text NOT NULL,
                \`sample_data_json\` text,
                \`is_system\` boolean DEFAULT true,
                \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB`
        ];
    }

    async checkConnection(dbUrl: string): Promise<boolean> {
        try {
            const db = this.dbFactory(dbUrl);
            await db.execute(sql`SELECT 1`);
            return true;
        } catch {
            return false;
        }
    }

    async getTablesCount(dbUrl: string): Promise<number> {
        const db = this.dbFactory(dbUrl);
        const tables = await db.execute(sql`
            SELECT COUNT(*) as count FROM information_schema.tables 
            WHERE table_schema = DATABASE()
        `) as unknown as Array<Array<{ count: number }>>;
        return tables[0]?.[0]?.count || 0;
    }

    async hasAdminTable(dbUrl: string): Promise<boolean> {
        try {
            const db = this.dbFactory(dbUrl);
            await db.select().from(adminUsers).limit(0);
            return true;
        } catch {
            return false;
        }
    }

    async hasAdmin(dbUrl: string): Promise<boolean> {
        const db = this.dbFactory(dbUrl);
        const admins = await db.select().from(adminUsers).limit(1);
        return admins.length > 0;
    }

    async createAdmin(dbUrl: string, data: AdminData): Promise<void> {
        const db = this.dbFactory(dbUrl);
        await db.insert(adminUsers).values({
            username: data.username,
            passwordHash: data.passwordHash
        });
    }

    async executeSql(dbUrl: string, sqlString: string): Promise<void> {
        const db = this.dbFactory(dbUrl);
        await db.execute(sql.raw(sqlString));
    }

    async seedRoles(dbUrl: string): Promise<void> {
        const db = this.dbFactory(dbUrl);
        try {
            await db.execute(sql`
                CREATE TABLE IF NOT EXISTS roles (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(50) NOT NULL UNIQUE,
                    display_name VARCHAR(100),
                    description TEXT,
                    level INT DEFAULT 0,
                    is_super BOOLEAN DEFAULT FALSE,
                    permissions TEXT,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            const { SUPER_ADMIN, ADMIN, USER } = CORE_CONSTANTS.DEFAULTS.ROLES;
            await db.execute(sql`INSERT IGNORE INTO roles (name, display_name, level, is_super) VALUES (${SUPER_ADMIN.NAME}, ${SUPER_ADMIN.DISPLAY}, 100, TRUE)`);
            await db.execute(sql`INSERT IGNORE INTO roles (name, display_name, level, is_super) VALUES (${ADMIN.NAME}, ${ADMIN.DISPLAY}, 90, FALSE)`);
            await db.execute(sql`INSERT IGNORE INTO roles (name, display_name, level, is_super) VALUES (${USER.NAME}, ${USER.DISPLAY}, 10, FALSE)`);
        } catch (e) { console.log(LOGS.ROLES_ERROR, e); }
    }

    async seedErrorTemplates(dbUrl: string): Promise<void> {
        const db = this.dbFactory(dbUrl);
        try {
            await db.execute(sql`
                CREATE TABLE IF NOT EXISTS api_error_templates (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    scope VARCHAR(20) DEFAULT 'global',
                    scope_id INT,
                    status_code INT NOT NULL,
                    template TEXT NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            const globalScope = CORE_CONSTANTS.DEFAULTS.SCOPE.GLOBAL;
            await db.execute(sql`INSERT IGNORE INTO api_error_templates (scope, status_code, template) VALUES (${globalScope}, 401, '{"status":"error","code":401,"errorCode":"AUTH_UNAUTHORIZED","message":${T.UNAUTHORIZED}}')`);
            await db.execute(sql`INSERT IGNORE INTO api_error_templates (scope, status_code, template) VALUES (${globalScope}, 403, '{"status":"error","code":403,"errorCode":"AUTH_FORBIDDEN","message":${T.FORBIDDEN}}')`);
            await db.execute(sql`INSERT IGNORE INTO api_error_templates (scope, status_code, template) VALUES (${globalScope}, 404, '{"status":"error","code":404,"errorCode":"RESOURCE_NOT_FOUND","message":${T.NOT_FOUND}}')`);
            await db.execute(sql`INSERT IGNORE INTO api_error_templates (scope, status_code, template) VALUES (${globalScope}, 500, '{"status":"error","code":500,"errorCode":"SERVER_ERROR","message":${T.SERVER_ERROR}}')`);
        } catch (e) { console.log(LOGS.TEMPLATES_ERROR, e); }
    }

    async seedSettings(dbUrl: string, settings: { siteName: string; siteTitle: string; primaryColor: string }): Promise<void> {
        const db = this.dbFactory(dbUrl);
        const existing = await db.select().from(siteSettings).limit(1);
        if (existing.length === 0) {
            await db.insert(siteSettings).values({
                siteName: settings.siteName,
                siteTitle: settings.siteTitle,
                primaryColor: settings.primaryColor
            });
        }
    }

    async addMinRoleLevelColumn(dbUrl: string): Promise<void> {
        const db = this.dbFactory(dbUrl);
        await db.execute(sql`ALTER TABLE \`api_endpoints\` ADD COLUMN \`min_role_level\` INT DEFAULT 0`);
    }

    async addDescriptionColumn(dbUrl: string): Promise<void> {
        const db = this.dbFactory(dbUrl);
        await db.execute(sql`ALTER TABLE \`api_endpoints\` ADD COLUMN \`description\` TEXT`);
    }
}
