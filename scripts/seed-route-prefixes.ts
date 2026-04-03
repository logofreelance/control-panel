/**
 * Seed Route Prefixes
 *
 * Run with: npx tsx scripts/seed-route-prefixes.ts
 *
 * This script seeds the default route prefixes to the database.
 * These prefixes are used by both backend-system and control-panel
 * to ensure consistency.
 */

import { createDb, apiRoutePrefixes, eq } from "@modular/database";
import * as dotenv from "dotenv";
import path from "path";

// Load .env from backend-system
dotenv.config({
  path: path.join(__dirname, "../../backend-system/apps/engine/.env"),
});

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const db = createDb(dbUrl);

// Create table if not exists
async function createTableIfNotExists() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS api_route_prefixes (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        prefix VARCHAR(100) NOT NULL,
        description TEXT,
        is_default BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table api_route_prefixes created or already exists");
  } catch (error) {
    console.error("❌ Error creating table:", error);
  }
}

// Default route prefixes
const DEFAULT_PREFIXES = [
  {
    name: "api",
    prefix: "/api",
    description: "All API routes (both admin and public) - unified prefix",
    isDefault: true,
    isActive: true,
  },
];

async function seed() {
  console.log("🔄 Seeding route prefixes...\n");

  // Create table if not exists
  await createTableIfNotExists();

  for (const prefix of DEFAULT_PREFIXES) {
    // Check if prefix already exists
    const existing = await db
      .select()
      .from(apiRoutePrefixes)
      .where(eq(apiRoutePrefixes.name, prefix.name))
      .limit(1);

    if (existing.length > 0) {
      console.log(`📝 Updating prefix: ${prefix.name} -> ${prefix.prefix}`);
      await db
        .update(apiRoutePrefixes)
        .set({
          ...prefix,
          updatedAt: new Date(),
        })
        .where(eq(apiRoutePrefixes.id, existing[0].id));
    } else {
      console.log(`➕ Creating prefix: ${prefix.name} -> ${prefix.prefix}`);
      await db.insert(apiRoutePrefixes).values(prefix);
    }
  }

  // Display all prefixes after seeding
  console.log("\n📋 Current route prefixes in database:");
  const allPrefixes = await db.select().from(apiRoutePrefixes);
  allPrefixes.forEach(p => {
    const defaultBadge = p.isDefault ? " [DEFAULT]" : "";
    const activeBadge = p.isActive ? "" : " [INACTIVE]";
    console.log(`   ${p.name}: ${p.prefix}${defaultBadge}${activeBadge}`);
  });

  console.log("\n✅ Route prefixes seeded successfully!");
  console.log("\n💡 These prefixes can now be used by:");
  console.log("   - backend-system: Mount routes with dynamic prefixes");
  console.log(
    "   - control-panel: Read prefixes for API documentation",
  );
  console.log("   - Frontend: Know the correct API base URLs");
}

seed().catch(e => {
  console.error("❌ Error seeding route prefixes:", e);
  process.exit(1);
});
