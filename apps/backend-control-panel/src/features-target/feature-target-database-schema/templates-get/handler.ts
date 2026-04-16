/**
 * templates-get/handler.ts
 *
 * ALUR: Request → Return empty templates array
 */

export const handler = async (c: any) => {
  return c.json({ status: 'success', data: [] });
};
