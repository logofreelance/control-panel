'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useIntegrationDocs } from '../hooks/useIntegrationDocs';
import { INTEGRATION_LABELS } from '../constants/ui-labels';
import { Icons } from '@/lib/config/client';
import { Card, CardContent, Button, Checkbox, Badge, Select } from '@/components/ui';
import { TargetLayout } from '@/components/layout/TargetLayout';
import { env } from '@/lib/env';
import { useParams } from 'next/navigation';
import { useTargetRegistry } from '@/features-internal/feature-target-registry/hooks/useTargetRegistry';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function IntegrationLayout() {
    const params = useParams();
    const nodeId = (params?.id as string) || '';
    const { targets } = useTargetRegistry();
    const currentTarget = targets.find(t => t.id === nodeId);
    
    // Fallback URL generation mirroring ApiKeysAndCorsView
    const getTargetApiUrlFallback = () => {
        let url = env.API_URL || 'http://localhost:3001/api';
        url = url.replace(':3001', ':3002');
        url = url.replace('backend-control-panel', 'backend-system');
        return url;
    };

    const rawTargetApiUrl = currentTarget?.apiEndpoint || getTargetApiUrlFallback();
    const targetApiUrls = useMemo(() => {
        return rawTargetApiUrl.split(',').map(url => {
            const trimmed = url.trim();
            // Optional: ensure '/api' postfix if not ends with it, matching other feature
            return trimmed.endsWith('/api') ? trimmed : `${trimmed.replace(/\/$/, '')}/api`;
        });
    }, [rawTargetApiUrl]);

    const [selectedApiUrl, setSelectedApiUrl] = useState('');

    useEffect(() => {
        if (targetApiUrls.length > 0 && (!selectedApiUrl || !targetApiUrls.includes(selectedApiUrl))) {
            setSelectedApiUrl(targetApiUrls[0]);
        }
    }, [targetApiUrls, selectedApiUrl]);

    const { docs, isLoading, error, fetchDocs } = useIntegrationDocs();
    const [copied, setCopied] = useState(false);
    
    // State to store which route indexes are selected
    const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(new Set());

    const allRoutes = useMemo(() => {
        if (!docs) return [];
        return [...docs.routes.static, ...docs.routes.dynamic];
    }, [docs]);

    // Select all by default once docs load
    useEffect(() => {
        fetchDocs();
    }, [fetchDocs]);

    useEffect(() => {
        if (allRoutes.length > 0 && selectedIndexes.size === 0) {
            setSelectedIndexes(new Set(allRoutes.map((_, i) => i)));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allRoutes]);

    const handleToggleRoute = (index: number) => {
        const next = new Set(selectedIndexes);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        setSelectedIndexes(next);
    };

    const handleToggleAll = (checked: boolean) => {
        if (checked) {
            setSelectedIndexes(new Set(allRoutes.map((_, i) => i)));
        } else {
            setSelectedIndexes(new Set());
        }
    };

    const generateAiPrompt = () => {
        if (!docs) return '';
        const filteredRoutes = allRoutes.filter((_, i) => selectedIndexes.has(i));
        
        let md = `> SYSTEM CONTEXT: This document provides the complete API specification and Database Schemas for the Backend System.\n`;
        md += `> ROLE: You are an advanced AI Code Assistant. Provide strict, strongly typed, and reliable client-side integrations based on the instructions below.\n\n`;

        // CHAPTER 1
        md += `=================================================\n`;
        md += ` CHAPTER 1: SETUP & CONNECTION\n`;
        md += `=================================================\n\n`;
        md += `### 1.1 Base API Endpoint\n`;
        md += `All requests MUST prefix routes with: \`${selectedApiUrl || docs.meta.baseUrl}\`\n`;
        md += `Content-Type MUST always be set to: \`application/json\`\n\n`;

        md += `### 1.2 Authentication (API Key Usage)\n`;
        md += `Unless a route is marked as PUBLIC, you MUST include the API Key header in your HTTP Requests:\n`;
        md += `\`\`\`json\n`;
        md += `{\n`;
        md += `  "${docs.authentication.headerName}": "<YOUR_VALID_API_KEY>"\n`;
        md += `}\n`;
        md += `\`\`\`\n\n`;

        md += `### 1.3 Target Node Routing (Required for Multi-Tenant)\n`;
        md += `If you are accessing a specific tenant node, ensure you also supply:\n`;
        md += `Header: \`x-target-id\` = "<target_node_id>"\n\n`;
        
        md += `### 1.4 Health Test\n`;
        md += `Before performing any complex mutations, perform a simple GET request to any basic endpoint (or '/' / '/health' if available) to ensure the network layers and API Keys provide a 200 OK connection.\n\n`;

        // Determine which schemas are actually needed by the selected routes
        const schemaIdsNeeded = new Set<string>();
        filteredRoutes.forEach(r => {
            if (r.handler_config) {
                try {
                    const cfg = JSON.parse(r.handler_config);
                    if (cfg.dataSourceId) schemaIdsNeeded.add(cfg.dataSourceId);
                } catch {}
            }
        });

        // CHAPTER 2
        md += `=================================================\n`;
        md += ` CHAPTER 2: DATABASE SCHEMAS & TYPESCRIPT TYPES\n`;
        md += `=================================================\n`;
        md += `> Reference these entities directly when parsing response payloads or framing request bodies.\n\n`;
        
        const dataSources = docs.dataSources || [];
        let schemaCount = 0;
        for (const ds of dataSources) {
            // Only include schema if it's referenced by chosen endpoints, 
            // OR if we broadly want all schemas (for safety, we'll narrow it down to used ones to save tokens if it's dynamic).
            if (!schemaIdsNeeded.has(ds.id?.toString() || '') && !schemaIdsNeeded.has(ds.id)) continue;
            
            const cols = docs.schemas[ds.id];
            if (cols && cols.length > 0) {
                schemaCount++;
                md += `export interface ${ds.table_name || 'Table'} {\n`;
                cols.forEach((col: any) => {
                    const name = col.Field || col.column_name;
                    const type = (col.Type || col.column_type || '').toLowerCase();
                    const isRequired = col.Null === 'NO' || col.is_nullable === 'NO';
                    
                    let tsType = 'string';
                    if (type.includes('int') || type.includes('decimal') || type.includes('float') || type.includes('double')) tsType = 'number';
                    if (type.includes('tinyint(1)') || type.includes('boolean')) tsType = 'boolean';
                    if (type.includes('json')) tsType = 'Record<string, any> | any[]';
                    
                    md += `  ${name}${isRequired ? '' : '?'}: ${tsType}; // MySQL Type: ${col.Type || col.column_type}\n`;
                });
                md += `}\n\n`;
            }
        }
        if (schemaCount === 0) {
            md += `// No specific database schemas required for the selected routes.\n\n`;
        }

        // CHAPTER 3
        md += `=================================================\n`;
        md += ` CHAPTER 3: API ROUTES & ENDPOINTS\n`;
        md += `=================================================\n\n`;

        filteredRoutes.forEach((r, idx) => {
            const method = (r.method || 'GET').toUpperCase();
            const path = r.route_path || r.endpoint || '/';
            let description = r.description || '';
            let reqBodySchema = null;
            let resSuccessSchema = 'unknown';

            if (!description && r.metadata) {
                try { description = JSON.parse(r.metadata).description || ''; } catch {}
            }

            if (r.handler_config) {
                try {
                    const cfg = JSON.parse(r.handler_config);
                    if (cfg.dataSourceId && docs.schemas[cfg.dataSourceId]) {
                        const dsName = dataSources.find((d: any) => d.id === cfg.dataSourceId)?.table_name || 'any';
                        if (method === 'POST') reqBodySchema = `Omit<${dsName}, 'id' | 'created_at' | 'updated_at'>`;
                        if (method === 'PUT' || method === 'PATCH') reqBodySchema = `Partial<${dsName}>`;
                        
                        if (method === 'GET') {
                            resSuccessSchema = path.includes('/:id') ? dsName : `${dsName}[]`;
                        } else {
                            resSuccessSchema = method === 'DELETE' ? 'boolean' : dsName;
                        }
                    }
                } catch {}
            }

            md += `### ${idx + 1}. [${method}] ${path}\n`;
            md += `**A. Relative Path:** \`${method} ${path}\`\n`;
            
            // Fix double /api redundancy
            const baseUrl = selectedApiUrl || docs.meta.baseUrl;
            const fullUrl = baseUrl.endsWith('/api') && path.startsWith('/api') 
                ? `${baseUrl}${path.substring(4)}` 
                : `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

            md += `**B. Full URL:** \`${method} ${fullUrl}\`\n`;
            md += `**Description:** ${description || 'No description provided.'}\n\n`;

            // Request Spec
            md += `#### C. Request Specification\n`;
            md += `- **Headers Required**: ${r.is_public ? 'None (Public Route)' : `\`${docs.authentication.headerName}\``}\n`;
            
            const pathParams = path.match(/\/:([a-zA-Z0-9_]+)/g);
            if (pathParams) {
                md += `- **Path Variables**:\n`;
                pathParams.forEach((pt: string) => {
                    md += `  - \`${pt.replace('/:', '')}\` (string|number)\n`;
                });
            } else {
                md += `- **Path Variables**: None\n`;
            }

            md += `- **Payload Request Body**:\n`;
            if (reqBodySchema) {
                md += `  Expects exact match. Use interface:\n  \`\`\`typescript\n  ${reqBodySchema}\n  \`\`\`\n`;
            } else {
                 md += `  ${Object.keys({}).length === 0 && ['POST', 'PUT', 'PATCH'].includes(method) ? 'Requires valid JSON payload.' : 'None (Empty Body expected)'}\n`;
            }

            // Response Spec
            md += `\n#### D. Response Data Produced\n`;
            md += `- **Success Response (2xx HTTP Status)**\n`;
            md += `  \`\`\`typescript\n`;
            md += `  {\n`;
            md += `    "status": "success",\n`;
            md += `    "data": ${resSuccessSchema}\n`;
            md += `  }\n`;
            md += `  \`\`\`\n\n`;
            
            md += `- **Error Response (4xx/5xx HTTP Status)**\n`;
            md += `  \`\`\`typescript\n`;
            md += `  {\n`;
            md += `    "status": "error",\n`;
            md += `    "message": string // Reason for failure\n`;
            md += `  }\n`;
            md += `  \`\`\`\n\n`;
            md += `---\n\n`;
        });
        
        md += `=================================================\n`;
        md += ` END OF DOCUMENTATION\n`;
        md += `=================================================\n`;

        return md;
    };

    const handleCopyAll = () => {
        navigator.clipboard.writeText(generateAiPrompt());
        setCopied(true);
        toast.success('AI Context Prompt copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <TargetLayout>
                <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                    <Icons.loading className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-muted-foreground animate-pulse leading-none lowercase">generating ai context definitions...</p>
                </div>
            </TargetLayout>
        );
    }

    if (error || !docs) {
        return (
            <TargetLayout>
                <div className="p-8">
                    <Card className="bg-destructive/10 border-none shadow-none">
                        <CardContent className="p-10 flex flex-col items-center gap-6 text-center">
                            <Icons.alertTriangle className="size-16 text-destructive" />
                            <div className="space-y-4">
                                <h3 className="font-semibold text-2xl lowercase leading-none">failed to load specifications</h3>
                                <p className="text-muted-foreground text-lg lowercase">{error}</p>
                            </div>
                            <Button variant="outline" onClick={fetchDocs} className="lowercase rounded-xl text-destructive border-transparent bg-destructive/20 hover:bg-destructive/30">
                                try again
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </TargetLayout>
        );
    }

    const aiPrompt = generateAiPrompt();
    const allChecked = selectedIndexes.size === allRoutes.length;
    const isIndeterminate = selectedIndexes.size > 0 && selectedIndexes.size < allRoutes.length;

    return (
        <TargetLayout>
            <div className="relative font-instrument min-h-screen">
                <div className="flex flex-col xl:flex-row h-full w-full max-w-7xl mx-auto gap-8 p-4 md:p-8 pb-32 items-start">
                    
                    {/* Left Column: Configuration & Selection */}
                    <div className="flex flex-col gap-6 w-full xl:w-80 shrink-0 sticky top-24">
                        <header className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground lowercase flex items-center gap-3">
                                <Icons.terminal className="size-8 text-primary" />
                                ai context
                            </h1>
                            <p className="text-muted-foreground text-sm lowercase mt-1 leading-relaxed">
                                pilih endpoint yang ingin diintegrasikan. token ai terbatas, jadi pilih yang diperlukan saja.
                            </p>
                        </header>

                        <Card className="shadow-none overflow-hidden rounded-2xl">
                            <CardContent className="p-0">
                                {targetApiUrls.length > 1 && (
                                    <div className="p-3 border-b border-border/40 bg-background/50 flex flex-col gap-2">
                                        <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-1">
                                            Target Base URL
                                        </label>
                                        <Select
                                            value={selectedApiUrl}
                                            onChange={(e) => setSelectedApiUrl(e.target.value)}
                                            options={targetApiUrls.map(url => ({ label: url, value: url }))}
                                            className="w-full h-10 bg-muted/40 font-mono text-sm"
                                        />
                                    </div>
                                )}
                                <div className="p-3 bg-muted/40 border-b border-border/40 flex items-center gap-3">
                                    <Checkbox 
                                        checked={allChecked}
                                        onCheckedChange={handleToggleAll} 
                                        id="check-all"
                                    />
                                    <label htmlFor="check-all" className="text-sm font-medium lowercase cursor-pointer">
                                        select all endpoints
                                    </label>
                                </div>
                                <div className="flex flex-col max-h-[60vh] overflow-y-auto p-1 custom-scrollbar">
                                    {allRoutes.length === 0 && <div className="p-4 text-center text-sm text-muted-foreground">No routes</div>}
                                    
                                    {/* Categorized Static Routes */}
                                    {docs.routes.static.length > 0 && (
                                        <div className="mb-4">
                                            {Object.entries(
                                                docs.routes.static.reduce((acc: any, r: any) => {
                                                    const cat = r.category || 'Other';
                                                    if (!acc[cat]) acc[cat] = [];
                                                    acc[cat].push(r);
                                                    return acc;
                                                }, {})
                                            ).map(([category, routes]: [string, any]) => (
                                                <div key={category} className="mb-4">
                                                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 bg-muted/20 rounded-md mb-2">
                                                        {category}
                                                    </div>
                                                    {routes.map((r: any) => {
                                                        const globalIdx = allRoutes.findIndex(ar => ar.id === r.id && ar.route_path === r.route_path);
                                                        const method = (r.method || 'GET').toUpperCase();
                                                        const path = r.route_path || r.endpoint || '/';
                                                        let methodColor = 'bg-primary/10 text-primary';
                                                        if (method === 'POST') methodColor = 'bg-green-500/10 text-green-600';
                                                        if (method === 'PUT' || method === 'PATCH') methodColor = 'bg-yellow-500/10 text-yellow-600';
                                                        if (method === 'DELETE') methodColor = 'bg-red-500/10 text-red-600';

                                                        return (
                                                            <div key={r.id || path} className="flex items-start gap-2.5 p-2 hover:bg-muted/30 rounded-lg transition-colors group">
                                                                <Checkbox 
                                                                    checked={selectedIndexes.has(globalIdx)}
                                                                    onCheckedChange={() => handleToggleRoute(globalIdx)}
                                                                    className="mt-0.5"
                                                                    id={`route-${r.id || path}`}
                                                                />
                                                                <label htmlFor={`route-${r.id || path}`} className="flex flex-col gap-1 cursor-pointer w-full overflow-hidden">
                                                                    <div className="flex items-center gap-2">
                                                                        <Badge variant="outline" className={cn("text-[8px] font-mono leading-none px-1 py-0 border-transparent", methodColor)}>
                                                                            {method}
                                                                        </Badge>
                                                                        <span className="text-xs font-mono truncate">{path}</span>
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Dynamic Routes Section */}
                                    {docs.routes.dynamic.length > 0 && (
                                        <div>
                                            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 bg-muted/20 rounded-md mb-2">
                                                Dynamic Routes (Database)
                                            </div>
                                            {docs.routes.dynamic.map((r, i) => {
                                                const idx = docs.routes.static.length + i; // Index in allRoutes
                                                const method = (r.method || 'GET').toUpperCase();
                                                const path = r.route_path || r.endpoint || '/';
                                                let methodColor = 'bg-primary/10 text-primary';
                                                if (method === 'POST') methodColor = 'bg-green-500/10 text-green-600';
                                                if (method === 'PUT' || method === 'PATCH') methodColor = 'bg-yellow-500/10 text-yellow-600';
                                                if (method === 'DELETE') methodColor = 'bg-red-500/10 text-red-600';

                                                return (
                                                    <div key={`dynamic-${i}`} className="flex items-start gap-2.5 p-2 hover:bg-muted/30 rounded-lg transition-colors group">
                                                        <Checkbox 
                                                            checked={selectedIndexes.has(idx)}
                                                            onCheckedChange={() => handleToggleRoute(idx)}
                                                            className="mt-0.5"
                                                            id={`route-dynamic-${i}`}
                                                        />
                                                        <label htmlFor={`route-dynamic-${i}`} className="flex flex-col gap-1 cursor-pointer w-full overflow-hidden">
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className={cn("text-[8px] font-mono leading-none px-1 py-0 border-transparent", methodColor)}>
                                                                    {method}
                                                                </Badge>
                                                                <span className="text-xs font-mono truncate">{path}</span>
                                                            </div>
                                                        </label>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Terminal View */}
                    <div className="flex flex-col gap-6 w-full flex-1 min-w-0">
                        <div className="flex items-center justify-end">
                            <Button 
                                onClick={handleCopyAll} 
                                size="lg" 
                                disabled={selectedIndexes.size === 0}
                                className={cn(
                                    "rounded-xl flex-shrink-0 h-12 px-6 shadow-sm transition-all lowercase w-full sm:w-auto",
                                    copied ? "bg-green-500 text-white hover:bg-green-600" : ""
                                )}
                            >
                                {copied ? <Icons.check className="size-4 mr-2" /> : <Icons.copy className="size-4 mr-2" />}
                                {copied ? 'copied to clipboard' : `copy prompt (${selectedIndexes.size} routes)`}
                            </Button>
                        </div>

                        <Card className="w-full shadow-none overflow-hidden h-full flex flex-col">
                            <CardContent className="p-0 flex-1 flex flex-col">
                                <div className="flex items-center px-4 py-3 bg-muted/50 border-b border-border/40 gap-2 shrink-0">
                                    <div className="size-3 rounded-full bg-border" />
                                    <div className="size-3 rounded-full bg-border" />
                                    <div className="size-3 rounded-full bg-border" />
                                    <span className="ml-4 font-mono text-xs text-muted-foreground mr-auto">system_context.prompt</span>
                                    {selectedIndexes.size === 0 && <Badge variant="secondary" className="text-xs font-mono text-destructive">No routes selected</Badge>}
                                </div>
                                <div className="p-6 overflow-x-auto min-h-[50vh] max-h-[80vh] custom-scrollbar bg-background">
                                    <pre className="font-mono text-sm leading-relaxed text-foreground whitespace-pre-wrap selection:bg-primary/20">
                                        {aiPrompt}
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </TargetLayout>
    );
}
