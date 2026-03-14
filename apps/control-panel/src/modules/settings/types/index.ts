/**
 * settings/types/index.ts
 * 
 * TypeScript interfaces for settings module
 */

export interface SiteSettings {
    id?: number;
    siteName: string;
    siteTitle: string;
    primaryColor: string;
    faviconUrl: string;
    metaDescription: string;
    updatedAt?: string;
}

export interface SettingsFormState {
    loading: boolean;
    error: string | null;
}

export interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
}
