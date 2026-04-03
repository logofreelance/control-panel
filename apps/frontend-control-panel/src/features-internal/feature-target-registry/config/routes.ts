export const TARGET_ROUTES = {
    dashboard: '/',
    profile: '/settings/profile',
    target: (id: string) => `/target/${id}`,
} as const;
