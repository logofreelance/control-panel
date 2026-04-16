/**
 * ping-get/handler.ts
 *
 * ALUR: Request → Return pong
 */

export const handler = async (c: any) => {
  return c.json({ status: 'success', message: 'pong' });
};
