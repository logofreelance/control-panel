export const DASHBOARD_ROUTES = {
  login: '/login',
  settings: '/settings',
  profile: '/settings/profile',
  targetSystems: '/target-systems',
  target: (id: string) => `/target/${id}`,
} as const;
