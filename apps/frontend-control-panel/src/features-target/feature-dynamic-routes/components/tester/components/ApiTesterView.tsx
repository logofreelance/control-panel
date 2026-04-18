'use client';

import { 
  Button, 
  Card, 
  CardContent, 
  Badge, 
  Input,
  Textarea,
  Label,
  Checkbox
} from '@/components/ui';
import { useEffect } from 'react';
import { TextHeading } from '@/components/ui/text-heading';
import { Icons } from '../../../config/icons';
import { DYNAMIC_ROUTES_LABELS } from '../../../constants/ui-labels';
import { cn } from '@/lib/utils';
import { env } from '@/lib/env';
import { useApiTester, METHODS } from '../composables';

const L = DYNAMIC_ROUTES_LABELS.apiTester;

export const ApiTesterView = ({ targetId, preFill }: { targetId?: string; preFill?: { method: string; path: string } }) => {
  const {
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
  } = useApiTester(targetId);

  useEffect(() => {
    if (preFill) {
      setMethod(preFill.method);
      setUrl(`${env.API_URL}${preFill.path.startsWith('/') ? '' : '/'}${preFill.path}`);
    }
  }, [preFill, setMethod, setUrl]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-1">
        <div>
          <TextHeading size="h3" className="lowercase">
            {L.title || 'api tester'}
          </TextHeading>
          <p className="text-base font-normal text-muted-foreground lowercase mt-1">
            {L.subtitle || 'test and validate your dynamic lineage routes.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="lowercase"
          >
            history ({history.length})
          </Button>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-destructive lowercase"
            >
              clear
            </Button>
          )}
        </div>
      </div>

      {/* History Panel */}
      {showHistory && history.length > 0 && (
        <Card>
          <CardContent>
            <div className="divide-y divide-border/5 max-h-56 overflow-y-auto scrollbar-none pt-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className="flex items-center gap-4 py-3 hover:bg-muted/5 cursor-pointer transition-colors group px-1"
                >
                  <Badge variant="outline" className="lowercase">
                    {item.method.toLowerCase()}
                  </Badge>
                  <span className="text-base text-muted-foreground truncate flex-1 font-normal group-hover:text-foreground">
                    {item.url}
                  </span>
                  <Badge 
                    variant={item.status >= 400 ? "destructive" : "secondary"}
                    className="lowercase"
                  >
                    {item.status}
                  </Badge>
                  <span className="text-base text-muted-foreground font-normal whitespace-nowrap">{item.time}ms</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request Builder */}
      <Card>
        <CardContent>
          <div className="space-y-4 pt-6">
            {/* Method Tabs */}
            <div className="flex flex-wrap gap-2">
              {METHODS.map((m) => (
                <Button
                  key={m}
                  variant={method === m ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setMethod(m)}
                  className="lowercase"
                >
                  {m.toLowerCase()}
                </Button>
              ))}
            </div>

            {/* URL Input */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex gap-2">
                {!targetId && (
                  <Badge variant="destructive" className="flex items-center shrink-0 lowercase whitespace-nowrap">
                    no target
                  </Badge>
                )}
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendRequest()}
                  placeholder="enter endpoint url..."
                  className="lowercase"
                />
              </div>
              <Button
                onClick={sendRequest}
                disabled={loading}
                className="lowercase"
              >
                {loading ? 'sending...' : L.buttons.send || 'send request'}
              </Button>
            </div>

            {/* Auth Engine Section */}
            <div className="p-4 bg-muted/10 rounded-lg space-y-4">
              <div>
                <TextHeading as="h4" size="h5" className="lowercase">
                  {L.labels.authentication || 'automated auth engine'}
                </TextHeading>
                <p className="text-base font-normal text-muted-foreground lowercase mt-1">
                  credentials are automatically synced from platform identity.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="lowercase ml-1">
                    {L.labels.xApiKey || 'api key'}
                  </Label>
                  <Input
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={L.placeholders.apiKey}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="lowercase ml-1">
                    {L.labels.authorization || 'bearer token'}
                  </Label>
                  <Input
                    value={jwtToken}
                    onChange={(e) => setJwtToken(e.target.value)}
                    placeholder={L.placeholders.jwtToken}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Action Tabs */}
        <div className="flex border-t border-border/5 bg-muted/5">
          {['headers', ...(method !== 'GET' ? ['body'] : [])].map((tab) => (
            <button
              key={tab}
              onClick={() => setRequestTab(tab as any)}
              className={cn(
                'flex-1 py-3 text-base font-normal transition-all lowercase',
                requestTab === tab
                  ? 'text-foreground bg-background border-b-2 border-foreground'
                  : 'text-muted-foreground hover:bg-muted/10',
              )}
            >
              {tab === 'headers' ? 'headers' : 'body'}
            </button>
          ))}
        </div>

        <CardContent>
          <div className="mt-6">
            {requestTab === 'headers' && (
              <div className="space-y-2">
                {headers.map((header, index) => (
                  <div key={index} className="flex items-center gap-2 group">
                    <Checkbox
                      checked={header.enabled}
                      onCheckedChange={(checked) => updateHeader(index, 'enabled', !!checked)}
                    />
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Input
                        value={header.key}
                        onChange={(e) => updateHeader(index, 'key', e.target.value)}
                        placeholder="key"
                      />
                      <Input
                        value={header.value}
                        onChange={(e) => updateHeader(index, 'value', e.target.value)}
                        placeholder="value"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeHeader(index)}
                      className="text-destructive group-hover:opacity-100 opacity-0 transition-opacity"
                    >
                      <Icons.trash className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addHeader}
                  className="w-full lowercase"
                >
                  append new header
                </Button>
              </div>
            )}

            {requestTab === 'body' && method !== 'GET' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="lowercase ml-1">json payload</Label>
                  <Button variant="ghost" size="sm" onClick={formatBody} className="lowercase">
                    prettify
                  </Button>
                </div>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  className="lowercase"
                  placeholder={L.placeholders.jsonBody}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Response Section */}
      {(response || loading) && (
        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <TextHeading as="h4" size="h5" className="lowercase">
                    response
                  </TextHeading>
                  {responseStatus !== null && (
                    <Badge 
                      variant={responseStatus >= 400 ? "destructive" : "secondary"}
                      className="lowercase"
                    >
                      {responseStatus} {getStatusLabel(responseStatus).toLowerCase()}
                    </Badge>
                  )}
                  {responseTime !== null && (
                    <span className="text-base font-normal text-muted-foreground lowercase">
                      {responseTime}ms
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={copyResponse}
                >
                  <Icons.copy className="size-4" />
                </Button>
              </div>
              
              <div className="p-4 bg-muted/5 rounded-lg max-h-96 overflow-auto border border-border/5">
                <div className="text-base font-normal text-foreground whitespace-pre-wrap break-words lowercase leading-relaxed">
                  {loading ? (
                    <div className="flex flex-col items-center gap-2 py-8">
                      <Icons.loading className="size-5 animate-spin text-primary" />
                      <span className="text-base font-normal text-muted-foreground">streaming...</span>
                    </div>
                  ) : typeof response === 'string' ? (
                    response
                  ) : (
                    JSON.stringify(response, null, 2)
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!response && !loading && (
        <Card>
          <CardContent className="py-8 text-center mt-4">
            <TextHeading size="h5" className="lowercase mb-2">
              ready to test
            </TextHeading>
            <p className="text-base font-normal text-muted-foreground lowercase max-w-sm mx-auto leading-relaxed">
              construct your request parameters above and execute to start technical validation.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
