import { Context } from 'hono';
import { ApiKeyService } from './services';
import { API_STATUS } from './constants';
import type { FeatureEnv } from './middleware';

export const ApiKeyController = {
    getAll: async (c: Context<FeatureEnv>) => {
        try {
            const data = await ApiKeyService.getAll(c.get('db'));
            return c.json({ status: API_STATUS.SUCCESS, data });
        } catch (e: any) {
            return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
        }
    },
    
    create: async (c: Context<FeatureEnv>) => {
        try {
            const { name, expiresAt } = await c.req.json();
            if (!name) return c.json({ status: API_STATUS.ERROR, message: 'Name is required' }, 400);
            
            const data = await ApiKeyService.create(c.get('db'), name, expiresAt);
            return c.json({ status: API_STATUS.SUCCESS, data });
        } catch (e: any) {
            return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
        }
    },
    
    toggle: async (c: Context<FeatureEnv>) => {
        try {
            const id = c.req.param('id');
            if (!id) return c.json({ status: API_STATUS.ERROR, message: 'ID is required' }, 400);
            const { isActive } = await c.req.json();
            await ApiKeyService.toggleActive(c.get('db'), id, isActive);
            return c.json({ status: API_STATUS.SUCCESS, message: 'Status updated' });
        } catch (e: any) {
            return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
        }
    },
    
    delete: async (c: Context<FeatureEnv>) => {
        try {
            const id = c.req.param('id');
            if (!id) return c.json({ status: API_STATUS.ERROR, message: 'ID is required' }, 400);
            await ApiKeyService.delete(c.get('db'), id);
            return c.json({ status: API_STATUS.SUCCESS, message: 'Deleted' });
        } catch (e: any) {
            return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
        }
    }
};
