/**
 * Theme cookie utilities for server-side theme injection
 * Stores theme in cookies so it can be read on server-side before hydration
 */

const THEME_COOKIE_NAME = 'theme_color';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

/**
 * Set theme color in cookie (client-side)
 */
export function setThemeCookie(color: string): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${THEME_COOKIE_NAME}=${encodeURIComponent(color)};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
}

/**
 * Get theme color from cookie (works on both client and server)
 * @param cookieHeader - Optional cookie header string from server request
 */
export function getThemeFromCookie(cookieHeader?: string): string | null {
    const cookies = cookieHeader ?? (typeof document !== 'undefined' ? document.cookie : '');
    const match = cookies.match(new RegExp(`(^|;\\s*)${THEME_COOKIE_NAME}=([^;]*)`));
    return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Sync localStorage settings to theme cookie
 * Call this when settings are loaded/updated
 */
export function syncThemeToCookie(): void {
    if (typeof window === 'undefined') return;
    try {
        const settings = localStorage.getItem('site_settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            if (parsed.primaryColor) {
                setThemeCookie(parsed.primaryColor);
            }
        }
    } catch {
        // Ignore errors
    }
}
