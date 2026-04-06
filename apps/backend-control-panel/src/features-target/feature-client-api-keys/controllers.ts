import { Context } from 'hono';
import { ApiKeyService } from './services';
import { API_STATUS } from './constants';

export const ApiKeyController = {
    getAll: async (c: Context<{ Variables: { targetDb: any, targetId: string } }>) => {
        try {
            const data = await ApiKeyService.getAll(c.get('targetDb'));
            return c.json({ status: API_STATUS.SUCCESS, data });
        } catch (e: any) {
            return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
        }
    },
    
    create: async (c: Context<{ Variables: { targetDb: any, targetId: string } }>) => {
        try {
            const { name, expiresAt } = await c.req.json();
            if (!name) return c.json({ status: API_STATUS.ERROR, message: 'Name is required' }, 400);
            
            const data = await ApiKeyService.create(c.get('targetDb'), name, expiresAt);
            return c.json({ status: API_STATUS.SUCCESS, data });
        } catch (e: any) {
            return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
        }
    },
    
    toggle: async (c: Context<{ Variables: { targetDb: any, targetId: string } }>) => {
        try {
            const id = c.req.param('id');
            if (!id) return c.json({ status: API_STATUS.ERROR, message: 'ID is required' }, 400);
            const { isActive } = await c.req.json();
            await ApiKeyService.toggleActive(c.get('targetDb'), id, isActive);
            return c.json({ status: API_STATUS.SUCCESS, message: 'Status updated' });
        } catch (e: any) {
            return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
        }
    },
    
    delete: async (c: Context<{ Variables: { targetDb: any, targetId: string } }>) => {
        try {
            const id = c.req.param('id');
            if (!id) return c.json({ status: API_STATUS.ERROR, message: 'ID is required' }, 400);
            await ApiKeyService.delete(c.get('targetDb'), id);
            return c.json({ status: API_STATUS.SUCCESS, message: 'Deleted' });
        } catch (e: any) {
            return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
        }
    }
};
