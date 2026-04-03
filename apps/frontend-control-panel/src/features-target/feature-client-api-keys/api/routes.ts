/**
 * feature-client-api-keys - API Routes
 *
 * Endpoint definitions yang SESUAI dengan backend.
 * Menggunakan prefix /api/ (bukan /orange/).
 */

import { env } from "@/lib/env";

const BASE_URL = env.API_URL;

export const CLIENT_API_ROUTES = {
  // API Keys
  apiKeys: {
    list: `${BASE_URL}/api-keys`,
    create: `${BASE_URL}/api-keys`,
    toggle: (id: string) => `${BASE_URL}/api-keys/${id}/toggle`,
    delete: (id: string) => `${BASE_URL}/api-keys/${id}`,
  },

  // CORS Domains
  cors: {
    list: `${BASE_URL}/cors`,
    create: `${BASE_URL}/cors`,
    toggle: (id: string) => `${BASE_URL}/cors/${id}/toggle`,
    delete: (id: string) => `${BASE_URL}/cors/${id}`,
  },
};
