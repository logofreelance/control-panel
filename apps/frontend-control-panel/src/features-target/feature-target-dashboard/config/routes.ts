export const TARGET_DASHBOARD_ROUTES = {
    targetSystems: '/target-systems',
    databaseSchema: (targetId: string) => `/target/${targetId}/database-schema`,
} as const;
