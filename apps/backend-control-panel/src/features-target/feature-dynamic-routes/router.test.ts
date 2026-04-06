import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { setupDynamicRoutesRouter } from './router';
import { CategoryService, EndpointService, LogService, CoreRouteService, ErrorTemplateService } from './services';
import { API_STATUS } from './constants';

// Mock Middleware to bypass DB connection
vi.mock('./middleware', () => ({
    injectTargetDatabase: () => async (c: any, next: any) => {
        c.set('db', { mock: true });
        c.set('targetId', 'mock-target');
        await next();
    }
}));

// Mock all services
vi.mock('./services', () => ({
    CategoryService: {
        getAll: vi.fn(),
        create: vi.fn(),
        delete: vi.fn()
    },
    EndpointService: {
        getAll: vi.fn(),
        getStats: vi.fn(),
        getById: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        toggleActive: vi.fn()
    },
    CoreRouteService: {
        getAll: vi.fn()
    },
    LogService: {
        getRecent: vi.fn()
    },
    ErrorTemplateService: {
        getAll: vi.fn(),
        create: vi.fn(),
        delete: vi.fn()
    }
}));

describe('Feature Dynamic Routes endpoints', () => {
    let app: Hono;

    beforeEach(() => {
        vi.clearAllMocks();
        app = new Hono();
        app.route('/api/route-builder', setupDynamicRoutesRouter());
    });

    describe('Categories Resource', () => {
        it('GET /categories should return categories', async () => {
            const mockData = [{ id: 'cat-1', name: 'Test' }];
            vi.mocked(CategoryService.getAll).mockResolvedValueOnce(mockData);

            const res = await app.request('/api/route-builder/categories');
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.status).toBe(API_STATUS.SUCCESS);
            expect(body.data).toEqual(mockData);
            expect(CategoryService.getAll).toHaveBeenCalledTimes(1);
        });

        it('POST /categories should create category', async () => {
            const res = await app.request('/api/route-builder/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'New Cat', description: 'desc' })
            });
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.status).toBe(API_STATUS.SUCCESS);
            expect(body.data).toHaveProperty('id');
            expect(body.data.name).toBe('New Cat');
            expect(CategoryService.create).toHaveBeenCalledTimes(1);
        });

        it('DELETE /categories/:id should delete category', async () => {
            const res = await app.request('/api/route-builder/categories/cat-1', {
                method: 'DELETE'
            });
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.status).toBe(API_STATUS.SUCCESS);
            expect(CategoryService.delete).toHaveBeenCalledTimes(1);
        });
    });

    describe('Endpoints Resource', () => {
        it('GET /endpoints should return all endpoints', async () => {
            const mockData = [{ id: 'end-1', endpoint: '/test' }];
            vi.mocked(EndpointService.getAll).mockResolvedValueOnce(mockData);

            const res = await app.request('/api/route-builder/endpoints');
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.status).toBe(API_STATUS.SUCCESS);
            expect(body.data).toEqual(mockData);
        });

        it('GET /endpoints/stats should return stats', async () => {
            const mockStats = { total: 10, active: 5 };
            vi.mocked(EndpointService.getStats).mockResolvedValueOnce(mockStats);

            const res = await app.request('/api/route-builder/endpoints/stats');
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.data).toEqual(mockStats);
        });

        it('GET /endpoints/:id should return single endpoint', async () => {
            const mockData = { id: 'end-1', endpoint: '/single' };
            vi.mocked(EndpointService.getById).mockResolvedValueOnce(mockData);

            const res = await app.request('/api/route-builder/endpoints/end-1');
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.data).toEqual(mockData);
        });

        it('GET /endpoints/:id should return 404 if not found', async () => {
            vi.mocked(EndpointService.getById).mockResolvedValueOnce(null);

            const res = await app.request('/api/route-builder/endpoints/not-found');
            const body = await res.json();

            expect(res.status).toBe(404);
            expect(body.status).toBe(API_STATUS.ERROR);
        });

        it('POST /endpoints should create an endpoint', async () => {
            const res = await app.request('/api/route-builder/endpoints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint: '/new' })
            });
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.status).toBe(API_STATUS.SUCCESS);
            expect(EndpointService.create).toHaveBeenCalledTimes(1);
        });

        it('DELETE /endpoints/:id should delete an endpoint', async () => {
            const res = await app.request('/api/route-builder/endpoints/end-1', {
                method: 'DELETE'
            });
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.status).toBe(API_STATUS.SUCCESS);
            expect(EndpointService.delete).toHaveBeenCalledTimes(1);
        });

        it('PUT /endpoints/:id/toggle should toggle active status', async () => {
            const res = await app.request('/api/route-builder/endpoints/end-1/toggle', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: false })
            });
            const body = await res.json();

            expect(res.status).toBe(200);
            expect(body.status).toBe(API_STATUS.SUCCESS);
            expect(EndpointService.toggleActive).toHaveBeenCalledWith(expect.anything(), 'end-1', false);
        });
    });

    describe('Logs & Core API Routes', () => {
        it('GET /logs should return recent logs', async () => {
            vi.mocked(LogService.getRecent).mockResolvedValueOnce([]);
            const res = await app.request('/api/route-builder/logs');
            const body = await res.json();
            expect(res.status).toBe(200);
            expect(body.status).toBe(API_STATUS.SUCCESS);
        });

        it('GET /api-routes should return internal routes', async () => {
            vi.mocked(CoreRouteService.getAll).mockResolvedValueOnce([{ path: '/core' }]);
            const res = await app.request('/api/route-builder/api-routes');
            const body = await res.json();
            expect(res.status).toBe(200);
            expect(body.data.routes).toBeTruthy();
        });
    });

    describe('Error Templates Resource', () => {
        it('GET /error-templates should return all templates', async () => {
            vi.mocked(ErrorTemplateService.getAll).mockResolvedValueOnce([]);
            const res = await app.request('/api/route-builder/error-templates');
            const body = await res.json();
            expect(res.status).toBe(200);
            expect(body.status).toBe(API_STATUS.SUCCESS);
        });

        it('POST /error-templates should create an error template', async () => {
            const res = await app.request('/api/route-builder/error-templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statusCode: 500, title: 'Server Error' })
            });
            const body = await res.json();
            expect(res.status).toBe(200);
            expect(body.data).toHaveProperty('id');
            expect(body.data.statusCode).toBe(500);
        });

        it('DELETE /error-templates/:id should delete a template', async () => {
            const res = await app.request('/api/route-builder/error-templates/err-1', {
                method: 'DELETE'
            });
            const body = await res.json();
            expect(res.status).toBe(200);
            expect(body.status).toBe(API_STATUS.SUCCESS);
        });
    });
});
