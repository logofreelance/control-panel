import { loadEnvironmentConfig } from '../src/env.js';
import { buildInternalDatabaseConnection } from '../src/features-internal/internal.db.js';

async function setupInternalDB() {
    const env = loadEnvironmentConfig();
    const db = buildInternalDatabaseConnection(env.DATABASE_URL_INTERNAL_CONTROL_PANEL);

    console.log("Menyiapkan tabel INTERNAL Control Panel...");

    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS admin_users (
                id VARCHAR(255) PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Tabel admin_users siap.");

        await db.execute(`
            CREATE TABLE IF NOT EXISTS admin_sessions (
                id VARCHAR(255) PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                expires_at DATETIME NOT NULL,
                FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
            )
        `);
        console.log("✅ Tabel admin_sessions siap.");

    } catch (e) {
        console.error("❌ Gagal membuat schema internal DB:", e);
    }
}

setupInternalDB();
