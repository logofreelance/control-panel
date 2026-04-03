/**
 * feature-client-api-keys - Types
 *
 * TypeScript interfaces untuk API Keys dan CORS Domains.
 * Fields mengikuti backend conventions (snake_case).
 */

export interface ClientApiKey {
  id: string;
  name: string;
  key?: string; // Hanya muncul saat create
  key_hash?: string;
  expires_at?: string | null;
  is_active: number; // 0 atau 1
  created_at: string;
}

export interface CorsDomain {
  id: string;
  domain_url: string; // snake_case dari backend
  description?: string;
  is_active: number; // 0 atau 1
  created_at: string;
}

export interface ApiKeyCreateInput {
  name: string;
  expiresAt?: string;
}

export interface CorsDomainCreateInput {
  domain_url: string;
  description?: string;
}

export interface ToggleStatusInput {
  isActive: boolean;
}

export type ApiResponse<T> = {
  status: "success" | "error";
  data?: T;
  message?: string;
};
