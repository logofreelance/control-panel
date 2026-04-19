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
  const { loading, endpoint, dataSource, resource, getFullUrl, getCodeExamples } =
    useEndpointDetail(targetId, endpointId);

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
  const methodStyles: Record<string, string> = {
    GET: 'bg-primary/10 text-primary',
    POST: 'bg-primary/10 text-primary',
    PUT: 'bg-primary/10 text-primary',
    PATCH: 'bg-primary/10 text-primary',
    DELETE: 'bg-destructive/10 text-destructive',
  };

  const getRoleLevelLabel = (level: number) => {
    if (level === 0) return L.options?.public || 'public';
    if (level < 50) return L.options?.login || 'login required';
    if (level < 90) return L.options?.moderator || 'moderator';
    return L.options?.admin || 'admin only';
  };

  const parseJsonArray = (str?: string): string[] => {
    if (!str) return [];
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  };

  const parseJsonObject = (str?: string): Record<string, string> => {
    if (!str) return {};
    try {
      return JSON.parse(str);
    } catch {
      return {};
    }
  };

  const writableFields = parseJsonArray(endpoint.writableFields);
  const protectedFields = parseJsonArray(endpoint.protectedFields);
  const autoPopulateFields = parseJsonObject(endpoint.autoPopulateFields);

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
            </div>
            <TextHeading as="h1" size="h3" className="lowercase">
              {endpoint.path}
            </TextHeading>
          </div>
          {endpoint.description && (
            <p className="text-base text-muted-foreground max-w-2xl lowercase">
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

      {/* Quick Copy URL */}
      <Card size="sm">
        <CardContent>
          <div className="flex flex-row items-center justify-between gap-4 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-base font-normal text-muted-foreground mb-1 lowercase">
                {L.detail?.fullUrl || 'access url'}
              </p>
              <div className="text-base text-foreground break-all">{fullUrl}</div>
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
          {/* Request Info */}
          <Card>
            <CardContent>
              <div className="flex flex-row items-center gap-3 mb-6">
                <Icons.send className="size-5 text-primary" />
                <TextHeading as="h3" size="h4" className="lowercase">
                  {L.detail?.requestInfo || 'request info'}
                </TextHeading>
              </div>
              <div className="space-y-4">
                <div className="flex flex-row justify-between items-center gap-2">
                  <p className="text-base text-muted-foreground lowercase">
                    {L.detail?.method || 'method'}
                  </p>
                  <Badge variant="secondary">
                    {endpoint.method.toLowerCase()}
                  </Badge>
                </div>
                <div className="flex flex-row justify-between items-center gap-2">
                  <p className="text-base text-muted-foreground lowercase">
                    {L.detail?.contentType || 'content type'}
                  </p>
                  <span className="text-base text-foreground lowercase">
                    {JSON_CONTENT_TYPE}
                  </span>
                </div>
                {dataSource && (
                  <div className="flex flex-row justify-between items-center gap-2 border-t border-border pt-4">
                    <p className="text-base text-muted-foreground lowercase">
                      {L.labels?.dataSource || 'source'}
                    </p>
                    <p className="text-base font-normal text-foreground lowercase">
                      {dataSource.name}
                    </p>
                  </div>
                )}
                {resource && (
                  <div className="flex flex-row justify-between items-center gap-2 border-t border-border pt-4">
                    <p className="text-base text-muted-foreground lowercase">
                      {L.labels?.resource || 'resource'}
                    </p>
                    <p className="text-base font-normal text-foreground lowercase">
                      {resource.name}
                    </p>
                  </div>
                )}
                {(writableFields.length > 0 || protectedFields.length > 0 || Object.keys(autoPopulateFields).length > 0) && (
                  <div className="space-y-4 border-t border-border pt-4">
                    <TextHeading as="h4" size="h5" className="lowercase">Mutation Rules</TextHeading>
                    
                    {writableFields.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-normal text-muted-foreground lowercase">writable fields (allowed from body)</p>
                        <div className="flex flex-wrap gap-1.5">
                          {writableFields.map((field) => (
                            <Badge key={field} variant="default" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-2 min-h-5 py-0.5 lowercase font-mono text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {protectedFields.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-normal text-muted-foreground lowercase">protected fields (ignored from body)</p>
                        <div className="flex flex-wrap gap-1.5">
                          {protectedFields.map((field) => (
                            <Badge key={field} variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 px-2 py-0.5 min-h-5 lowercase font-mono text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {Object.keys(autoPopulateFields).length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-normal text-muted-foreground lowercase">auto-populated fields</p>
                        <div className="flex flex-col gap-1.5 w-full">
                          {Object.entries(autoPopulateFields).map(([field, value]) => (
                            <div key={field} className="flex flex-row items-center justify-between text-xs font-mono bg-muted/40 rounded-md px-2 py-1.5">
                              <span className="text-primary">{field}</span>
                              <span className="text-muted-foreground">→</span>
                              <span className="text-foreground">{String(value)}</span>
                            </div>
                          ))}
                        </div>
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
                  {L.detail?.security || 'security'}
                </TextHeading>
              </div>
              <div className="space-y-6">
                <div className="flex flex-row justify-between items-center gap-2">
                  <p className="text-base text-muted-foreground lowercase">
                    {L.misc?.accessLevel || 'access'}
                  </p>
                  <p className="text-base font-normal text-foreground lowercase">
                    {getRoleLevelLabel(endpoint.minRoleLevel ?? 0)}
                  </p>
                </div>
                {endpoint.roles && (
                  <div className="space-y-3 border-t border-border pt-4">
                    <p className="text-base font-normal text-muted-foreground lowercase">
                      {L.labels?.roles || 'roles'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {endpoint.roles.split(',').map((role: string) => (
                        <Badge
                          key={role}
                          variant="secondary"
                        >
                          {role.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {endpoint.permissions && (
                  <div className="space-y-3 border-t border-border pt-4">
                    <p className="text-base font-normal text-muted-foreground lowercase">
                      {L.labels?.permissions || 'permissions'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {endpoint.permissions.split(',').map((perm: string) => (
                        <Badge
                          key={perm}
                          variant="secondary"
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
                  {L.detail?.codeExamples || 'examples'}
                </TextHeading>
              </div>

              {/* Tab Buttons */}
              <div className="flex flex-row gap-1 bg-muted p-1 rounded-xl mb-4">
                {(['curl', 'javascript', 'python'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCodeTab(tab)}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-lg text-base transition-all lowercase',
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
                <div className="bg-muted p-4 rounded-xl overflow-hidden border border-border">
                  <div className="text-sm font-mono text-foreground overflow-x-auto scrollbar-none leading-relaxed whitespace-pre">
                    {codeExamples[activeCodeTab]}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(codeExamples[activeCodeTab], activeCodeTab)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all bg-background"
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

          {/* Response Template */}
          {endpoint.responseData && (
            <Card>
              <CardContent>
                <div className="flex flex-row items-center gap-3 mb-6">
                  <Icons.file className="size-5 text-primary" />
                  <TextHeading as="h3" size="h4" className="lowercase">
                    {L.detail?.responseTemplate || 'response schema'}
                  </TextHeading>
                </div>
                <div className="bg-muted p-4 rounded-xl relative group border border-border">
                  <div className="text-sm font-mono text-foreground overflow-x-auto scrollbar-none leading-relaxed whitespace-pre">
                    {(() => {
                        try {
                            const parsed = JSON.parse(endpoint.responseData);
                            return JSON.stringify(parsed, null, 2);
                        } catch {
                            // If it's a template string (like {"status": "success", "data": {{DATA}}}) 
                            // it might fail JSON.parse. In that case we just return it but we can format it lightly manually.
                            const val = endpoint.responseData;
                            if(val.startsWith('{') && val.endsWith('}')) {
                                return val.replace(/","/g, '",\n  "').replace(/^{"/, '{\n  "').replace(/}$/, '\n}');
                            }
                            return val;
                        }
                    })()}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(endpoint.responseData || '', 'schema')}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all bg-background"
                  >
                    {copiedField === 'schema' ? (
                      <Icons.check className="size-4 text-primary" />
                    ) : (
                      <Icons.copy className="size-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

