// packages/config/src/brand.ts
// Branding configuration - DEPRECATED
// Moved to @repo/system-settings

export const BRAND = {
    NAME: 'Modular Engine',
    PRIMARY_COLOR: '#6366f1', // Indigo 500
};

export const DEFAULT_SITE_SETTINGS = {
    siteName: BRAND.NAME,
    primaryColor: BRAND.PRIMARY_COLOR,
    faviconUrl: ''
};

/**
 * Helper: Build page title with brand name
 * @deprecated Use @repo/system-settings
 */
export const buildPageTitle = (pageTitle: string): string =>
    `${pageTitle} | ${BRAND.NAME}`;

/**
 * Helper: Get full copyright with year
 * @deprecated Use @repo/system-settings
 */
export const getCopyright = (year?: number): string =>
    `© ${year || new Date().getFullYear()} ${BRAND.NAME}`;
