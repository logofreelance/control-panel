/**
 * Seed All Static Routes
 *
 * Run with: npx tsx scripts/seed-all-routes.ts
 *
 * This script seeds ALL static routes to the database.
 * These routes will be used by both backend-system and control-panel.
 */

import { createDb, apiCategories, apiEndpoints, eq } from "@modular/database";
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
    // Check if table exists
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

// All static routes that need to be seeded
const STATIC_ROUTES = [
  // Auth routes
  {
    category: "Authentication",
    path: "/auth/login",
    method: "POST",
    description: "User login endpoint",
    minRoleLevel: 0,
    roles: "",
    isStatic: true,
  },
  {
    category: "Authentication",
    path: "/auth/register",
    method: "POST",
    description: "User registration endpoint",
    minRoleLevel: 0,
    roles: "",
    isStatic: true,
  },
  {
    category: "Authentication",
    path: "/auth/logout",
    method: "POST",
    description: "User logout endpoint",
    minRoleLevel: 1,
    roles: "",
    isStatic: true,
  },
  {
    category: "Authentication",
    path: "/auth/me",
    method: "GET",
    description: "Get current user info",
    minRoleLevel: 1,
    roles: "",
    isStatic: true,
  },
  {
    category: "Authentication",
    path: "/auth/verify",
    method: "GET",
    description: "Verify authentication token",
    minRoleLevel: 1,
    roles: "",
    isStatic: true,
  },
  {
    category: "Authentication",
    path: "/auth/refresh",
    method: "POST",
    description: "Refresh authentication token",
    minRoleLevel: 1,
    roles: "",
    isStatic: true,
  },

  // Users routes
  {
    category: "User Management",
    path: "/users",
    method: "GET",
    description: "List all users",
    minRoleLevel: 10,
    roles: "admin,super_admin",
    isStatic: true,
  },
  {
    category: "User Management",
    path: "/users",
    method: "POST",
    description: "Create new user",
    minRoleLevel: 50,
    roles: "super_admin",
    isStatic: true,
  },
  {
    category: "User Management",
    path: "/users/:id",
    method: "GET",
    description: "Get user by ID",
    minRoleLevel: 10,
    roles: "admin,super_admin",
    isStatic: true,
  },
  {
    category: "User Management",
    path: "/users/:id",
    method: "PUT",
    description: "Update user",
    minRoleLevel: 50,
    roles: "super_admin",
    isStatic: true,
  },
  {
    category: "User Management",
    path: "/users/:id",
    method: "DELETE",
    description: "Delete user",
    minRoleLevel: 100,
    roles: "super_admin",
    isStatic: true,
  },

  // Data Sources routes
  {
    category: "Data Sources",
    path: "/data-sources",
    method: "GET",
    description: "List all data sources",
    minRoleLevel: 10,
    roles: "admin,super_admin",
    isStatic: true,
  },
  {
    category: "Data Sources",
    path: "/data-sources",
    method: "POST",
    description: "Create new data source",
    minRoleLevel: 50,
    roles: "super_admin",
    isStatic: true,
  },
  {
    category: "Data Sources",
    path: "/data-sources/:id",
    method: "GET",
    description: "Get data source by ID",
    minRoleLevel: 10,
    roles: "admin,super_admin",
    isStatic: true,
  },
  {
    category: "Data Sources",
    path: "/data-sources/:id",
    method: "PUT",
    description: "Update data source",
    minRoleLevel: 50,
    roles: "super_admin",
    isStatic: true,
  },
  {
    category: "Data Sources",
    path: "/data-sources/:id",
    method: "DELETE",
    description: "Delete data source",
    minRoleLevel: 100,
    roles: "super_admin",
    isStatic: true,
  },
  {
    category: "Data Sources",
    path: "/data-sources/:id/schema",
    method: "GET",
    description: "Get data source schema",
    minRoleLevel: 10,
    roles: "admin,super_admin",
    isStatic: true,
  },
  {
    category: "Data Sources",
    path: "/data-sources/:id/data",
    method: "GET",
    description: "Get data source data",
    minRoleLevel: 10,
    roles: "admin,super_admin",
    isStatic: true,
  },

  // Settings routes
  {
    category: "Settings",
    path: "/settings",
    method: "GET",
    description: "Get site settings",
    minRoleLevel: 50,
    roles: "admin,super_admin",
    isStatic: true,
  },
  {
    category: "Settings",
    path: "/settings",
    method: "POST",
    description: "Update site settings",
    minRoleLevel: 100,
    roles: "super_admin",
    isStatic: true,
  },

  // API Keys routes
  {
    category: "API Keys",
    path: "/api-keys",
    method: "GET",
    description: "List all API keys",
    minRoleLevel: 50,
    roles: "super_admin",
    isStatic: true,
  },
  {
    category: "API Keys",
    path: "/api-keys",
    method: "POST",
    description: "Create new API key",
    minRoleLevel: 100,
    roles: "super_admin",
    isStatic: true,
  },
  {
    category: "API Keys",
    path: "/api-keys/:id",
    method: "DELETE",
    description: "Delete API key",
    minRoleLevel: 100,
    roles: "super_admin",
    isStatic: true,
  },

  // Roles routes
  {
    category: "Roles",
    path: "/roles",
    method: "GET",
    description: "List all roles",
    minRoleLevel: 50,
    roles: "super_admin",
    isStatic: true,
  },
  {
    category: "Roles",
    path: "/roles",
    method: "POST",
    description: "Create new role",
    minRoleLevel: 100,
    roles: "super_admin",
    isStatic: true,
  },
  {
    category: "Roles",
    path: "/roles/:id",
    method: "PUT",
    description: "Update role",
    minRoleLevel: 100,
    roles: "super_admin",
    isStatic: true,
  },
  {
    category: "Roles",
    path: "/roles/:id",
    method: "DELETE",
    description: "Delete role",
    minRoleLevel: 100,
    roles: "super_admin",
    isStatic: true,
  },

  // Permissions routes
  {
    category: "Permissions",
    path: "/permissions",
    method: "GET",
    description: "List all permissions",
    minRoleLevel: 50,
    roles: "super_admin",
    isStatic: true,
  },
  {
    category: "Permissions",
    path: "/permissions",
    method: "POST",
    description: "Create new permission",
    minRoleLevel: 100,
    roles: "super_admin",
    isStatic: true,
  },

  // CORS routes
  {
    category: "CORS",
    path: "/cors",
    method: "GET",
    description: "List CORS domains",
    minRoleLevel: 50,
    roles: "super_admin",
    isStatic: true,
  },
  {
    category: "CORS",
    path: "/cors",
    method: "POST",
    description: "Add CORS domain",
    minRoleLevel: 100,
    roles: "super_admin",
    isStatic: true,
  },
  {
    category: "CORS",
    path: "/cors/:id",
    method: "DELETE",
    description: "Delete CORS domain",
    minRoleLevel: 100,
    roles: "super_admin",
    isStatic: true,
  },

  // Storage routes
  {
    category: "Storage",
    path: "/storage/stats",
    method: "GET",
    description: "Get storage statistics",
    minRoleLevel: 50,
    roles: "super_admin",
    isStatic: true,
  },
  {
    category: "Storage",
    path: "/storage/cleanup",
    method: "POST",
    description: "Cleanup storage",
    minRoleLevel: 100,
    roles: "super_admin",
    isStatic: true,
  },

  // Monitor routes
  {
    category: "Monitor",
    path: "/monitor",
    method: "GET",
    description: "Get monitor stats",
    minRoleLevel: 50,
    roles: "super_admin",
    isStatic: true,
  },
  {
    category: "Monitor",
    path: "/monitor/metrics",
    method: "GET",
    description: "Get monitor metrics",
    minRoleLevel: 50,
    roles: "super_admin",
    isStatic: true,
  },

  // Route Builder routes
  {
    category: "Route Builder",
    path: "/route-builder/endpoints",
    method: "GET",
    description: "List API endpoints",
    minRoleLevel: 50,
    roles: "super_admin",
    isStatic: true,
  },
  {
    category: "Route Builder",
    path: "/route-builder/categories",
    method: "GET",
    description: "List API categories",
    minRoleLevel: 50,
    roles: "super_admin",
    isStatic: true,
  },
  {
    category: "Route Builder",
    path: "/route-builder/logs",
    method: "GET",
    description: "View API logs",
    minRoleLevel: 50,
    roles: "super_admin",
    isStatic: true,
  },

  // Error Templates routes
  {
    category: "Error Templates",
    path: "/error-templates",
    method: "GET",
    description: "List error templates",
    minRoleLevel: 50,
    roles: "super_admin",
    isStatic: true,
  },
  {
    category: "Error Templates",
    path: "/error-templates",
    method: "POST",
    description: "Create error template",
    minRoleLevel: 100,
    roles: "super_admin",
    isStatic: true,
  },

  // System routes
  {
    category: "System",
    path: "/system-status",
    method: "GET",
    description: "Get system status",
    minRoleLevel: 0,
    roles: "",
    isStatic: true,
  },
  {
    category: "System",
    path: "/health",
    method: "GET",
    description: "Health check endpoint",
    minRoleLevel: 0,
    roles: "",
    isStatic: true,
  },
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

  // Insert and get the ID differently
  const result = await db.insert(apiCategories).values({
    name,
    description: `${name} endpoints`,
  });

  // Get the last inserted ID
  const [newCat] = await db
    .select()
    .from(apiCategories)
    .where(eq(apiCategories.name, name))
    .limit(1);

  return newCat?.id || 1;
}

async function seed() {
  console.log("🔄 Seeding all routes...\n");

  // Create table first
  await createTableIfNotExists();

  // Seed route prefixes
  const prefixes = [
    {
      name: "api",
      prefix: "/api",
      description: "All API routes - unified prefix",
      isDefault: true,
      isActive: true,
    },
  ];

  for (const p of prefixes) {
    const [existing] = await db
      .select()
      .from(apiRoutePrefixes)
      .where(eq(apiRoutePrefixes.name, p.name))
      .limit(1);

    if (existing) {
      console.log(`📝 Updating prefix: ${p.name}`);
      await db
        .update(apiRoutePrefixes)
        .set({ ...p, updatedAt: new Date() })
        .where(eq(apiRoutePrefixes.id, existing.id));
    } else {
      console.log(`➕ Creating prefix: ${p.name}`);
      await db.insert(apiRoutePrefixes).values(p);
    }
  }

  // Seed all routes
  console.log("\n📂 Seeding routes by category...\n");

  let routesCreated = 0;
  let routesUpdated = 0;

  for (const route of STATIC_ROUTES) {
    const categoryId = await getOrCreateCategory(route.category);

    // Check if route already exists
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
      roles: route.roles,
      isActive: true,
    };

    if (existing) {
      console.log(`  📝 ${route.method} ${route.path} (${route.category})`);
      await db
        .update(apiEndpoints)
        .set(routeData)
        .where(eq(apiEndpoints.id, existing.id));
      routesUpdated++;
    } else {
      console.log(`  ➕ ${route.method} ${route.path} (${route.category})`);
      await db.insert(apiEndpoints).values(routeData);
      routesCreated++;
    }
  }

  // Summary
  console.log("\n✅ Seeding complete!");
  console.log(`   Created: ${routesCreated} routes`);
  console.log(`   Updated: ${routesUpdated} routes`);

  // Show all routes grouped by category
  console.log("\n📋 All routes in database:");
  const categories = await db.select().from(apiCategories);
  for (const cat of categories) {
    const routes = await db
      .select()
      .from(apiEndpoints)
      .where(eq(apiEndpoints.categoryId, cat.id));
    console.log(`\n   [${cat.name}] (${routes.length} routes)`);
    for (const r of routes) {
      console.log(`      ${r.method} ${r.path}`);
    }
  }
}

// Need to import apiRoutePrefixes
import { apiRoutePrefixes } from "@modular/database";

seed().catch(e => {
  console.error("❌ Error seeding routes:", e);
  process.exit(1);
});
