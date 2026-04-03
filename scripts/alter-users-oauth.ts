import { createDb } from '@modular/database';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../backend-system/apps/engine/.env') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error("DATABASE_URL not found");
    process.exit(1);
}
const db = createDb(dbUrl);

async function run() {
    try {
        console.log("Altering table users...");
        await db.execute(sql`ALTER TABLE \`users\` MODIFY \`password_hash\` text NULL;`);

        // Add google_id if it doesn't exist. Ignore if it does.
        try {
            await db.execute(sql`ALTER TABLE \`users\` ADD COLUMN \`google_id\` varchar(255) UNIQUE AFTER \`password_hash\`;`);
            console.log("Added google_id column.");
        } catch (e: any) {
            if (e.message && e.message.includes("Duplicate column name")) {
                console.log("google_id column already exists.");
            } else {
                throw e;
            }
        }

        console.log("Successfully altered users table!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
