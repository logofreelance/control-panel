/**
 * feature-settings — TypeScript Interfaces
 * 
 * 🤖 AI: Defines the shape of settings data flowing through all layers.
 */

/** Raw database row from `site_settings` table */
export interface SettingsRow {
    id: string;
    setting_key: string;
    setting_value: string;
}

/** Parsed settings object used by frontend and handlers */
export interface SiteSettings {
    siteName: string;
    siteTitle: string;
    primaryColor: string;
    faviconUrl: string;
    metaDescription: string;
}
