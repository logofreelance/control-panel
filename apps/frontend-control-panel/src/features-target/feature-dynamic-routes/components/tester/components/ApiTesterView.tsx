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
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-row items-center gap-4">
                    <div className="size-12 rounded-2xl bg-foreground flex items-center justify-center text-background shadow-none">
                        <Icons.zap className="size-6" />
                    </div>
                    <div>
                        <TextHeading size="h3" weight="semibold" className="text-2xl sm:text-3xl lowercase tracking-tight">
                            {L.title || "api tester"}
                        </TextHeading>
                        <p className="text-sm text-muted-foreground/60 lowercase leading-relaxed">
                            {L.subtitle || "test and validate your dynamic lineage routes."}
                        </p>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)} className="rounded-xl h-10 px-5 text-xs lowercase gap-2 border-2 hover:bg-muted/10">
                        <Icons.clock className="size-4" />
                        history ({history.length})
                    </Button>
                    {history.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearHistory} className="rounded-xl h-10 px-5 text-xs lowercase text-red-500/40 hover:text-red-500 hover:bg-red-500/5">
                            <Icons.close className="size-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* History Panel */}
            {showHistory && history.length > 0 && (
                <Card className="rounded-3xl border-2 border-foreground/5 shadow-none overflow-hidden bg-muted/10 animate-in slide-in-from-top-2 duration-300">
                    <div className="p-4 border-b border-border/10 bg-background/50">
                        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest px-1">recent activity</p>
                    </div>
                    <div className="divide-y divide-border/5 max-h-56 overflow-y-auto scrollbar-none">
                        {history.map(item => (
                            <div
                                key={item.id}
                                onClick={() => loadFromHistory(item)}
                                className="flex items-center gap-4 p-4 hover:bg-background/80 cursor-pointer text-sm transition-colors group"
                            >
                                <Badge className={cn("rounded-lg text-[9px] w-14 text-center font-bold tracking-wider", METHOD_COLORS[item.method])}>
                                    {item.method}
                                </Badge>
                                <span className="text-muted-foreground/60 truncate flex-1 font-mono text-xs tracking-tight group-hover:text-foreground transition-colors">{item.url}</span>
                                <Badge className={cn("rounded-lg text-[9px] font-bold px-2 py-0.5 border-none", getStatusColor(item.status))}>
                                    {item.status}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground/20 font-mono tracking-tighter">{item.time}ms</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Request Builder */}
            <Card className="rounded-3xl border-2 border-foreground/5 bg-card shadow-none overflow-hidden">
                <div className="p-6 sm:p-8 space-y-8">
                    {/* Method Selector */}
                    <div className="flex flex-wrap gap-2 px-1">
                        {METHODS.map(m => (
                            <button
                                key={m}
                                onClick={() => setMethod(m)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-bold transition-all lowercase tracking-wide border-2",
                                    method === m
                                        ? 'bg-foreground text-background border-foreground shadow-none'
                                        : 'bg-muted/30 text-muted-foreground/40 border-transparent hover:border-foreground/10 hover:text-foreground'
                                )}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    {/* URL Input */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 min-w-0 relative">
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendRequest()}
                                placeholder="enter endpoint url..."
                                className="w-full h-12 px-6 rounded-2xl border-2 border-border/10 font-mono text-sm bg-muted/20 focus:bg-background focus:outline-none focus:border-foreground/20 transition-all text-foreground/80 placeholder:text-muted-foreground/20"
                            />
                        </div>
                        <Button 
                            variant="default" 
                            onClick={sendRequest} 
                            disabled={loading}
                            className="h-12 px-8 rounded-2xl lowercase text-sm font-semibold tracking-wide gap-3 shadow-none active:scale-95 transition-all"
                        >
                            {loading ? <Icons.loading className="size-4 animate-spin" /> : <Icons.play className="size-4" />}
                            {L.buttons.send || "send request"}
                        </Button>
                    </div>

                    {/* Auth Engine Section */}
                    <div className="p-6 bg-muted/40 rounded-3xl border-2 border-border/5 space-y-6">
                        <div className="flex flex-row items-center gap-3">
                            <Icons.lock className="size-4 text-indigo-500/60" />
                            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{L.labels.authentication || "automated auth engine"}</p>
                            <Badge variant="secondary" className="px-2 py-0.5 text-[8px] rounded-lg tracking-widest bg-background/50 border-none ml-auto">{L.labels.autoInjected || "AUTO-SYNC"}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest px-1 ml-1">{L.labels.xApiKey || "api key"}</label>
                                <input
                                    type="text"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder={L.placeholders.apiKey}
                                    className="w-full h-10 px-4 rounded-xl border-2 border-border/10 font-mono text-xs bg-background/60 focus:bg-background focus:outline-none focus:border-foreground/20 transition-all text-foreground/70"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest px-1 ml-1">{L.labels.authorization || "bearer token"}</label>
                                <input
                                    type="text"
                                    value={jwtToken}
                                    onChange={(e) => setJwtToken(e.target.value)}
                                    placeholder={L.placeholders.jwtToken}
                                    className="w-full h-10 px-4 rounded-xl border-2 border-border/10 font-mono text-xs bg-background/60 focus:bg-background focus:outline-none focus:border-foreground/20 transition-all text-foreground/70"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs for Headers/Body */}
                <div className="flex border-t border-border/10 bg-muted/10 overflow-hidden">
                    {['headers', ...(method !== 'GET' ? ['body'] : [])].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setRequestTab(tab as any)}
                            className={cn(
                                "flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all",
                                requestTab === tab
                                    ? 'text-foreground bg-background border-b-2 border-foreground'
                                    : 'text-muted-foreground/30 hover:text-foreground hover:bg-muted/20'
                            )}
                        >
                            {tab === 'headers' ? `${L.labels.headers || "headers"} (${headers.filter(h => h.enabled).length})` : L.labels.body || "body data"}
                        </button>
                    ))}
                </div>

                <CardContent className="p-6 sm:p-10">
                    {requestTab === 'headers' && (
                        <div className="space-y-3">
                            {headers.map((header, index) => (
                                <div key={index} className="flex flex-row items-center gap-3 p-2 bg-muted/5 rounded-2xl border-2 border-transparent hover:border-foreground/5 transition-all group">
                                    <input
                                        type="checkbox"
                                        checked={header.enabled}
                                        onChange={(e) => updateHeader(index, 'enabled', e.target.checked)}
                                        className="size-4 rounded-lg bg-background border-2 border-border/20 checked:bg-foreground transition-all ml-2"
                                    />
                                    <div className="flex-1 grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            value={header.key}
                                            onChange={(e) => updateHeader(index, 'key', e.target.value)}
                                            placeholder="key"
                                            className="h-10 px-4 rounded-xl border-2 border-border/10 text-xs font-mono bg-background/40 focus:outline-none focus:border-foreground/20"
                                        />
                                        <input
                                            type="text"
                                            value={header.value}
                                            onChange={(e) => updateHeader(index, 'value', e.target.value)}
                                            placeholder="value"
                                            className="h-10 px-4 rounded-xl border-2 border-border/10 text-xs font-mono bg-background/40 focus:outline-none focus:border-foreground/20"
                                        />
                                    </div>
                                    <button onClick={() => removeHeader(index)} className="p-2 text-muted-foreground/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all mr-2">
                                        <Icons.trash className="size-4" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addHeader}
                                className="w-full py-4 rounded-2xl border-2 border-dashed border-border/10 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest hover:border-foreground/20 hover:text-foreground transition-all hover:bg-muted/5"
                            >
                                <Icons.plus className="size-3.5 inline mr-2 opacity-50" />
                                {L.buttons.addHeader || "append new header"}
                            </button>
                        </div>
                    )}

                    {requestTab === 'body' && method !== 'GET' && (
                        <div className="space-y-4">
                            <div className="flex flex-row justify-between items-center px-1">
                                <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest px-1">json payload</p>
                                <Button variant="ghost" size="sm" onClick={formatBody} className="h-8 rounded-xl text-[10px] lowercase px-4 hover:bg-muted/20">
                                    <Icons.sparkles className="size-3 mr-2 text-violet-500" />
                                    prettify body
                                </Button>
                            </div>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="w-full h-80 px-6 py-5 bg-muted/20 text-foreground/80 font-mono text-sm rounded-3xl border-2 border-border/5 focus:bg-background focus:outline-none focus:border-foreground/20 resize-none transition-all scrollbar-none shadow-inner"
                                placeholder={L.placeholders.jsonBody}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Response Section */}
            {(response || loading) && (
                <Card className="rounded-3xl border-2 border-foreground/5 bg-card shadow-none overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
                    <div className="p-4 sm:p-5 border-b border-border/10 bg-muted/40 flex items-center justify-between">
                        <div className="flex items-center gap-4 px-2">
                            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">response status</p>
                            {responseStatus !== null && (
                                <Badge className={cn("rounded-lg text-[10px] font-bold px-3 py-1 border-none", getStatusColor(responseStatus))}>
                                    {responseStatus} {getStatusLabel(responseStatus)}
                                </Badge>
                            )}
                            {responseTime !== null && (
                                <Badge variant="secondary" className="px-2 py-0.5 text-[9px] font-mono tracking-tighter bg-background/50 border-none">
                                    <Icons.clock className="size-3 inline mr-1 opacity-40" />
                                    {responseTime}{L.labels.ms || "ms"}
                                </Badge>
                            )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={copyResponse} className="h-9 w-9 p-0 rounded-xl hover:bg-background/80 transition-all">
                            <Icons.copy className="size-4" />
                        </Button>
                    </div>
                    <div className="bg-background/40 p-6 sm:p-8 max-h-[600px] overflow-auto scrollbar-none border-t border-border/5 shadow-inner">
                        <pre className="text-xs text-foreground/60 font-mono whitespace-pre-wrap break-words leading-relaxed">
                            {loading ? (
                                <div className="flex items-center gap-3 py-12 justify-center opacity-30">
                                    <Icons.loading className="size-5 animate-spin" />
                                    <span className="lowercase font-bold tracking-widest text-[10px]">streaming line data...</span>
                                </div>
                            ) : (typeof response === 'string' ? response : JSON.stringify(response, null, 2))}
                        </pre>
                    </div>
                </Card>
            )}

            {/* Empty State */}
            {!response && !loading && (
                <Card className="p-16 text-center border-2 border-dashed border-foreground/5 shadow-none bg-muted/5 rounded-[2.5rem] transition-all">
                    <div className="size-20 bg-background rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-none border-2 border-border/10">
                        <Icons.rocket className="size-10 text-muted-foreground/20" />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground/60 lowercase mb-2">{L.labels.readyToTest || "no data detected"}</p>
                    <p className="text-xs text-muted-foreground/20 lowercase max-w-sm mx-auto">{L.labels.readyToTestDesc || "construct your request parameters above and execute to start technical validation."}</p>
                </Card>
            )}
        </div>
    );
};
