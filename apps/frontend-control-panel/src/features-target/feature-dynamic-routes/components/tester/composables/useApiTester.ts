// useApiTester.ts - All business logic for API Tester module

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { DYNAMIC_ROUTES_LABELS } from '../../../constants/ui-labels';
import { useToast } from '@/modules/_core';
import { env } from '@/lib/env';
import type { RequestHistory, Header, HttpMethod } from '../types';

const L = DYNAMIC_ROUTES_LABELS.apiTester;
const STORAGE_KEY = 'api_tester_history';

export interface UseApiTesterReturn {
    // Request state
    method: string;
    setMethod: (m: string) => void;
    url: string;
    setUrl: (u: string) => void;
    apiKey: string;
    setApiKey: (k: string) => void;
    jwtToken: string;
    setJwtToken: (t: string) => void;
    headers: Header[];
    body: string;
    setBody: (b: string) => void;
    loading: boolean;

    // Response state
    response: unknown;
    responseStatus: number | null;
    responseTime: number | null;

    // History
    history: RequestHistory[];
    showHistory: boolean;
    setShowHistory: (show: boolean) => void;

    // Tab state
    requestTab: 'headers' | 'body';
    setRequestTab: (tab: 'headers' | 'body') => void;

    // Actions
    sendRequest: () => Promise<void>;
    addHeader: () => void;
    updateHeader: (index: number, field: keyof Header, value: string | boolean) => void;
    removeHeader: (index: number) => void;
    copyResponse: () => void;
    formatBody: () => void;
    loadFromHistory: (item: RequestHistory) => void;
    clearHistory: () => void;

    // Helpers
    getStatusColor: (status: number) => string;
    getStatusLabel: (status: number) => string;
}

const METHOD_COLORS: Record<string, string> = {
    GET: 'bg-blue-500',
    POST: 'bg-green-500',
    PUT: 'bg-amber-500',
    DELETE: 'bg-red-500',
    PATCH: 'bg-purple-500'
};

const STATUS_COLORS: Record<string, string> = {
    '2': 'bg-green-500',
    '3': 'bg-blue-500',
    '4': 'bg-amber-500',
    '5': 'bg-red-500'
};

export const useApiTester = (targetId?: string): UseApiTesterReturn => {
    const { addToast } = useToast();
    const searchParams = useSearchParams();

    // Request state
    const [method, setMethod] = useState<string>('GET');
    const [url, setUrl] = useState(`${env.API_URL}/`);
    const [apiKey, setApiKey] = useState('');
    const [jwtToken, setJwtToken] = useState('');
    const [headers, setHeaders] = useState<Header[]>([
        { key: 'Content-Type', value: 'application/json', enabled: true }
    ]);
    const [body, setBody] = useState('{\n  \n}');
    const [loading, setLoading] = useState(false);

    // Response state
    const [response, setResponse] = useState<unknown>(null);
    const [responseStatus, setResponseStatus] = useState<number | null>(null);
    const [responseTime, setResponseTime] = useState<number | null>(null);

    // History
    const [history, setHistory] = useState<RequestHistory[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [requestTab, setRequestTab] = useState<'headers' | 'body'>('headers');

    // Load history from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch {
                // Ignore parse errors
            }
        }
    }, []);

    // Initialize from query params
    useEffect(() => {
        const queryMethod = searchParams?.get('method');
        const queryPath = searchParams?.get('path');

        if (queryMethod) {
            setMethod(queryMethod.toUpperCase());
        }

        if (queryPath) {
            // If path is full URL, use it directly. Otherwise assume relative to GREEN_API
            if (queryPath.startsWith('http')) {
                setUrl(queryPath);
            } else {
                // Ensure path starts with slash if not present, and handle GREEN_API
                // If queryPath includes GREEN_API already? Usually not based on logic: /green/path
                const cleanPath = queryPath.startsWith('/') ? queryPath : `/${queryPath}`;

                // If the path passed already includes /green (from env.API_URL usually), we might double up if not careful.
                // The API View passes `/green${ep.path}`. And env.API_URL is likely `/green` or full URL.
                // Let's assume input path is intended to be the full resource path relative to domain root, OR full url.

                // If env.API_URL is a relative path (e.g. /green), and queryPath is /green/users/1
                // We should just use window.origin + queryPath or similar.

                // But existing setUrl uses `${env.API_URL}/`.
                // Let's rely on standard logic: if it starts with http, use it.
                // If not, pre-pend origin if missing?
                // Actually existing default is `${env.API_URL}/`

                // If the user passes `/green/users`, and we just setUrl to that, it might be interpreted as relative to current page?
                // No, fetch(url) works with relative paths.

                setUrl(cleanPath);
            }
        }
    }, [searchParams]);

    const saveToHistory = useCallback((req: RequestHistory) => {
        setHistory(prev => {
            const newHistory = [req, ...prev.slice(0, 49)];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
            return newHistory;
        });
    }, []);

    const sendRequest = useCallback(async () => {
        if (!url.trim()) {
            addToast(L.messages.urlRequired, 'error');
            return;
        }

        setLoading(true);
        setResponse(null);
        setResponseStatus(null);
        setResponseTime(null);

        const startTime = performance.now();

        try {
            const reqHeaders: Record<string, string> = {};
            if (targetId) reqHeaders['x-target-id'] = targetId;
            if (apiKey.trim()) reqHeaders['x-api-key'] = apiKey.trim();
            if (jwtToken.trim()) reqHeaders['Authorization'] = `Bearer ${jwtToken.trim()}`;
            headers.filter(h => h.enabled && h.key.trim()).forEach(h => {
                reqHeaders[h.key] = h.value;
            });

            const options: RequestInit = { method, headers: reqHeaders };
            if (method !== 'GET' && body.trim()) options.body = body;

            const res = await fetch(url, options);
            const time = Math.round(performance.now() - startTime);

            const contentType = res.headers.get('content-type') || '';
            const data = contentType.includes('application/json')
                ? await res.json()
                : await res.text();

            setResponse(data);
            setResponseStatus(res.status);
            setResponseTime(time);

            saveToHistory({
                id: Date.now().toString(),
                method,
                url,
                status: res.status,
                time,
                timestamp: new Date()
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setResponse({ error: message });
            setResponseStatus(0);
            setResponseTime(Math.round(performance.now() - startTime));
            addToast(`${L.messages.requestFailed}: ${message}`, 'error');
        }

        setLoading(false);
    }, [url, apiKey, jwtToken, headers, method, body, addToast, saveToHistory]);

    const addHeader = useCallback(() => {
        setHeaders(prev => [...prev, { key: '', value: '', enabled: true }]);
    }, []);

    const updateHeader = useCallback((index: number, field: keyof Header, value: string | boolean) => {
        setHeaders(prev => {
            const newHeaders = [...prev];
            newHeaders[index] = { ...newHeaders[index], [field]: value };
            return newHeaders;
        });
    }, []);

    const removeHeader = useCallback((index: number) => {
        setHeaders(prev => prev.filter((_, i) => i !== index));
    }, []);

    const copyResponse = useCallback(() => {
        if (response) {
            navigator.clipboard.writeText(
                typeof response === 'string' ? response : JSON.stringify(response, null, 2)
            );
            addToast(L.messages.copied, 'success');
        }
    }, [response, addToast]);

    const formatBody = useCallback(() => {
        try {
            const parsed = JSON.parse(body);
            setBody(JSON.stringify(parsed, null, 2));
        } catch {
            addToast(L.messages.invalidJson, 'error');
        }
    }, [body, addToast]);

    const loadFromHistory = useCallback((item: RequestHistory) => {
        setMethod(item.method);
        setUrl(item.url);
        setShowHistory(false);
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const getStatusColor = useCallback((status: number) => {
        return STATUS_COLORS[String(status).charAt(0)] || 'bg-gray-500';
    }, []);

    const getStatusLabel = useCallback((status: number) => {
        if (status >= 200 && status < 300) return L.labels.ok;
        if (status >= 400 && status < 500) return L.labels.error;
        if (status >= 500) return L.labels.serverError;
        return '';
    }, []);

    return {
        method,
        setMethod,
        url,
        setUrl,
        apiKey,
        setApiKey,
        jwtToken,
        setJwtToken,
        headers,
        body,
        setBody,
        loading,
        response,
        responseStatus,
        responseTime,
        history,
        showHistory,
        setShowHistory,
        requestTab,
        setRequestTab,
        sendRequest,
        addHeader,
        updateHeader,
        removeHeader,
        copyResponse,
        formatBody,
        loadFromHistory,
        clearHistory,
        getStatusColor,
        getStatusLabel,
    };
};

// Export constants for use in component
export { METHOD_COLORS };
export const METHODS: readonly HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
