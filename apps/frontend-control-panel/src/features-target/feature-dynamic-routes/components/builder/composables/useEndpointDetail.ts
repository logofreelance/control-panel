'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useConfig } from '@/modules/_core';
import { useToast } from '@/modules/_core';
import { ApiEndpoint } from '@/features-target/feature-dynamic-routes';
import { DYNAMIC_ROUTES_API } from '../../../api';
import { env } from '@/lib/env';

/**
 * useEndpointDetail composable
 * Fetches and manages single endpoint data for detail view
 */
export function useEndpointDetail(targetId: string, endpointId: string) {
    const { api } = useConfig();
    const { addToast } = useToast();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [endpoint, setEndpoint] = useState<ApiEndpoint | null>(null);
    const [dataSource, setDataSource] = useState<{ name: string; tableName: string } | null>(null);
    const [resource, setResource] = useState<{ name: string } | null>(null);

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
    }, [endpointId, api.databaseSchema, addToast, router]);

    useEffect(() => {
        if (endpointId) {
            fetchEndpoint();
        }
    }, [endpointId, fetchEndpoint]);

    // Generate full URL using centralized env
    const getFullUrl = useCallback(() => {
        if (!endpoint) return '';
        return `${env.API_URL}${endpoint.path}`;
    }, [endpoint]);

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
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '${bodyExample}'`
            : `curl -X ${method} "${url}" \\
  -H "Authorization: Bearer YOUR_TOKEN"`;

        const javascript = needsBody
            ? `fetch("${url}", {
  method: "${method}",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_TOKEN"
  },
  body: JSON.stringify(${bodyExample})
})
  .then(res => res.json())
  .then(data => console.log(data));`
            : `fetch("${url}", {
  headers: {
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
        "Authorization": "Bearer YOUR_TOKEN"
    },
    json=${bodyExample.replace(/"/g, "'")}
)
print(response.json())`
            : `import requests

response = requests.${method.toLowerCase()}(
    "${url}",
    headers={
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
        getFullUrl,
        getCodeExamples,
        router
    };
}
