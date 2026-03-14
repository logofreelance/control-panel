// packages/config/src/brand.ts
// Branding configuration - DEPRECATED
// Moved to @cp/settings-manager

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
 * @deprecated Use @cp/settings-manager
 */
export const buildPageTitle = (pageTitle: string): string =>
    `${pageTitle} | ${BRAND.NAME}`;

/**
 * Helper: Get full copyright with year
 * @deprecated Use @cp/settings-manager
 */
export const getCopyright = (year?: number): string =>
    `© ${year || new Date().getFullYear()} ${BRAND.NAME}`;
