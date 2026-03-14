/**
 * packages/system-settings/src/config/labels.ts
 * 
 * Settings Module Labels
 * Migrated from @cp/config
 */

export const SETTINGS_LABELS = {
    title: 'SETTINGS.TITLE',
    subtitle: 'SETTINGS.SUBTITLE',

    sections: {
        brand: 'SETTINGS.SECTIONS.BRAND',
        seo: 'SETTINGS.SECTIONS.SEO',
        assets: 'SETTINGS.SECTIONS.ASSETS',
        general: 'SETTINGS.SECTIONS.GENERAL',
        security: 'SETTINGS.SECTIONS.SECURITY',
        appearance: 'SETTINGS.SECTIONS.APPEARANCE',
        notifications: 'SETTINGS.SECTIONS.NOTIFICATIONS',
    },

    labels: {
        searchPreview: 'SETTINGS.LABELS.SEARCH_PREVIEW',
        siteName: 'SETTINGS.LABELS.SITE_NAME',
        primaryColor: 'SETTINGS.LABELS.PRIMARY_COLOR',
        metaTitle: 'SETTINGS.LABELS.META_TITLE',
        metaDescription: 'SETTINGS.LABELS.META_DESCRIPTION',
        favicon: 'SETTINGS.LABELS.FAVICON',
        faviconPlaceholder: 'SETTINGS.LABELS.FAVICON_PLACEHOLDER', // Value is same as key for now or empty? No, used as placeholder text? Wait, placeholder text should be a key too.
        descriptionPlaceholder: 'SETTINGS.LABELS.DESCRIPTION_PLACEHOLDER',
        defaultMetaDescription: 'SETTINGS.LABELS.DEFAULT_META_DESCRIPTION',
        previewUrl: 'SETTINGS.LABELS.PREVIEW_URL',
        changesAppliedNote: 'SETTINGS.LABELS.CHANGES_APPLIED_NOTE',
        separator: 'SETTINGS.LABELS.SEPARATOR',
    },

    buttons: {
        save: 'SETTINGS.BUTTONS.SAVE',
    },

    messages: {
        saveSuccess: 'SETTINGS.MESSAGES.SAVE_SUCCESS',
        saveFailed: 'SETTINGS.MESSAGES.SAVE_FAILED',
        loadFailed: 'SETTINGS.MESSAGES.LOAD_FAILED',
        connectionFailed: 'SETTINGS.MESSAGES.CONNECTION_FAILED',
    },
};
