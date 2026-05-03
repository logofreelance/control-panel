import { executeSafe } from '../../internal.db';

/**
 * list-get/model.ts
 */
export async function getSettings(db: any) {
    const rows = await executeSafe(db, 'SELECT setting_key, setting_value FROM panel_settings');
    
    const settings: Record<string, any> = {};
    
    // Map of DB keys (snake_case) to Frontend keys (camelCase)
    const keyMap: Record<string, string> = {
        'site_name': 'siteName',
        'site_title': 'siteTitle',
        'meta_description': 'metaDescription',
        'primary_color': 'primaryColor',
        'favicon_url': 'faviconUrl',
        'theme_preset': 'themePreset',
        // Support direct camelCase if they are stored that way
        'siteName': 'siteName',
        'siteTitle': 'siteTitle',
        'metaDescription': 'metaDescription',
        'primaryColor': 'primaryColor',
        'faviconUrl': 'faviconUrl',
        'themePreset': 'themePreset'
    };

    rows.forEach((row: any) => {
        const frontendKey = keyMap[row.setting_key] || row.setting_key;
        settings[frontendKey] = row.setting_value;
    });

    return settings;
}
