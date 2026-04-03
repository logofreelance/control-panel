/**
 * Seed Backend-System Routes Only
 *
 * Run with: npx tsx scripts/seed-backend-routes.ts
 *
 * This script seeds ONLY backend-system routes to the database.
 * endpoints are available in backend-system.
 *
 * Control-panel routes remain in code (not in database).
 */

import {
  createDb,
  apiCategories,
  apiEndpoints,
  eq,
  apiRoutePrefixes,
} from "@modular/database";
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

// Only backend-system routes (these are the public API endpoints)
const BACKEND_SYSTEM_ROUTES = [
  // Auth - public endpoints
  {
    category: "Authentication",
    path: "/auth/login",
    method: "POST",
    description: "User login",
    minRoleLevel: 0,
  },
  {
    category: "Authentication",
    path: "/auth/register",
    method: "POST",
    description: "User registration",
    minRoleLevel: 0,
  },
  {
    category: "Authentication",
    path: "/auth/logout",
    method: "POST",
    description: "User logout",
    minRoleLevel: 1,
  },
  {
    category: "Authentication",
    path: "/auth/me",
    method: "GET",
    description: "Get current user",
    minRoleLevel: 1,
  },
  {
    category: "Authentication",
    path: "/auth/verify",
    method: "GET",
    description: "Verify token",
    minRoleLevel: 1,
  },
  {
    category: "Authentication",
    path: "/auth/refresh",
    method: "POST",
    description: "Refresh token",
    minRoleLevel: 1,
  },
  {
    category: "Authentication",
    path: "/auth/forgot-password",
    method: "POST",
    description: "Forgot password",
    minRoleLevel: 0,
  },
  {
    category: "Authentication",
    path: "/auth/reset-password",
    method: "POST",
    description: "Reset password",
    minRoleLevel: 0,
  },

  // User Data - authenticated users
  {
    category: "User Data",
    path: "/user/data",
    method: "GET",
    description: "Get user data",
    minRoleLevel: 1,
  },
  {
    category: "User Data",
    path: "/user/profile",
    method: "PUT",
    description: "Update profile",
    minRoleLevel: 1,
  },
  {
    category: "User Data",
    path: "/user/change-password",
    method: "POST",
    description: "Change password",
    minRoleLevel: 1,
  },
  {
    category: "User Data",
    path: "/user/account",
    method: "DELETE",
    description: "Delete account",
    minRoleLevel: 1,
  },

  // Dynamic Resources (these come from data sources)
  // These are dynamic - handled by resolver
];

async function getOrCreateCategory(name: string): Promise<number> {
  const [existing] = await db
    .select()
    .from(apiCategories)
    .where(eq(apiCategories.name, name))
    .limit(1);

  if (existing) {
    return existing.id;
  }

  const result = await db.insert(apiCategories).values({
    name,
    description: `${name} - backend-system endpoint`,
  });

  const [newCat] = await db
    .select()
    .from(apiCategories)
    .where(eq(apiCategories.name, name))
    .limit(1);

  return newCat?.id || 1;
}

async function seed() {
  console.log("🔄 Seeding BACKEND-SYSTEM routes only...\n");

  // Seed prefix first
  const [existingPrefix] = await db
    .select()
    .from(apiRoutePrefixes)
    .where(eq(apiRoutePrefixes.name, "api"))
    .limit(1);

  if (existingPrefix) {
    console.log("📝 Prefix already exists");
  } else {
    await db.insert(apiRoutePrefixes).values({
      name: "api",
      prefix: "/api",
      description: "Backend-system API prefix",
      isDefault: true,
      isActive: true,
    });
    console.log("➕ Created prefix: /api");
  }

  // Clear old routes that aren't in our list
  // This removes control-panel routes, keeping only backend-system
  console.log("\n🧹 Clearing old routes...");

  // Get all current routes
  const allRoutes = await db.select().from(apiEndpoints);
  console.log(`   Found ${allRoutes.length} existing routes`);

  // Delete routes not in our backend-system list
  const backendPaths = BACKEND_SYSTEM_ROUTES.map(r => r.path);
  let deleted = 0;
  for (const route of allRoutes) {
    if (!backendPaths.includes(route.path)) {
      await db.delete(apiEndpoints).where(eq(apiEndpoints.id, route.id));
      deleted++;
    }
  }
  console.log(`   Deleted ${deleted} non-backend-system routes`);

  // Seed backend-system routes
  console.log("\n📂 Seeding backend-system routes...\n");

  let created = 0;
  let updated = 0;

  for (const route of BACKEND_SYSTEM_ROUTES) {
    const categoryId = await getOrCreateCategory(route.category);

    const [existing] = await db
      .select()
      .from(apiEndpoints)
      .where(eq(apiEndpoints.path, route.path))
      .limit(1);

    const routeData = {
      path: route.path,
      method: route.method,
      description: route.description,
      categoryId,
      minRoleLevel: route.minRoleLevel,
      roles: "",
      isActive: true,
    };

    if (existing) {
      console.log(`  📝 ${route.method} ${route.path} (${route.category})`);
      await db
        .update(apiEndpoints)
        .set(routeData)
        .where(eq(apiEndpoints.id, existing.id));
      updated++;
    } else {
      console.log(`  ➕ ${route.method} ${route.path} (${route.category})`);
      await db.insert(apiEndpoints).values(routeData);
      created++;
    }
  }

  console.log("\n✅ Seeding complete!");
  console.log(`   Created: ${created} routes`);
  console.log(`   Updated: ${updated} routes`);

  // Show result
  console.log("\n📋 Backend-system routes in database:");
  const categories = await db.select().from(apiCategories);
  for (const cat of categories) {
    const routes = await db
      .select()
      .from(apiEndpoints)
      .where(eq(apiEndpoints.categoryId, cat.id));
    if (routes.length > 0) {
      console.log(`\n   [${cat.name}]`);
      for (const r of routes) {
        console.log(`      ${r.method} ${r.path}`);
      }
    }
  }
}

seed().catch(e => {
  console.error("❌ Error:", e);
  process.exit(1);
});
