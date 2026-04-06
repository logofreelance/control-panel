'use client';

import { Button, Card, CardContent, Badge, Input } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
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
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
                <div className="flex flex-row items-center gap-4">
                    <div className="size-12 rounded-xl bg-foreground flex items-center justify-center text-background border-none">
                        <Icons.zap className="size-6" />
                    </div>
                    <div>
                        <TextHeading size="h3" weight="semibold" className="text-2xl sm:text-3xl lowercase">
                            {L.title || "api tester"}
                        </TextHeading>
                        <p className="text-lg text-muted-foreground lowercase leading-relaxed">
                            {L.subtitle || "test and validate your dynamic lineage routes."}
                        </p>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)} className="lowercase">
                        <Icons.clock className="size-4 mr-2" />
                        history ({history.length})
                    </Button>
                    {history.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearHistory} className="lowercase text-rose-500 hover:text-rose-600 hover:bg-rose-500/5">
                            <Icons.close className="size-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* History Panel */}
            {showHistory && history.length > 0 && (
                <Card className="overflow-hidden bg-muted/40 animate-in slide-in-from-top-2 duration-300">
                    <div className="p-4 border-b border-border/5 bg-background/50">
                        <p className="text-sm font-medium text-muted-foreground lowercase px-1">recent activity</p>
                    </div>
                    <div className="divide-y divide-border/5 max-h-56 overflow-y-auto scrollbar-none">
                        {history.map(item => (
                            <div
                                key={item.id}
                                onClick={() => loadFromHistory(item)}
                                className="flex items-center gap-4 p-4 hover:bg-background cursor-pointer text-base transition-colors group"
                            >
                                <div className={cn("rounded-lg text-xs h-6 flex items-center justify-center w-14 font-bold lowercase", METHOD_COLORS[item.method])}>
                                    {item.method}
                                </div>
                                <span className="text-muted-foreground truncate flex-1 font-normal group-hover:text-foreground transition-colors">{item.url}</span>
                                <div className={cn("rounded-lg text-xs font-bold px-2 py-0.5 lowercase", getStatusColor(item.status))}>
                                    {item.status}
                                </div>
                                <span className="text-sm text-muted-foreground font-normal">{item.time}ms</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Request Builder */}
            <Card className="overflow-hidden bg-card">
                <div className="p-4 sm:p-5 space-y-5">
                    {/* Method Selector */}
                    <div className="flex flex-wrap gap-2 px-1">
                        {METHODS.map(m => (
                            <button
                                key={m}
                                onClick={() => setMethod(m)}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-base font-medium transition-all lowercase border-none",
                                    method === m
                                        ? 'bg-foreground text-background'
                                        : 'bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                                )}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    {/* URL Input */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 min-w-0">
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendRequest()}
                                placeholder="enter endpoint url..."
                                className="w-full h-12 px-6 rounded-xl border-none text-lg bg-muted focus:bg-muted focus:outline-none focus:ring-1 focus:ring-foreground/5 transition-all text-foreground placeholder:text-muted-foreground lowercase"
                            />
                        </div>
                        <Button 
                            variant="default" 
                            onClick={sendRequest} 
                            disabled={loading}
                            className="h-12 px-8 lowercase text-base"
                        >
                            {loading ? <Icons.loading className="size-4 animate-spin mr-2" /> : <Icons.play className="size-4 mr-2" />}
                            {L.buttons.send || "send request"}
                        </Button>
                    </div>

                    {/* Auth Engine Section */}
                    <div className="p-5 bg-muted/40 rounded-xl border-none space-y-4">
                        <div className="flex flex-row items-center gap-3">
                            <Icons.lock className="size-4.5 text-indigo-500" />
                            <p className="text-sm font-medium text-muted-foreground lowercase">{L.labels.authentication || "automated auth engine"}</p>
                            <div className="px-2.5 py-0.5 text-[11px] font-bold rounded-lg bg-background text-foreground ml-auto lowercase">{L.labels.autoInjected || "auto-sync"}</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-muted-foreground lowercase px-1 ml-1">{L.labels.xApiKey || "api key"}</label>
                                <input
                                    type="text"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder={L.placeholders.apiKey}
                                    className="w-full h-10 px-4 rounded-xl border-none text-base bg-background focus:outline-none focus:ring-1 focus:ring-foreground/5 transition-all text-foreground"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-muted-foreground lowercase px-1 ml-1">{L.labels.authorization || "bearer token"}</label>
                                <input
                                    type="text"
                                    value={jwtToken}
                                    onChange={(e) => setJwtToken(e.target.value)}
                                    placeholder={L.placeholders.jwtToken}
                                    className="w-full h-10 px-4 rounded-xl border-none text-base bg-background focus:outline-none focus:ring-1 focus:ring-foreground/5 transition-all text-foreground"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs for Headers/Body */}
                <div className="flex border-t border-border/5 bg-muted/10 overflow-hidden">
                    {['headers', ...(method !== 'GET' ? ['body'] : [])].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setRequestTab(tab as any)}
                            className={cn(
                                "flex-1 py-4 text-base font-medium transition-all lowercase",
                                requestTab === tab
                                    ? 'text-foreground bg-background border-b-2 border-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                            )}
                        >
                            {tab === 'headers' ? `${L.labels.headers || "headers"} (${headers.filter(h => h.enabled).length})` : L.labels.body || "body data"}
                        </button>
                    ))}
                </div>

                <CardContent className="p-4 sm:p-6">
                    {requestTab === 'headers' && (
                        <div className="space-y-2">
                            {headers.map((header, index) => (
                                <div key={index} className="flex flex-row items-center gap-3 p-2 bg-muted/20 rounded-xl border-none group">
                                    <input
                                        type="checkbox"
                                        checked={header.enabled}
                                        onChange={(e) => updateHeader(index, 'enabled', e.target.checked)}
                                        className="size-4 rounded-lg bg-background border-none checked:bg-foreground transition-all ml-2"
                                    />
                                    <div className="flex-1 grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            value={header.key}
                                            onChange={(e) => updateHeader(index, 'key', e.target.value)}
                                            placeholder="key"
                                            className="h-10 px-4 rounded-xl border-none text-base bg-background focus:outline-none focus:ring-1 focus:ring-foreground/5 transition-all"
                                        />
                                        <input
                                            type="text"
                                            value={header.value}
                                            onChange={(e) => updateHeader(index, 'value', e.target.value)}
                                            placeholder="value"
                                            className="h-10 px-4 rounded-xl border-none text-base bg-background focus:outline-none focus:ring-1 focus:ring-foreground/5 transition-all"
                                        />
                                    </div>
                                    <button onClick={() => removeHeader(index)} className="p-2 text-muted-foreground hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all mr-2">
                                        <Icons.trash className="size-4.5" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addHeader}
                                className="w-full py-4 rounded-xl border border-dashed border-border/10 text-base font-medium text-muted-foreground lowercase hover:border-foreground/20 hover:text-foreground transition-all hover:bg-muted/5"
                            >
                                <Icons.plus className="size-4 inline mr-2" />
                                {L.buttons.addHeader || "append new header"}
                            </button>
                        </div>
                    )}

                    {requestTab === 'body' && method !== 'GET' && (
                        <div className="space-y-4">
                            <div className="flex flex-row justify-between items-center px-1">
                                <p className="text-sm font-medium text-muted-foreground lowercase">json payload</p>
                                <Button variant="ghost" size="sm" onClick={formatBody} className="lowercase">
                                    <Icons.sparkles className="size-4 mr-2 text-violet-500" />
                                    prettify body
                                </Button>
                            </div>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="w-full h-80 px-6 py-5 bg-muted text-foreground text-lg rounded-xl border-none focus:outline-none focus:ring-1 focus:ring-foreground/5 resize-none transition-all scrollbar-none lowercase"
                                placeholder={L.placeholders.jsonBody}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Response Section */}
            {(response || loading) && (
                <Card className="overflow-hidden bg-card animate-in slide-in-from-bottom-4 duration-700">
                    <div className="p-4 sm:p-5 border-b border-border/5 bg-muted/40 flex items-center justify-between">
                        <div className="flex items-center gap-4 px-2">
                            <p className="text-sm font-medium text-muted-foreground lowercase">response status</p>
                            {responseStatus !== null && (
                                <div className={cn("rounded-lg text-sm font-bold px-3 py-1 lowercase", getStatusColor(responseStatus))}>
                                    {responseStatus} {getStatusLabel(responseStatus)}
                                </div>
                            )}
                            {responseTime !== null && (
                                <div className="px-2.5 py-1 text-sm font-medium bg-background text-foreground rounded-lg lowercase">
                                    <Icons.clock className="size-4.5 inline mr-1.5" />
                                    {responseTime}{L.labels.ms || "ms"}
                                </div>
                            )}
                        </div>
                        <Button variant="ghost" size="icon-sm" onClick={copyResponse} className="transition-all">
                            <Icons.copy className="size-4.5" />
                        </Button>
                    </div>
                    <div className="bg-background/50 p-6 sm:p-8 max-h-[600px] overflow-auto scrollbar-none border-t border-border/5">
                        <div className="text-base text-foreground leading-relaxed whitespace-pre-wrap break-words">
                            {loading ? (
                                <div className="flex flex-col items-center gap-4 py-16 justify-center opacity-40">
                                    <Icons.loading className="size-8 animate-spin" />
                                    <span className="lowercase font-bold text-sm">streaming line data...</span>
                                </div>
                            ) : (typeof response === 'string' ? response : JSON.stringify(response, null, 2))}
                        </div>
                    </div>
                </Card>
            )}

            {/* Empty State */}
            {!response && !loading && (
                <Card className="p-16 text-center bg-muted/20 transition-all">
                    <div className="size-20 bg-background rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-none border-none">
                        <Icons.rocket className="size-10 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium text-muted-foreground lowercase mb-2">{L.labels.readyToTest || "no data detected"}</p>
                    <p className="text-base text-muted-foreground lowercase max-w-sm mx-auto">{L.labels.readyToTestDesc || "construct your request parameters above and execute to start technical validation."}</p>
                </Card>
            )}
        </div>
    );
};
