// useAuthRoutes.ts - Business logic for Auth Routes module

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MODULE_LABELS, MenuIcons, Icons } from '@cp/config/client';
import { useToast, usePageLoading } from '@/modules/_core';
import { env } from '@/lib/env';

const L = MODULE_LABELS.authRoutes;

export interface AuthRoute {
    method: string;
    path: string;
    description: string;
    body?: string;
    response?: string;
    errorResponse?: string;
    httpStatus?: string;       // e.g., "200 OK, 400 Bad Request, 401 Unauthorized"
    headers?: string;          // Required headers info
    notes?: string;            // Additional notes (rate limits, token expiry, etc.)
}

export interface AuthCategory {
    category: string;
    Icon: React.ComponentType<{ className?: string }>;
    routes: AuthRoute[];
}

// Backend route shape from /auth/routes API
interface BackendRouteField {
    name: string;
    type: string;
    example?: string;
}

interface BackendRouteError {
    code: string;
    description: string;
}

interface BackendRoute {
    method: string;
    path: string;
    description: string;
    category?: string;
    auth?: 'required' | 'optional' | 'none';
    requestBody?: { fields: BackendRouteField[] };
    responseBody?: {
        success?: { status: number; fields: BackendRouteField[] };
        errors?: BackendRouteError[];
    };
}

export interface UseAuthRoutesReturn {
    // State
    loading: boolean;
    error: string | null;
    expandedCategory: string | null;
    setExpandedCategory: (cat: string | null) => void;

    // Data
    authRoutes: AuthCategory[];
    statsValues: { total: number; auth: number };

    // Actions
    copyToClipboard: (path: string) => void;
    openInTester: (method: string, path: string, body?: string) => void;
    goBack: () => void;
    goToTester: () => void;
}

export const useAuthRoutes = (): UseAuthRoutesReturn => {
    const router = useRouter();
    const { addToast } = useToast();
    const { setPageLoading } = usePageLoading();
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [authRoutes, setAuthRoutes] = useState<AuthCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Sync loading state with global page loading
    useEffect(() => {
        setPageLoading(loading);
    }, [loading, setPageLoading]);

    const fetchRoutes = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${env.API_BASE}/api-management/api-routes`);
            const json = await res.json();

            if (json.status === 'success' && json.data && json.data.routes) {
                const backendRoutes: BackendRoute[] = json.data.routes;

                // Group by category
                const groups: Record<string, AuthRoute[]> = {};

                backendRoutes.forEach(route => {
                    const cat = route.category || 'Uncategorized';
                    if (!groups[cat]) groups[cat] = [];

                    // Transform Backend Route to Frontend AuthRoute
                    const transformedRoute: AuthRoute = {
                        method: route.method,
                        path: route.path,
                        description: route.description,
                        httpStatus: route.responseBody?.success?.status?.toString() || '200',
                        headers: route.auth === 'required' ? 'Authorization: Bearer <token>' : 'None',
                        notes: route.auth === 'required' ? 'Requires valid JWT token' : 'Public endpoint',
                        body: route.requestBody ? JSON.stringify(
                            route.requestBody.fields.reduce((acc: Record<string, string>, field: BackendRouteField) => {
                                acc[field.name] = field.example || field.type;
                                return acc;
                            }, {}), null, 2
                        ) : undefined,
                        response: route.responseBody?.success ? JSON.stringify(
                            {
                                success: true,
                                data: route.responseBody.success.fields.reduce((acc: Record<string, string | Record<string, string>>, field: BackendRouteField) => {
                                    // Handle nested fields if necessary, simpler for now
                                    if (field.name.includes('.')) {
                                        const [parent, child] = field.name.split('.');
                                        if (!acc[parent]) acc[parent] = {};
                                        (acc[parent] as Record<string, string>)[child] = '...';
                                    } else {
                                        acc[field.name] = field.type;
                                    }
                                    return acc;
                                }, {})
                            }, null, 2
                        ) : undefined,
                        errorResponse: route.responseBody?.errors?.length ? JSON.stringify(
                            {
                                success: false,
                                error: {
                                    code: route.responseBody.errors[0].code,
                                    message: route.responseBody.errors[0].description
                                }
                            }, null, 2
                        ) : undefined
                    };

                    groups[cat].push(transformedRoute);
                });

                const categories: AuthCategory[] = Object.keys(groups).map(key => {
                    // Map known icons or default
                    const Icon = key.includes('User') ? (key.includes('Data') ? Icons.users : Icons.shield) : Icons.info;
                    return {
                        category: key,
                        Icon, // No cast needed with proper typing
                        routes: groups[key]
                    };
                });

                setAuthRoutes(categories);
                setExpandedCategory(categories[0]?.category || null);
            } else {
                setError('Failed to load documentation data');
            }
        } catch {
            setError('Failed to connect to documentation server');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial Fetch
    useState(() => {
        fetchRoutes();
    });

    const copyToClipboard = useCallback((path: string) => {
        const fullUrl = `${env.BACKEND_SYSTEM_API}${path}`;
        navigator.clipboard.writeText(fullUrl);
        addToast(L.messages.urlCopied, 'success');
    }, [addToast]);

    const openInTester = useCallback((method: string, path: string, body?: string) => {
        // Assume path is full path like /green/auth/login
        let url = `${MenuIcons.apiTester.href}?method=${method}&path=${path}`;
        if (body) {
            url += `&body=${encodeURIComponent(body)}`;
        }
        router.push(url);
    }, [router]);

    const goBack = useCallback(() => {
        router.push('/api-management');
    }, [router]);

    const goToTester = useCallback(() => {
        router.push(MenuIcons.apiTester.href);
    }, [router]);

    // Stats
    const totalRoutes = authRoutes.reduce((acc, cat) => acc + cat.routes.length, 0);
    const authRoutesCount = authRoutes[0]?.routes.length || 0; // Just an approximation for stats

    return {
        loading,
        error,
        expandedCategory,
        setExpandedCategory,
        authRoutes,
        statsValues: { total: totalRoutes, auth: authRoutesCount },
        copyToClipboard,
        openInTester,
        goBack,
        goToTester,
    };
};

