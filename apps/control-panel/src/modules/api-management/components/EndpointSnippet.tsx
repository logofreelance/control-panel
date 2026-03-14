'use client';

import { useState } from 'react';
import { Button } from '@cp/ui';
import { Icons } from '@cp/config/client';
import { useToast } from '@/modules/_core';
import { ApiEndpoint } from '../types';
import { env } from '@/lib/env';

interface EndpointSnippetProps {
    endpoint: ApiEndpoint;
}

export const EndpointSnippet = ({ endpoint }: EndpointSnippetProps) => {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<'fetch' | 'curl' | 'axios'>('fetch');

    const baseUrl = env.BACKEND_SYSTEM_API || '';
    const fullUrl = `${baseUrl}/green${endpoint.path}`;
    const method = endpoint.method;

    const getSnippet = () => {
        const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);
        // We use a mock body for demonstration
        const mockBody = JSON.stringify({ key: "value" }, null, 2).replace(/\n/g, '\n    ');

        switch (activeTab) {
            case 'fetch':
                return `const response = await fetch('${fullUrl}', {
    method: '${method}',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
    }${hasBody ? `,\n    body: JSON.stringify(${mockBody.replace(/\n    /g, '')})` : ''}
});

const data = await response.json();
if (!response.ok) {
    throw new Error(data.message || 'API Error');
}
console.log(data);`;

            case 'curl':
                return `curl -X ${method} "${fullUrl}" \\
     -H "Content-Type: application/json" \\
     -H "Authorization: Bearer YOUR_TOKEN"${hasBody ? ` \\
     -d '${mockBody.replace(/\n    /g, '')}'` : ''}`;

            case 'axios':
                return `import axios from 'axios';

try {
    const { data } = await axios.${method.toLowerCase()}('${fullUrl}'${hasBody ? `, {
        key: "value"
    }` : ''}, {
        headers: {
            'Authorization': 'Bearer YOUR_TOKEN'
        }
    });
    console.log(data);
} catch (error) {
    console.error(error.response.data);
}`;
            default:
                return '';
        }
    };

    const code = getSnippet();

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        addToast(`${activeTab} snippet copied!`, 'success');
    };

    return (
        <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
                <div className="flex gap-2">
                    {(['fetch', 'curl', 'axios'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab
                                    ? 'bg-slate-700 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            {tab.toUpperCase()}
                        </button>
                    ))}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                    onClick={handleCopy}
                >
                    <Icons.copy className="w-4 h-4" />
                </Button>
            </div>
            <div className="p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-blue-300 leading-relaxed font-medium">
                    {code}
                </pre>
            </div>
        </div>
    );
};

