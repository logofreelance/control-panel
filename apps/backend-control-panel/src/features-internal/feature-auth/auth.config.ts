export const AUTH_PANEL_JWT_EXPIRY = '24h';
export const AUTH_PANEL_BCRYPT_SALT_ROUNDS = 10;
export const AUTH_PANEL_SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 hari

export const AUTH_PANEL_ROUTE_PATHS = {
    login: '/login',
    logout: '/logout',
    currentUser: '/me',
    updateProfile: '/update-profile',
    changePassword: '/change-password',
    install: '/install',
};
