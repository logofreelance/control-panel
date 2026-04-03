'use client';

import { Button, Card, CardContent, Heading, Text, Stack, Badge, Input } from '@/components/ui';
import { Icons } from '../../../config/icons';
import { DYNAMIC_ROUTES_LABELS } from '../../../constants/ui-labels';
import { cn } from '@/lib/utils';
import { useApiTester, METHOD_COLORS, METHODS } from '../composables';

const L = DYNAMIC_ROUTES_LABELS.apiTester;

export const ApiTesterView = ({ targetId }: { targetId?: string }) => {
    const {
        method, setMethod,
        url, setUrl,
        apiKey, setApiKey,
        jwtToken, setJwtToken,
        headers, body, setBody,
        loading, response, responseStatus, responseTime,
        history, showHistory, setShowHistory,
        requestTab, setRequestTab,
        sendRequest, addHeader, updateHeader, removeHeader,
        copyResponse, formatBody, loadFromHistory, clearHistory,
        getStatusColor, getStatusLabel,
    } = useApiTester(targetId);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <Stack direction="row" justify="between" align="center" className="flex-col items-start md:flex-row md:items-center gap-4">
                <div>
                    <Heading level={3}>{L.title}</Heading>
                    <Text variant="muted">{L.subtitle}</Text>
                </div>
                <Stack direction="row" gap={2}>
                    <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
                        <Icons.clock className="size-4 mr-1" />
                        {L.buttons.history} ({history.length})
                    </Button>
                    {history.length > 0 && (
                        <Button variant="outline" size="sm" onClick={clearHistory}>
                            <Icons.delete className="size-4 mr-1" />
                            {L.buttons.clear}
                        </Button>
                    )}
                </Stack>
            </Stack>

            {/* History Panel */}
            {showHistory && history.length > 0 && (
                <Card >
                    <div className="p-4 border-b border-border">
                        <Text className="text-sm font-semibold">{L.labels.recentRequests}</Text>
                    </div>
                    <div className="divide-y divide-border max-h-48 overflow-y-auto">
                        {history.map(item => (
                            <div
                                key={item.id}
                                onClick={() => loadFromHistory(item)}
                                className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer text-sm"
                            >
                                <Badge className={cn("rounded text-[10px] w-12 text-center text-white", METHOD_COLORS[item.method])}>
                                    {item.method}
                                </Badge>
                                <span className="text-muted-foreground truncate flex-1 font-mono text-xs">{item.url}</span>
                                <Badge className={cn("rounded text-[10px] text-white", getStatusColor(item.status))}>
                                    {item.status}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">{item.time}{L.labels.ms}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Request Builder */}
            <Card >
                <div className="p-4 border-b border-border">
                    <Stack direction="row" gap={2} align="center" wrap className="mb-3">
                        {METHODS.map(m => (
                            <button
                                key={m}
                                onClick={() => setMethod(m)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors uppercase",
                                    method === m
                                        ? 'bg-foreground text-background'
                                        : 'bg-muted text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {m}
                            </button>
                        ))}
                    </Stack>

                    <Stack direction="row" gap={2} className="flex-col sm:flex-row">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendRequest()}
                            placeholder={L.placeholders.enterUrl}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-border font-mono text-sm focus:outline-none focus:border-foreground/30 w-full"
                        />
                        <Button variant="default" onClick={sendRequest} disabled={loading}>
                            {loading ? <Icons.loading className="size-4 animate-spin mr-2" /> : <Icons.play className="size-4 mr-2" />}
                            {L.buttons.send}
                        </Button>
                    </Stack>

                    {/* Auth Fields */}
                    <div className="mt-4 p-4 bg-muted/50 rounded-xl border border-border">
                        <Stack direction="row" gap={2} align="center" className="mb-3">
                            <Icons.lock className="size-3.5 text-muted-foreground" />
                            <Text className="text-xs font-semibold">{L.labels.authentication}</Text>
                            <Text variant="detail">{L.labels.autoInjected}</Text>
                        </Stack>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Text variant="detail" className="mb-1.5 flex items-center gap-2">
                                    {L.labels.xApiKey}
                                    <Badge variant="destructive" className="text-[9px]">{L.labels.required}</Badge>
                                </Text>
                                <input
                                    type="text"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder={L.placeholders.apiKey}
                                    className="w-full px-3 py-2 rounded-lg border border-border font-mono text-xs bg-background focus:outline-none focus:border-foreground/30"
                                />
                            </div>
                            <div>
                                <Text variant="detail" className="mb-1.5 flex items-center gap-2">
                                    {L.labels.authorization}
                                    <Badge variant="secondary" className="text-[9px]">{L.labels.optional}</Badge>
                                </Text>
                                <input
                                    type="text"
                                    value={jwtToken}
                                    onChange={(e) => setJwtToken(e.target.value)}
                                    placeholder={L.placeholders.jwtToken}
                                    className="w-full px-3 py-2 rounded-lg border border-border font-mono text-xs bg-background focus:outline-none focus:border-foreground/30"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border">
                    {['headers', ...(method !== 'GET' ? ['body'] : [])].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setRequestTab(tab as any)}
                            className={cn(
                                "flex-1 px-4 py-2.5 text-xs font-semibold transition-colors uppercase tracking-wide",
                                requestTab === tab
                                    ? 'text-primary border-b-2 border-primary bg-background'
                                    : 'text-muted-foreground hover:text-foreground bg-muted/50'
                            )}
                        >
                            {tab === 'headers' ? `${L.labels.headers} (${headers.filter(h => h.enabled).length})` : L.labels.body}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <CardContent>
                    {requestTab === 'headers' && (
                        <Stack gap={3}>
                            {headers.map((header, index) => (
                                <div key={index} className="p-3 rounded-xl bg-muted/50 border border-border space-y-2">
                                    <Stack direction="row" justify="between" align="center">
                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={header.enabled}
                                                onChange={(e) => updateHeader(index, 'enabled', e.target.checked)}
                                                className="size-4 rounded accent-primary"
                                            />
                                            <span className={header.enabled ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                                                {header.key || L.labels.headers}
                                            </span>
                                        </label>
                                        <button onClick={() => removeHeader(index)} className="text-muted-foreground hover:text-destructive">
                                            <Icons.close className="size-3.5" />
                                        </button>
                                    </Stack>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            value={header.key}
                                            onChange={(e) => updateHeader(index, 'key', e.target.value)}
                                            placeholder={L.placeholders.headerName}
                                            className="px-3 py-1.5 rounded-lg border border-border text-xs font-mono bg-background focus:outline-none focus:border-foreground/30"
                                        />
                                        <input
                                            type="text"
                                            value={header.value}
                                            onChange={(e) => updateHeader(index, 'value', e.target.value)}
                                            placeholder={L.placeholders.headerValue}
                                            className="px-3 py-1.5 rounded-lg border border-border text-xs font-mono bg-background focus:outline-none focus:border-foreground/30"
                                        />
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={addHeader}
                                className="w-full py-2 rounded-xl border border-dashed border-border text-muted-foreground text-xs font-semibold hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                            >
                                {L.buttons.addHeader}
                            </button>
                        </Stack>
                    )}

                    {requestTab === 'body' && method !== 'GET' && (
                        <Stack gap={2}>
                            <Stack direction="row" justify="between" align="center">
                                <Text variant="detail">{L.labels.jsonBody}</Text>
                                <Button variant="outline" size="sm" onClick={formatBody}>
                                    <Icons.sparkles className="size-3 mr-1" />
                                    {L.buttons.format}
                                </Button>
                            </Stack>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="w-full h-48 p-4 bg-foreground text-emerald-400 font-mono text-xs rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder={L.placeholders.jsonBody}
                            />
                        </Stack>
                    )}
                </CardContent>
            </Card>

            {/* Response Panel */}
            {(response || loading) && (
                <Card >
                    <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
                        <Stack direction="row" gap={3} align="center">
                            <Text className="text-sm font-semibold">{L.labels.response}</Text>
                            {responseStatus !== null && (
                                <Badge className={cn("rounded text-[10px] text-white", getStatusColor(responseStatus))}>
                                    {responseStatus} {getStatusLabel(responseStatus)}
                                </Badge>
                            )}
                            {responseTime !== null && (
                                <span className="text-[10px] text-muted-foreground font-mono">
                                    <Icons.clock className="size-3 inline mr-1" />
                                    {responseTime}{L.labels.ms}
                                </span>
                            )}
                        </Stack>
                        <Button variant="outline" size="sm" onClick={copyResponse}>
                            <Icons.copy className="size-3 mr-1" />
                            {L.buttons.copy}
                        </Button>
                    </div>
                    <div className="bg-foreground p-4 max-h-96 overflow-auto">
                        <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap break-words leading-relaxed">
                            {loading ? L.labels.loading : (typeof response === 'string' ? response : JSON.stringify(response, null, 2))}
                        </pre>
                    </div>
                </Card>
            )}

            {/* Empty State */}
            {!response && !loading && (
                <Card  className="p-12 text-center border-dashed">
                    <div className="size-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4 text-border">
                        <Icons.rocket className="size-6" />
                    </div>
                    <Text className="text-sm font-semibold mb-1">{L.labels.readyToTest}</Text>
                    <Text variant="muted" className="text-xs">{L.labels.readyToTestDesc}</Text>
                </Card>
            )}
        </div>
    );
};
