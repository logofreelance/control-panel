// auth-routes types
export interface AuthRoute {
    method: string;
    path: string;
    description: string;
    body?: string;
    response?: string;
    errorResponse?: string;
}

export interface AuthCategory {
    category: string;
    Icon: React.ComponentType<{ className?: string }>;
    routes: AuthRoute[];
}
