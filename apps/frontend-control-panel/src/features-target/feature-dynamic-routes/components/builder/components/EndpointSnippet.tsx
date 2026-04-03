'use client';

import { useState } from 'react';
import { Button, Stack } from '@/components/ui';
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
 const mockBody = JSON.stringify({ key: "value" }, null, 2).replace(/\n/g, '\n ');

 switch (activeTab) {
 case 'fetch':
 return `const response = await fetch('${fullUrl}', {
 method: '${method}',
 headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer YOUR_TOKEN'
 }${hasBody ? `,\n body: JSON.stringify(${mockBody.replace(/\n /g, '')})` : ''}
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
 -d '${mockBody.replace(/\n /g, '')}'` : ''}`;

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
 <div className="bg-foreground rounded-xl overflow-hidden border border-border">
 <Stack direction="row" align="center" justify="between" className="px-4 py-2 bg-foreground/90 border-b border-border">
 <Stack direction="row" gap={2}>
 {(['fetch', 'curl', 'axios'] as const).map((tab) => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={cn(
 "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
 activeTab === tab
 ? 'bg-muted text-background'
 : 'text-muted-foreground hover:text-background hover:bg-muted/50'
 )}
 >
 {tab.toUpperCase()}
 </button>
 ))}
 </Stack>
 <Button
 variant="ghost"
 size="sm"
 className="h-8 w-8 p-0 text-muted-foreground hover:text-background hover:bg-muted"
 onClick={handleCopy}
 >
 <Icons.copy className="w-4 h-4" />
 </Button>
 </Stack>
 <div className="p-4 overflow-x-auto">
 <pre className="text-xs font-mono text-blue-300 leading-relaxed font-medium">
 {code}
 </pre>
 </div>
 </div>
 );
};
