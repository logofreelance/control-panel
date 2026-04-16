/**
 * stats-get/handler.ts
 *
 * ALUR: Request → Count active schemas → Return stats
 */
import { countActiveSchemas } from './model';

export const handler = async (c: any) => {
  try {
    const db = c.get('targetDb');
    const count = await countActiveSchemas(db);
    return c.json({
      status: 'success',
      data: { total: count, totalSources: count, totalTables: count, totalRecords: 0 }
    });
  } catch {
    return c.json({
      status: 'success',
      data: { total: 0, totalSources: 0, totalTables: 0, totalRecords: 0 }
    });
  }
};
