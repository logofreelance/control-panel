/**
 * packages/settings/src/types.ts
 * 
 * Settings Module Type Definitions
 */

export interface SiteSettings {
    id?: number;
    siteName: string;
    siteTitle: string;
    metaDescription: string;
    faviconUrl: string;
    primaryColor: string;
    updatedAt?: Date;
}
