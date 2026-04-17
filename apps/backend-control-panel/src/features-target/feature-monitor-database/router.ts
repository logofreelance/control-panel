/**
 * router.ts
 *
 * HANYA PENDAFTARAN ROUTE. Zero logic.
 * Setiap handler di-import dari island terisolir.
 */

import { Hono } from 'hono';
import { middleware as resolveTarget } from './middleware/handler';

// --- Handler imports (1 folder = 1 handler) ---
import { handler as testGet } from './test-get/handler';
import { handler as statsGet } from './stats-get/handler';
import { handler as tablesDelete } from './tables-delete/handler';
import { handler as cleanupPost } from './cleanup-post/handler';

import type { EnvironmentConfig } from '../../env';

export function createFeatureTargetMonitorDatabase(env: EnvironmentConfig) {
  const router = new Hono<{ Variables: { targetDb: any; targetId: string } }>();

  // Middleware Lokal
  router.use('*', resolveTarget(env));

  // --- Routes ---
  
  // Test konektivitas
  router.get('/test', testGet);

  // Statistik database
  router.get('/stats', statsGet);

  // Hapus tabel
  router.delete('/tables/:name', tablesDelete);

  // Pembersihan metadata
  router.post('/cleanup', cleanupPost);

  return router as any;
}
