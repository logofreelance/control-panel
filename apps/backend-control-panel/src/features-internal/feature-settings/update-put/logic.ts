import { settingsStore } from '../settings.store';

export function processUpdateSettings(db: any, settingsData: Record<string, any>) {
    if (!settingsData || typeof settingsData !== 'object') {
        throw new Error('Invalid settings data format');
    }
    
    const fieldMapping: Record<string, string> = {
        'siteName': 'site_name',
        'siteTitle': 'site_title',
        'metaDescription': 'meta_description',
        'primaryColor': 'primaryColor',
        'faviconUrl': 'favicon_url',
        'themePreset': 'themePreset',
        'DATABASE_URL_INTERNAL_CONTROL_PANEL': 'DATABASE_URL_INTERNAL_CONTROL_PANEL',
        'JWT_SECRET': 'JWT_SECRET'
    };

    // This is now "synchronous" for the caller as it updates memory immediately
    // and triggers background persistence.
    return settingsStore.update(db, settingsData, fieldMapping);
}
