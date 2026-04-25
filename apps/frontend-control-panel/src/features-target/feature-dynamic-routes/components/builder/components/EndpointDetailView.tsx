'use client';

import { useState } from 'react';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { Icons } from '../../../config/icons';
import { DYNAMIC_ROUTES_LABELS } from '../../../constants/ui-labels';
import { useEndpointDetail } from '../composables/useEndpointDetail';
import { cn } from '@/lib/utils';

const JSON_CONTENT_TYPE = 'application/json';

interface EndpointDetailViewProps {
  targetId: string;
  endpointId: string;
  onNavigate?: (view: string, endpointId?: string) => void;
  onBack?: () => void;
}

export const EndpointDetailView = ({
  targetId,
  endpointId,
  onNavigate,
  onBack,
}: EndpointDetailViewProps) => {
  const L = DYNAMIC_ROUTES_LABELS.routeBuilder;
  const { 
    endpoint, dataSource, columns, resource, 
    targetApiUrls = [], selectedBaseUrlIndex = 0, setSelectedBaseUrlIndex,
    getFullUrl, getCodeExamples 
  } = useEndpointDetail(targetId, endpointId);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'javascript' | 'python'>('curl');

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };


  if (!endpoint) {
    return (
      <div className="text-center py-20">
        <div className="size-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icons.warning className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <p className="text-muted-foreground/60 lowercase">
          {L.misc?.noEndpointsOne || 'endpoint not found'}
        </p>
      </div>
    );
  }

  const fullUrl = getFullUrl();
  const codeExamples = getCodeExamples();

  const getRoleLevelLabel = (level: number) => {
    if (level === 0) return L.options?.public || 'public';
    if (level < 50) return L.options?.login || 'login required';
    if (level < 90) return L.options?.moderator || 'moderator';
    return L.options?.admin || 'admin only';
  };

  const parseJsonArray = (str?: any): string[] => {
    if (!str) return [];
    if (Array.isArray(str)) return str;
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  };

  const parseJsonObject = (str?: any): Record<string, string> => {
    if (!str) return {};
    if (typeof str === 'object' && !Array.isArray(str)) return str;
    try {
      return JSON.parse(str);
    } catch {
      return {};
    }
  };

  const writableFields = parseJsonArray(endpoint.writableFields);
  const protectedFields = parseJsonArray(endpoint.protectedFields);
  const autoPopulateFields = parseJsonObject(endpoint.autoPopulateFields);
  const filterableFields = parseJsonArray(endpoint.filterableFields);
  const sortableFields = parseJsonArray(endpoint.sortableFields);
  const validationRules = parseJsonObject(endpoint.validationRules);
  const errorTemplates = parseJsonObject(endpoint.errorTemplatesJson);

  // AI Manifest Generator (Structured for Prompt Engineering)
  const generateManifest = (includeIntroduction = true) => {
    const pieces = [];
    if (includeIntroduction) {
      pieces.push(`--- API INTEGRATION BRIEF ---`);
      pieces.push(`ACT AS AN API CLIENT. INTEGRATE THE FOLLOWING ENDPOINT:`);
    }
    
    pieces.push(`URL: ${fullUrl}`);
    pieces.push(`METHOD: ${endpoint.method}`);
    pieces.push(`STATUS: ${endpoint.isActive ? 'ACTIVE' : 'INACTIVE'}`);
    
    if (endpoint.description) {
       pieces.push(`DESCRIPTION: ${endpoint.description}`);
    }

    if (endpoint.method === 'GET') {
      pieces.push(`SOURCE: ${dataSource?.name || 'internal'}`);
      if (endpoint.allowDynamicPagination) pieces.push(`PAGINATION: ENABLED (DEFAULT LIMIT: ${endpoint.defaultLimit || 20}).`);
      if (endpoint.allowDynamicFilters && filterableFields.length > 0) pieces.push(`FILTERABLE COLUMNS: ${filterableFields.join(', ')}.`);
      if (endpoint.allowDynamicSort && sortableFields.length > 0) pieces.push(`SORTABLE COLUMNS: ${sortableFields.join(', ')}.`);
      if (endpoint.allowDetailView) pieces.push(`DETAIL LOOKUP: ENABLED (VIA '${endpoint.lookupColumn || 'id'}').`);
    } else {
      pieces.push(`OPERATION: ${endpoint.operationType || 'create'} ON SOURCE '${dataSource?.name || 'internal'}'`);
      if (endpoint.allowOwnerOnly) pieces.push(`SECURITY: OWNERSHIP RESTRICTED (REF COLUMN: '${endpoint.ownershipColumn || 'user_id'}').`);
      if (writableFields.length > 0) {
        let bodyText = `EXPECTED JSON BODY: ${writableFields.join(', ')}.`;
        
        // Add Relational Save Info for AI
        try {
          const relations = JSON.parse(resource?.relations_json || resource?.relationsJson || '{}');
          const relNames = Object.entries(relations)
            .filter(([k, v]: [string, any]) => isNaN(Number(k)) && v && (v.targetId || v.table))
            .map(([k]) => k);
            
          if (relNames.length > 0) {
            bodyText += ` DEEP SAVE SUPPORTED FOR RELATIONS: [${relNames.join(', ')}].`;
          }
        } catch { /* ignore */ }

        pieces.push(bodyText);
        if (Object.keys(validationRules).length > 0) {
          pieces.push(`VALIDATION RULES: ${JSON.stringify(validationRules)}`);
        }
      }
    }

    const access = getRoleLevelLabel(endpoint.minRoleLevel || 0);
    pieces.push(`AUTH LEVEL: ${access}`);
    if (endpoint.roles) pieces.push(`REQUIRED ROLES: ${endpoint.roles}`);
    if (endpoint.permissions) pieces.push(`REQUIRED PERMISSIONS: ${endpoint.permissions}`);
    
    if (endpoint.responseData || resource || columns.length > 0) {
       const fieldPieces = [];
       if (resource) {
         try {
           const fields = JSON.parse(resource.fields_json || resource.fieldsJson || '[]');
           if (fields.length > 0) {
             fieldPieces.push(`BASE FIELDS: [${fields.join(', ')}]`);
           } else if (columns.length > 0) {
             fieldPieces.push(`BASE FIELDS (ALL): [${columns.map(c => c.name || c.Field || c.column_name).join(', ')}]`);
           }
           
           const computed = JSON.parse(resource.computed_json || resource.computedJson || '[]');
           if (computed.length > 0) fieldPieces.push(`COMPUTED FIELDS: [${computed.map((c: any) => c.name).join(', ')}]`);
           
           const aggregates = JSON.parse(resource.aggregates_json || resource.aggregatesJson || '[]');
           if (aggregates.length > 0) fieldPieces.push(`AGGREGATES: [${aggregates.map((a: any) => a.alias || a.function).join(', ')}]`);
           
           const relations = JSON.parse(resource.relations_json || resource.relationsJson || '{}');
           const seen = new Set();
           const relPieces = Object.entries(relations)
             .map(([key, config]: [string, any]) => {
                // EXTREME CLEANING: Skip if key is numeric OR config is missing targetId/name
                if (!isNaN(Number(key))) return null;
                if (!config || (!config.targetId && !config.table)) return null;

                const alias = key; 
                if (seen.has(alias)) return null;
                seen.add(alias);

                const subFields = Array.isArray(config.fields) ? `(${config.fields.join(', ')})` : '(all)';
                return `${alias} ${subFields}`;
             })
             .filter(Boolean);
             
           if (relPieces.length > 0) fieldPieces.push(`EAGER RELATIONS: [${relPieces.join(', ')}]`);
         } catch { fieldPieces.push(`DATA: ALL RESOURCE FIELDS`); }
       } else if (columns.length > 0) {
         fieldPieces.push(`DATA: [${columns.map(c => c.name || c.Field || c.column_name).join(', ')}]`);
       }
       
       pieces.push(`RESPONSE STRUCTURE: ${fieldPieces.join(' | ')}`);
    }
    
    return pieces.join('\n');
  };

  return (
    <div className="space-y-6 pb-20 animate-page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {endpoint.method.toLowerCase()}
              </Badge>
              <Badge variant={endpoint.isActive ? "default" : "outline"}>
                {endpoint.isActive ? L.labels?.active : L.labels?.inactive}
              </Badge>
              {endpoint.categoryId && (
                <Badge variant="outline" className="opacity-60">
                  {L.labels?.categories || 'categorized'}
                </Badge>
              )}
            </div>
            <TextHeading as="h1" size="h3" className="lowercase">
              {endpoint.path}
            </TextHeading>
          </div>
          {endpoint.description && (
            <p className="text-xl text-muted-foreground max-w-3xl lowercase font-normal leading-relaxed">
              {endpoint.description}
            </p>
          )}
        </div>
        <div className="flex flex-row items-center gap-2">
          <Button
            variant="outline"
            onClick={() => onBack?.()}
          >
            <Icons.arrowLeft className="size-4 mr-2" />
            {L.buttons?.back || 'back'}
          </Button>
          <Button
            variant="default"
            onClick={() => onNavigate?.('editor', endpointId)}
          >
            <Icons.edit className="size-4 mr-2" />
            {L.buttons?.edit || 'edit'}
          </Button>
        </div>
      </div>

      {/* AI AGENT MANIFEST */}
      <Card className="bg-primary/5 border-primary/10 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Icons.sparkles className="size-16 text-primary" />
        </div>
        <CardContent className="py-6">
          <div className="flex items-center justify-between gap-2 mb-6">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-primary/10 rounded-xl">
                 <Icons.sparkles className="size-5 text-primary" />
               </div>
               <TextHeading size="h5" className="text-primary font-bold lowercase tracking-tight">AI Integration Brief</TextHeading>
             </div>
             <Button 
               variant="outline" 
               className="bg-background border-primary/20 text-primary hover:bg-primary/5 h-10 px-4 lowercase text-base"
               onClick={() => copyToClipboard(generateManifest(true), 'manifest')}
             >
                {copiedField === 'manifest' ? (
                  <><Icons.check className="size-4 mr-2" /> copied</>
                ) : (
                  <><Icons.copy className="size-4 mr-2" /> copy for ai</>
                )}
             </Button>
          </div>
          <div className="bg-background/40 backdrop-blur-sm border border-primary/5 rounded-2xl p-6">
             <pre className="text-lg font-normal text-foreground/80 leading-relaxed lowercase whitespace-pre-wrap font-sans">
               {generateManifest(false)}
             </pre>
          </div>
        </CardContent>
      </Card>

      {/* Quick Copy URL */}
      <Card size="sm">
        <CardContent>
          <div className="flex flex-row items-center justify-between gap-4 py-2">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1">
                <p className="text-lg font-normal text-muted-foreground lowercase">
                  {L.detail?.fullUrl || 'access url'}
                </p>
                {targetApiUrls.length > 0 && (
                  <select
                    value={String(selectedBaseUrlIndex)}
                    onChange={(e) => setSelectedBaseUrlIndex?.(Number(e.target.value))}
                    disabled={targetApiUrls.length === 1}
                    className="h-8 text-base text-muted-foreground w-auto bg-transparent border border-border/50 rounded-lg px-2 py-0 outline-none cursor-pointer hover:border-border transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {targetApiUrls.map((url: string, i: number) => (
                      <option key={i} value={i} className="text-foreground bg-background">
                        {url}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="text-xl text-foreground break-all">{fullUrl}</div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(fullUrl, 'url')}
            >
              {copiedField === 'url' ? (
                <Icons.check className="size-4 text-primary" />
              ) : (
                <Icons.copy className="size-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Integration Status */}
          <Card>
            <CardContent>
              <div className="flex flex-row items-center gap-3 mb-6">
                <Icons.database className="size-5 text-primary" />
                <TextHeading as="h3" size="h4" className="lowercase">
                  {L.detail?.integration || 'integration'}
                </TextHeading>
              </div>
              <div className="space-y-6">
                <div className="flex flex-row justify-between items-center gap-2">
                  <p className="text-lg text-muted-foreground lowercase">
                    {L.detail?.method || 'method'}
                  </p>
                  <Badge variant="secondary">
                    {endpoint.method.toLowerCase()}
                  </Badge>
                </div>
                
                {dataSource && (
                  <div className="flex flex-row justify-between items-center gap-2 border-t border-border/5 pt-4">
                    <p className="text-lg text-muted-foreground lowercase">
                      {L.labels?.dataSource || 'source'}
                    </p>
                    <p className="text-lg font-normal text-foreground lowercase">
                      {dataSource.name}
                    </p>
                  </div>
                )}
                {resource && (
                  <div className="flex flex-row justify-between items-center gap-2 border-t border-border/5 pt-4">
                    <p className="text-lg text-muted-foreground lowercase">
                      {L.labels?.resource || 'resource'}
                    </p>
                    <p className="text-lg font-normal text-foreground lowercase">
                      {resource.name}
                    </p>
                  </div>
                )}

                {/* GET SPECIFIC: Query Settings */}
                {endpoint.method === 'GET' && (
                  <div className="space-y-4 border-t border-border/5 pt-4">
                    <TextHeading as="h4" size="h5" className="lowercase mb-4">
                      {L.querySettings?.title || 'query configuration'}
                    </TextHeading>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/5">
                        <div className="flex items-center gap-3">
                          <Icons.list className="size-5 text-muted-foreground" />
                          <span className="text-lg lowercase">pagination</span>
                        </div>
                        <Badge variant={endpoint.allowDynamicPagination ? 'default' : 'secondary'} className="lowercase">
                          {endpoint.allowDynamicPagination ? `enabled (limit: ${endpoint.defaultLimit || 20})` : 'disabled'}
                        </Badge>
                      </div>

                      <div className="flex flex-col gap-2 p-3 rounded-xl bg-muted/20 border border-border/5">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icons.filter className="size-5 text-muted-foreground" />
                              <span className="text-lg lowercase">filtering</span>
                            </div>
                            <Badge variant={endpoint.allowDynamicFilters ? 'default' : 'secondary'} className="lowercase">
                              {endpoint.allowDynamicFilters ? 'enabled' : 'disabled'}
                            </Badge>
                         </div>
                         {endpoint.allowDynamicFilters && filterableFields.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                               {filterableFields.map(f => (
                                 <Badge key={f} variant="outline" className="text-xs py-0.5 px-2 h-6 bg-background">{f}</Badge>
                               ))}
                            </div>
                         )}
                      </div>

                      <div className="flex flex-col gap-2 p-3 rounded-xl bg-muted/20 border border-border/5">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icons.settings className="size-5 text-muted-foreground" />
                              <span className="text-lg lowercase">sorting</span>
                            </div>
                            <Badge variant={endpoint.allowDynamicSort ? 'default' : 'secondary'} className="lowercase">
                              {endpoint.allowDynamicSort ? 'enabled' : 'disabled'}
                            </Badge>
                         </div>
                         {endpoint.allowDynamicSort && sortableFields.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                               {sortableFields.map(f => (
                                 <Badge key={f} variant="outline" className="text-xs py-0.5 px-2 h-6 bg-background">{f}</Badge>
                               ))}
                            </div>
                         )}
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/5">
                        <div className="flex items-center gap-3">
                          <Icons.search className="size-5 text-muted-foreground" />
                          <span className="text-lg lowercase">detail view</span>
                        </div>
                        <Badge variant={endpoint.allowDetailView ? 'default' : 'secondary'} className="lowercase">
                          {endpoint.allowDetailView ? `enabled (via ${endpoint.lookupColumn || 'id'})` : 'disabled'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* WRITE SPECIFIC: Mutation Settings */}
                {endpoint.method !== 'GET' && (
                   <div className="space-y-4 border-t border-border/5 pt-4">
                      <div className="flex items-center justify-between">
                        <TextHeading as="h4" size="h5" className="lowercase">
                          {L.detail?.mutationRules || 'mutation details'}
                        </TextHeading>
                        <Badge variant="secondary" className="lowercase">{endpoint.operationType || 'create'}</Badge>
                      </div>

                      <div className="p-3 rounded-xl bg-muted/20 border border-border/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-lg lowercase">ownership security</span>
                          <Badge variant={endpoint.allowOwnerOnly ? 'default' : 'secondary'} className="lowercase">
                            {endpoint.allowOwnerOnly ? 'restricted' : 'bypassed'}
                          </Badge>
                        </div>
                        {endpoint.allowOwnerOnly && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 p-2 rounded-lg">
                            <span className="opacity-50">ref column:</span>
                            <span className="text-foreground">{endpoint.ownershipColumn || 'user_id'}</span>
                          </div>
                        )}
                      </div>

                    {(writableFields.length > 0 || protectedFields.length > 0 || Object.keys(autoPopulateFields).length > 0) && (
                      <div className="space-y-4 pt-2">
                        {writableFields.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-normal text-muted-foreground lowercase px-1">
                              {L.detail?.writableFields || 'writable fields'}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {writableFields.map((field) => (
                                <Badge key={field} variant="default" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-3 min-h-6 py-1 lowercase text-xs">
                                  {field}
                                  {validationRules[field] && (
                                    <span className="ml-1.5 opacity-40">[{validationRules[field]}]</span>
                                  )}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {protectedFields.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-normal text-muted-foreground lowercase px-1">
                              {L.detail?.protectedFields || 'protected fields'}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {protectedFields.map((field) => (
                                <Badge key={field} variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 px-3 py-1 min-h-6 lowercase text-xs">
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {Object.keys(autoPopulateFields).length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-normal text-muted-foreground lowercase px-1">
                              {L.detail?.autoPopulateFields || 'auto-injections'}
                            </p>
                            <div className="flex flex-col gap-1 w-full">
                              {Object.entries(autoPopulateFields).map(([field, value]) => (
                                <div key={field} className="flex flex-row items-center justify-between text-xs bg-muted/40 rounded-lg px-3 py-2.5">
                                  <span className="text-primary">{field}</span>
                                  <span className="text-muted-foreground opacity-30 font-sans">{L.misc?.arrow || '→'}</span>
                                  <span className="text-foreground">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                   </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardContent>
              <div className="flex flex-row items-center gap-3 mb-6">
                <Icons.lock className="size-5 text-primary" />
                <TextHeading as="h3" size="h4" className="lowercase">
                  {L.detail?.security || 'access & permissions'}
                </TextHeading>
              </div>
              <div className="space-y-6">
                <div className="flex flex-row justify-between items-center gap-2">
                  <p className="text-lg text-muted-foreground lowercase">
                    {L.misc?.accessLevel || 'minimum access'}
                  </p>
                  <Badge variant="secondary" className="lowercase font-semibold">
                    {getRoleLevelLabel(endpoint.minRoleLevel ?? 0)}
                  </Badge>
                </div>
                {endpoint.roles && (
                  <div className="space-y-3 border-t border-border/5 pt-4">
                    <p className="text-lg font-normal text-muted-foreground lowercase">
                      {L.labels?.roles || 'required roles'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {endpoint.roles.split(',').map((role: string) => (
                        <Badge
                          key={role}
                          variant="outline"
                          className="lowercase"
                        >
                          {role.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {endpoint.permissions && (
                  <div className="space-y-3 border-t border-border/5 pt-4">
                    <p className="text-lg font-normal text-muted-foreground lowercase">
                      {L.labels?.permissions || 'required permissions'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {endpoint.permissions.split(',').map((perm: string) => (
                        <Badge
                          key={perm}
                          variant="outline"
                          className="lowercase"
                        >
                          {perm.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Code Examples */}
          <Card>
            <CardContent>
              <div className="flex flex-row items-center gap-3 mb-6">
                <Icons.code className="size-5 text-primary" />
                <TextHeading as="h3" size="h4" className="lowercase">
                  {L.detail?.codeExamples || 'request blueprints'}
                </TextHeading>
              </div>

              {/* Tab Buttons */}
              <div className="flex flex-row gap-1 bg-muted p-1 rounded-xl mb-4">
                {(['curl', 'javascript', 'python'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCodeTab(tab)}
                    className={cn(
                      'flex-1 px-4 py-2.5 rounded-lg text-lg transition-all lowercase',
                      activeCodeTab === tab
                        ? 'bg-background text-primary font-normal shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Code Block */}
              <div className="relative group">
                <div className="bg-muted p-4 rounded-xl overflow-hidden border border-border/5">
                  <div className="text-base text-foreground overflow-x-auto scrollbar-none leading-relaxed whitespace-pre">
                    {codeExamples[activeCodeTab]}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(codeExamples[activeCodeTab], activeCodeTab)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all bg-background border-border/50"
                >
                  {copiedField === activeCodeTab ? (
                    <Icons.check className="size-4 text-primary" />
                  ) : (
                    <Icons.copy className="size-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Response Template & Error Responses */}
          <Card>
            <CardContent>
               <div className="flex flex-row items-center gap-3 mb-6">
                  <Icons.fileCode className="size-5 text-primary" />
                  <TextHeading as="h3" size="h4" className="lowercase">
                    {L.detail?.responseTemplate || 'response library'}
                  </TextHeading>
                </div>
                
                <div className="space-y-6">
                    {/* Success Template */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <div className="flex flex-col">
                           <span className="text-lg text-muted-foreground lowercase">status: 200 ok</span>
                           <span className="text-xs text-muted-foreground/40 lowercase">
                             {resource ? `based on resource: ${resource.name}` : dataSource ? `based on table: ${dataSource.tableName}` : 'preset template'}
                           </span>
                         </div>
                         <Button variant="ghost" size="sm" className="h-6 lowercase text-sm" onClick={() => {
                            const json = document.getElementById('json-response-sample')?.innerText;
                            if (json) copyToClipboard(json, 'schema');
                         }}>copy</Button>
                      </div>
                      <div className="bg-muted p-4 rounded-xl relative group border border-border/5">
                        <div id="json-response-sample" className="text-base text-foreground overflow-x-auto scrollbar-none leading-relaxed whitespace-pre max-h-[500px]">
                          {(() => {
                              // HELPER: BUILD OBJECT FROM RESOURCE DEFINITION
                              const buildResourceObject = (res: any) => {
                                const obj: any = {};
                                
                                // 1. Base Fields
                                try {
                                  const fields = JSON.parse(res.fields_json || res.fieldsJson || '[]');
                                  if (Array.isArray(fields) && fields.length > 0) {
                                    fields.forEach(f => { obj[f] = 'value'; });
                                  } else if (columns.length > 0) {
                                    // Fallback to all columns if fields_json is empty (SELECT *)
                                    columns.forEach((col: any) => {
                                      obj[col.name || col.Field || col.column_name] = `value (${col.type || col.Type || 'any'})`;
                                    });
                                  }
                                } catch {}

                                // 2. Computed Fields
                                try {
                                  const computed = JSON.parse(res.computed_json || res.computedJson || '[]');
                                  if (Array.isArray(computed)) {
                                    computed.forEach(c => { if (c.name) obj[c.name] = `computed(${c.expression})`; });
                                  }
                                } catch {}

                                // 3. Aggregates
                                try {
                                  const aggregates = JSON.parse(res.aggregates_json || res.aggregatesJson || '[]');
                                  if (Array.isArray(aggregates)) {
                                    aggregates.forEach(a => { 
                                      const name = a.alias || `${a.function.toLowerCase()}_${a.column === '*' ? 'total' : a.column}`;
                                      obj[name] = 0; 
                                    });
                                  }
                                } catch {}

                                // 4. Relations (Eager Loading)
                                try {
                                  const relations = JSON.parse(res.relations_json || res.relationsJson || '{}');
                                  if (relations && typeof relations === 'object') {
                                    const seenAliases = new Set<string>();
                                    Object.entries(relations).forEach(([key, config]: [string, any]) => {
                                      // EXTREME CLEANING: Skip if key is numeric OR config is missing targetId/table
                                      if (!isNaN(Number(key))) return;
                                      if (!config || (!config.targetId && !config.table)) return;

                                      const alias = key;
                                      
                                      // Skip if we already processed this relation
                                      if (seenAliases.has(alias)) return;
                                      seenAliases.add(alias);
                                      
                                      const relObj: any = {};
                                      if (Array.isArray(config.fields)) {
                                        config.fields.forEach((f: string) => { relObj[f] = 'value'; });
                                      }
                                      // Note: nesting depth limited for preview
                                      obj[alias] = config.type === 'HAS_MANY' ? [relObj] : relObj;
                                    });
                                  }
                                } catch {}

                                return Object.keys(obj).length > 0 ? obj : null;
                              };

                              let finalObj: any = null;

                              // CASE 1: RESOURCE BASED RESPONSE
                              if (resource) {
                                finalObj = buildResourceObject(resource);
                              }

                              // CASE 2: TABLE BASED RESPONSE FALLBACK
                              if (!finalObj && columns && columns.length > 0) {
                                finalObj = {};
                                columns.forEach((col: any) => {
                                  finalObj[col.name || col.Field || col.column_name] = `value (${col.type || col.Type || 'any'})`;
                                });
                              }
                              
                              // CASE 3: STATIC FALLBACK
                              if (!finalObj) {
                                try {
                                  finalObj = JSON.parse(endpoint.responseData || '{}');
                                } catch {
                                  return endpoint.responseData || '{}';
                                }
                              }

                              // WRAP BASED ON METHOD
                              const wrapper = endpoint.method === 'GET' && !endpoint.allowDetailView 
                                ? { status: 'success', data: [finalObj], metadata: { total: 1, limit: endpoint.defaultLimit || 20 } }
                                : { status: 'success', data: finalObj };
                                
                              return JSON.stringify(wrapper, null, 2);
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Error Responses Section */}
                    {Object.keys(errorTemplates).length > 0 && (
                       <div className="pt-4 border-t border-border/5 space-y-4">
                          <div className="flex items-center justify-between mb-2">
                             <TextHeading as="h4" size="h5" className="lowercase">error definitions</TextHeading>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                             {Object.entries(errorTemplates).map(([code, tpl]) => (
                               <div key={code} className="p-3 rounded-xl bg-muted/10 border border-border/5 hover:bg-muted/20 transition-colors">
                                  <div className="flex items-center justify-between mb-2">
                                     <Badge variant="outline" className="text-xs">{code}</Badge>
                                     <span className="text-xs text-muted-foreground lowercase">custom template</span>
                                  </div>
                                  <div className="text-sm text-muted-foreground truncate opacity-60">
                                     {String(tpl)}
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                    )}
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
