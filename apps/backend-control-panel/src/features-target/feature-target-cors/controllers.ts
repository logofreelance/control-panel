import { Context } from 'hono';
import { CorsService } from './services';
import { API_STATUS } from './constants';
import type { FeatureEnv } from './middleware';

export const CorsController = {
    getAll: async (c: Context<FeatureEnv>) => {
        try {
            const data = await CorsService.getAll(c.get('db'));
            return c.json({ status: API_STATUS.SUCCESS, data });
        } catch (e: any) {
            return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
        }
    },
    
    create: async (c: Context<FeatureEnv>) => {
        try {
            const { domain_url, description } = await c.req.json();
            if (!domain_url) return c.json({ status: API_STATUS.ERROR, message: 'Domain URL is required' }, 400);
            
            const data = await CorsService.create(c.get('db'), domain_url, description);
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
            await CorsService.toggleActive(c.get('db'), id, isActive);
            return c.json({ status: API_STATUS.SUCCESS, message: 'Toggled' });
        } catch (e: any) {
            return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
        }
    },
    
    delete: async (c: Context<FeatureEnv>) => {
        try {
            const id = c.req.param('id');
            if (!id) return c.json({ status: API_STATUS.ERROR, message: 'ID is required' }, 400);
            await CorsService.delete(c.get('db'), id);
            return c.json({ status: API_STATUS.SUCCESS, message: 'Deleted' });
        } catch (e: any) {
            return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
        }
    }
};
