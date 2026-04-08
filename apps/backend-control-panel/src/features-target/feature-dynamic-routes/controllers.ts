import { Context } from "hono";
import { randomUUID } from 'node:crypto';
import {
  CategoryService,
  EndpointService,
  LogService,
  CoreRouteService,
  ErrorTemplateService,
} from "./services";
import { API_STATUS } from "./constants";
import type { AppEnv } from "./types";

// ============================================
// CATEGORY CONTROLLERS
// ============================================
export const CategoryController = {
  getAll: async (c: Context<{ Variables: { targetDb: any, targetId: string } }>) => {
    try {
      return c.json({
        status: API_STATUS.SUCCESS,
        data: await CategoryService.getAll(c.get("targetDb")),
      });
    } catch (e: any) {
      return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
    }
  },
  create: async (c: Context<{ Variables: { targetDb: any, targetId: string } }>) => {
    try {
      const body = await c.req.json();
      const { id, name, description } = body;

      if (!name || typeof name !== "string") {
        return c.json(
          {
            status: API_STATUS.ERROR,
            message: "name is required and must be string",
          },
          400,
        );
      }

      if (id) {
        await CategoryService.update(c.get("targetDb"), id, name, description);
        return c.json({
          status: API_STATUS.SUCCESS,
          data: { id, name: name.trim() },
        });
      }

      const newId = randomUUID();
      await CategoryService.create(c.get("targetDb"), newId, name, description);
      return c.json({
        status: API_STATUS.SUCCESS,
        data: { id: newId, name: name.trim() },
      });
    } catch (e: any) {
      console.error("[CATEGORY CREATE]", e);
      return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
    }
  },
  delete: async (c: Context<{ Variables: { targetDb: any, targetId: string } }>) => {
    try {
      await CategoryService.delete(c.get("targetDb"), c.req.param("id") as string);
      return c.json({ status: API_STATUS.SUCCESS });
    } catch (e: any) {
      return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
    }
  },
};

// ============================================
// ENDPOINT CONTROLLERS
// ============================================
export const EndpointController = {
  getAll: async (c: Context<{ Variables: { targetDb: any, targetId: string } }>) => {
    try {
      return c.json({
        status: API_STATUS.SUCCESS,
        data: await EndpointService.getAll(c.get("targetDb")),
      });
    } catch (e: any) {
      return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
    }
  },
  getStats: async (c: Context<{ Variables: { targetDb: any, targetId: string } }>) => {
    try {
      return c.json({
        status: API_STATUS.SUCCESS,
        data: await EndpointService.getStats(c.get("targetDb")),
      });
    } catch (e: any) {
      return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
    }
  },
  getById: async (c: Context<{ Variables: { targetDb: any, targetId: string } }>) => {
    try {
      const endpoint = await EndpointService.getById(
        c.get("targetDb"),
        c.req.param("id") as string,
      );
      return endpoint
        ? c.json({ status: API_STATUS.SUCCESS, data: endpoint })
        : c.json({ status: API_STATUS.ERROR, message: "Not found" }, 404);
    } catch (e: any) {
      return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
    }
  },
  create: async (c: Context<{ Variables: { targetDb: any, targetId: string } }>) => {
    try {
      const body = await c.req.json();
      const id = body.id || randomUUID();
      await EndpointService.create(c.get("targetDb"), id, body);
      return c.json({ status: API_STATUS.SUCCESS, data: { id } });
    } catch (e: any) {
      return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
    }
  },
  delete: async (c: Context<{ Variables: { targetDb: any, targetId: string } }>) => {
    try {
      await EndpointService.delete(c.get("targetDb"), c.req.param("id") as string);
      return c.json({ status: API_STATUS.SUCCESS });
    } catch (e: any) {
      return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
    }
  },
  toggle: async (c: Context<{ Variables: { targetDb: any, targetId: string } }>) => {
    try {
      const { is_active } = await c.req.json();
      await EndpointService.toggleActive(
        c.get("targetDb"),
        c.req.param("id") as string,
        is_active,
      );
      return c.json({ status: API_STATUS.SUCCESS });
    } catch (e: any) {
      return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
    }
  },
};

// ============================================
// LOGS & CORE ROUTES CONTROLLERS
// ============================================
export const MiscController = {
  getLogs: async (c: Context<{ Variables: { targetDb: any, targetId: string } }>) => {
    try {
      return c.json({
        status: API_STATUS.SUCCESS,
        data: await LogService.getRecent(c.get("targetDb")),
      });
    } catch (e: any) {
      return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
    }
  },
  getApiRoutes: async (c: Context<{ Variables: { targetDb: any, targetId: string } }>) => {
    try {
      const routes = await CoreRouteService.getAll(c.get("targetDb"));
      return c.json({
        status: API_STATUS.SUCCESS,
        data: { routes },
      });
    } catch (e: any) {
      return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
    }
  },
};

// ============================================
// ERROR TEMPLATES CONTROLLERS
// ============================================
export const ErrorTemplateController = {
  getAll: async (c: Context<{ Variables: { targetDb: any, targetId: string } }>) => {
    try {
      return c.json({
        status: API_STATUS.SUCCESS,
        data: await ErrorTemplateService.getAll(c.get("targetDb")),
      });
    } catch (e: any) {
      return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
    }
  },
  create: async (c: Context<{ Variables: { targetDb: any, targetId: string } }>) => {
    try {
      const body = await c.req.json();
      const id = randomUUID();
      await ErrorTemplateService.create(c.get("targetDb"), id, body);
      return c.json({
        status: API_STATUS.SUCCESS,
        data: { id, statusCode: body.statusCode },
      });
    } catch (e: any) {
      return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
    }
  },
  delete: async (c: Context<{ Variables: { targetDb: any, targetId: string } }>) => {
    try {
      await ErrorTemplateService.delete(
        c.get("targetDb"),
        c.req.param("id") as string,
      );
      return c.json({ status: API_STATUS.SUCCESS, message: "Deleted" });
    } catch (e: any) {
      return c.json({ status: API_STATUS.ERROR, message: e.message }, 500);
    }
  },
};
