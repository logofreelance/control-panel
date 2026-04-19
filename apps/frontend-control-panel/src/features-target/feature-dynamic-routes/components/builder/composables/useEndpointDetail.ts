'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useConfig } from '@/modules/_core';
import { useToast } from '@/modules/_core';
import { ApiEndpoint } from '@/features-target/feature-dynamic-routes';
import { DYNAMIC_ROUTES_API } from '../../../api';
import { env } from '@/lib/env';
import { useTargetRegistry } from '@/features-internal/feature-target-registry/hooks/useTargetRegistry';

/**
 * useEndpointDetail composable
 * Fetches and manages single endpoint data for detail view
 */
export function useEndpointDetail(targetId: string, endpointId: string) {
    const { api } = useConfig();
    const { addToast } = useToast();
    const router = useRouter();
    const { targets } = useTargetRegistry();

    const [loading, setLoading] = useState(true);
    const [endpoint, setEndpoint] = useState<ApiEndpoint | null>(null);
    const [dataSource, setDataSource] = useState<{ name: string; tableName: string } | null>(null);
    const [resource, setResource] = useState<{ name: string } | null>(null);
    
    const [selectedBaseUrlIndex, setSelectedBaseUrlIndex] = useState(0);

    // Fetch endpoint data
    const fetchEndpoint = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(DYNAMIC_ROUTES_API.endpoints.detail(endpointId), { headers: { 'x-target-id': targetId } });
            const data = await res.json();

            if (data.status === 'success') {
                const found = data.data;
                setEndpoint(found);

                // Fetch DataSource details if linked
                if (found.dataSourceId) {
                    const dsRes = await fetch(api.databaseSchema.detail(found.dataSourceId), { headers: { 'x-target-id': targetId } });
                    const dsData = await dsRes.json();
                    if (dsData.status === 'success') {
                        setDataSource({ name: dsData.data.name, tableName: dsData.data.tableName });
                    }
                }

                // Fetch Resource details if linked
                if (found.resourceId && found.dataSourceId) {
                    const resRes = await fetch(api.databaseSchema.resources(found.dataSourceId), { headers: { 'x-target-id': targetId } });
                    const resData = await resRes.json();
                    if (resData.status === 'success') {
                        const r = resData.data.find((r: { id: number }) => r.id === found.resourceId);
                        if (r) setResource({ name: r.name });
                    }
                }
            } else {
                addToast('Endpoint not found', 'error');
            }
        } catch {
            addToast('Failed to load endpoint', 'error');
        } finally {
            setLoading(false);
        }
    }, [endpointId, targetId, api.databaseSchema, addToast]);

    useEffect(() => {
        if (endpointId) {
            fetchEndpoint();
        }
    }, [endpointId, fetchEndpoint]);

    // Helper to determine the Engine's URL based on Control Panel's URL
    const getTargetApiUrlFallback = useCallback(() => {
      let url = env.API_URL || 'http://localhost:3001/api';
      url = url.replace(':3001', ':3002');
      url = url.replace('backend-control-panel', 'backend-system');
      return url;
    }, []);

    // Get all available Target API URLs
    const targetApiUrls = useMemo(() => {
        const currentTarget = targets.find((t) => t.id === targetId);
        const rawTargetApiUrl = currentTarget?.apiEndpoint || getTargetApiUrlFallback();
        
        return rawTargetApiUrl.split(',').map(url => {
            const trimmed = url.trim();
            // Ensure ends with /api
            return trimmed.endsWith('/api') ? trimmed : `${trimmed.replace(/\/$/, '')}/api`;
        }).filter(Boolean);
    }, [targets, targetId, getTargetApiUrlFallback]);

    // Generate full URL pointing to target Backend System API
    const getFullUrl = useCallback(() => {
        if (!endpoint || !targetApiUrls || targetApiUrls.length === 0) return '';
        
        const baseApiUrl = targetApiUrls[selectedBaseUrlIndex] || targetApiUrls[0];
        return `${baseApiUrl}/v1${endpoint.path}`;
    }, [endpoint, targetApiUrls, selectedBaseUrlIndex]);

    // Generate code examples
    const getCodeExamples = useCallback(() => {
        if (!endpoint) return { curl: '', javascript: '', python: '' };

        const url = getFullUrl();
        const method = endpoint.method;

        // Parse writable fields for body example
        let bodyExample = '{}';
        if (endpoint.writableFields && ['POST', 'PUT', 'PATCH'].includes(method)) {
            try {
                const fields = JSON.parse(endpoint.writableFields);
                const obj: Record<string, string> = {};
                fields.forEach((f: string) => { obj[f] = `your_${f}`; });
                bodyExample = JSON.stringify(obj, null, 2);
            } catch { /* ignore */ }
        }

        const needsBody = ['POST', 'PUT', 'PATCH'].includes(method);

        const curl = needsBody
            ? `curl -X ${method} "${url}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '${bodyExample}'`
            : `curl -X ${method} "${url}" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Authorization: Bearer YOUR_TOKEN"`;

        const javascript = needsBody
            ? `fetch("${url}", {
  method: "${method}",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY",
    "Authorization": "Bearer YOUR_TOKEN"
  },
  body: JSON.stringify(${bodyExample})
})
  .then(res => res.json())
  .then(data => console.log(data));`
            : `fetch("${url}", {
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Authorization": "Bearer YOUR_TOKEN"
  }
})
  .then(res => res.json())
  .then(data => console.log(data));`;

        const python = needsBody
            ? `import requests

response = requests.${method.toLowerCase()}(
    "${url}",
    headers={
        "Content-Type": "application/json",
        "x-api-key": "YOUR_API_KEY",
        "Authorization": "Bearer YOUR_TOKEN"
    },
    json=${bodyExample.replace(/"/g, "'")}
)
print(response.json())`
            : `import requests

response = requests.${method.toLowerCase()}(
    "${url}",
    headers={
        "x-api-key": "YOUR_API_KEY",
        "Authorization": "Bearer YOUR_TOKEN"
    }
)
print(response.json())`;

        return { curl, javascript, python };
    }, [endpoint, getFullUrl]);

    return {
        loading,
        endpoint,
        dataSource,
        resource,
        targetApiUrls,
        selectedBaseUrlIndex,
        setSelectedBaseUrlIndex,
        getFullUrl,
        getCodeExamples,
        router
    };
}
