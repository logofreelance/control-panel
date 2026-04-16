'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { Icons } from '../../../config/icons';
import { useToast } from '@/modules/_core';
import { ApiEndpoint } from '@/features-target/feature-dynamic-routes';
import { env } from '@/lib/env';
import { cn } from '@/lib/utils';

interface EndpointSnippetProps {
  endpoint: ApiEndpoint;
}

export const EndpointSnippet = ({ endpoint }: EndpointSnippetProps) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'fetch' | 'curl' | 'axios'>('fetch');

  const baseUrl = env.API_URL || '';
  const fullUrl = `${baseUrl}/green${endpoint.path}`;
  const method = endpoint.method;

  const getSnippet = () => {
    const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);
    const mockBody = JSON.stringify({ key: 'value' }, null, 2).replace(/\n/g, '\n ');

    switch (activeTab) {
      case 'fetch':
        return `const response = await fetch('${fullUrl}', {
  method: '${method}',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  }${hasBody ? `,\n  body: JSON.stringify(${mockBody.replace(/\n /g, '')})` : ''}
});

const data = await response.json();
if (!response.ok) {
  throw new Error(data.message || 'API Error');
}
console.log(data);`;

      case 'curl':
        return `curl -X ${method} "${fullUrl}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN"${
    hasBody
      ? ` \\
  -d '${mockBody.replace(/\n /g, '')}'`
      : ''
  }`;

      case 'axios':
        return `import axios from 'axios';

try {
  const { data } = await axios.${method.toLowerCase()}('${fullUrl}'${
    hasBody
      ? `, {
    key: "value"
  }`
      : ''
  }, {
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
    <div className="bg-foreground rounded-[2rem] overflow-hidden border-none shadow-none group">
      <div className="px-6 py-4 bg-background/5 border-b border-background/5 flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2 p-1.5 bg-background/5 rounded-2xl">
          {(['fetch', 'curl', 'axios'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-5 py-2 rounded-xl text-base font-normal lowercase transition-all',
                activeTab === tab
                  ? 'bg-background text-foreground shadow-none'
                  : 'text-background/40 hover:text-background/90 hover:bg-background/10',
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-12 w-12 p-0 rounded-2xl text-background/40 hover:text-background hover:bg-background/10 transition-all opacity-0 group-hover:opacity-100"
          onClick={handleCopy}
        >
          <Icons.copy className="w-5 h-5" />
        </Button>
      </div>
      <div className="p-8 overflow-x-auto scrollbar-none">
        <pre className="text-base text-primary-foreground/90 font-normal leading-relaxed">
          {code}
        </pre>
      </div>
    </div>
  );
};
