// useAuthRoutes.ts - Business logic for Auth Routes module

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '../../../config/icons';
import { DYNAMIC_ROUTES_LABELS } from '../../../constants/ui-labels';
import { useToast, usePageLoading } from '@/modules/_core';
import { env } from '@/lib/env';
import { DYNAMIC_ROUTES_API } from '../../../api';

const L = DYNAMIC_ROUTES_LABELS.authRoutes;

export interface AuthRoute {
    method: string;
    path: string;
    description: string;
    body?: string;
    response?: string;
    errorResponse?: string;
    errors?: Array<{ code: string; description: string }>; // Added support for multiple errors
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
    metadata?: string;
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

export const useAuthRoutes = (targetId?: string): UseAuthRoutesReturn => {
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
            const res = await fetch(DYNAMIC_ROUTES_API.apiRoutes, {
                headers: targetId ? { 'x-target-id': targetId } : {}
            });
            const json = await res.json();

            if (json.status === 'success' && json.data && json.data.routes) {
                const backendRoutes: BackendRoute[] = json.data.routes;

                // Group by category
                const groups: Record<string, AuthRoute[]> = {};

                backendRoutes.forEach(route => {
                    let metadata: any = {};
                    try {
                        if (route.metadata) {
                            metadata = typeof route.metadata === 'string' 
                                ? JSON.parse(route.metadata) 
                                : route.metadata;
                        }
                    } catch (e) {
                        console.warn('Failed to parse metadata for route', route.path, e);
                    }

                    const mergedRoute = { ...route, ...metadata };
                    
                    const cat = mergedRoute.category || 'Uncategorized';
                    if (!groups[cat]) groups[cat] = [];

                    // Transform Backend Route to Frontend AuthRoute
                    const transformedRoute: AuthRoute = {
                        method: mergedRoute.method,
                        path: mergedRoute.path,
                        description: mergedRoute.description,
                        httpStatus: mergedRoute.responseBody?.success?.status?.toString() || '200',
                        headers: mergedRoute.auth === 'required' ? 'Authorization: Bearer <token>' : (mergedRoute.path.includes('login') ? 'None (Auth Credentials in Body)' : 'None'),
                        notes: mergedRoute.notes || (
                            mergedRoute.auth === 'required' 
                                ? 'JWT Protected (Bearer Token Required)' 
                                : (mergedRoute.path.includes('login') || mergedRoute.path.includes('register') 
                                    ? 'Public Access (Account Verification Needed)' 
                                    : 'Public Endpoint')
                        ),
                        errors: mergedRoute.responseBody?.errors,
                        body: mergedRoute.requestBody?.fields ? JSON.stringify(
                            mergedRoute.requestBody.fields.reduce((acc: Record<string, any>, field: BackendRouteField) => {
                                if (field && field.name) {
                                    acc[field.name] = field.example || field.type || 'any';
                                }
                                return acc;
                            }, {}), null, 2
                        ) : (mergedRoute.notes?.toLowerCase().includes('body') ? '{\n  // See technical notes for body structure\n}' : undefined),
                        response: mergedRoute.responseBody?.success?.fields ? JSON.stringify(
                            {
                                success: true,
                                data: mergedRoute.responseBody.success.fields.reduce((acc: Record<string, any>, field: BackendRouteField) => {
                                    if (!field || !field.name) return acc;
                                    
                                    if (field.name.includes('.')) {
                                        const parts = field.name.split('.');
                                        let current = acc;
                                        for (let i = 0; i < parts.length - 1; i++) {
                                            if (!current[parts[i]]) current[parts[i]] = {};
                                            current = current[parts[i]];
                                        }
                                        current[parts[parts.length - 1]] = field.type || 'any';
                                    } else {
                                        acc[field.name] = field.type || 'any';
                                    }
                                    return acc;
                                }, {})
                            }, null, 2
                        ) : undefined,
                        errorResponse: mergedRoute.responseBody?.errors?.length ? JSON.stringify(
                            {
                                success: false,
                                error: {
                                    code: mergedRoute.responseBody.errors[0].code || 'ERROR',
                                    message: mergedRoute.responseBody.errors[0].description || 'An error occurred'
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
    }, [targetId]);

    // Initial Fetch
    useEffect(() => {
        if (targetId) {
            fetchRoutes();
        } else {
            setAuthRoutes([]);
            setLoading(false);
        }
    }, [fetchRoutes, targetId]);

    const copyToClipboard = useCallback((path: string) => {
        const fullUrl = `${env.API_URL}${path}`;
        navigator.clipboard.writeText(fullUrl);
        addToast(L.messages.urlCopied, 'success');
    }, [addToast]);

    const openInTester = useCallback((method: string, path: string, body?: string) => {
        // Assume path is full path like /green/auth/login
        let url = `/api-tester?method=${method}&path=${path}`;
        if (body) {
            url += `&body=${encodeURIComponent(body)}`;
        }
        router.push(url);
    }, [router]);

    const goBack = useCallback(() => {
        router.push('/');  // Back to dashboard
    }, [router]);

    const goToTester = useCallback(() => {
        router.push('/api-tester');
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

