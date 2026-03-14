'use client';

// ApiTesterView - Pure UI component
// All business logic is in useApiTester composable

import { Button } from '@cp/ui';
import { Icons, MODULE_LABELS } from '@cp/config/client';
import { useApiTester, METHOD_COLORS, METHODS } from '../composables';

const L = MODULE_LABELS.apiTester;

export const ApiTesterView = () => {
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
    } = useApiTester();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">{L.title}</h1>
                    <p className="text-slate-500 text-sm">{L.subtitle}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
                        <Icons.clock className="w-4 h-4 mr-1" />
                        {L.buttons.history} ({history.length})
                    </Button>
                    {history.length > 0 && (
                        <Button variant="outline" size="sm" onClick={clearHistory}>
                            <Icons.delete className="w-4 h-4 mr-1" />
                            {L.buttons.clear}
                        </Button>
                    )}
                </div>
            </div>

            {/* History Panel */}
            {showHistory && history.length > 0 && (
                <div className="bg-white rounded-xl ring-1 ring-slate-100">
                    <div className="p-4 border-b border-slate-100">
                        <h3 className="font-semibold text-slate-700 text-sm">{L.labels.recentRequests}</h3>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-48 overflow-y-auto">
                        {history.map(item => (
                            <div
                                key={item.id}
                                onClick={() => loadFromHistory(item)}
                                className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer text-sm"
                            >
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase w-12 text-center ${METHOD_COLORS[item.method]}`}>
                                    {item.method}
                                </span>
                                <span className="text-slate-600 truncate flex-1 font-mono text-xs">{item.url}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${getStatusColor(item.status)}`}>
                                    {item.status}
                                </span>
                                <span className="text-[10px] text-slate-400">{item.time}{L.labels.ms}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Request Builder */}
            <div className="bg-white rounded-xl ring-1 ring-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    {/* Method Pills */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {METHODS.map(m => (
                            <button
                                key={m}
                                onClick={() => setMethod(m)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all uppercase ${method === m
                                    ? `${METHOD_COLORS[m]} text-white`
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    {/* URL + Send */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendRequest()}
                            placeholder={L.placeholders.enterUrl}
                            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] w-full"
                        />
                        <Button onClick={sendRequest} disabled={loading} className="w-full sm:w-auto px-6 gap-2 justify-center">
                            {loading ? <Icons.loading className="w-4 h-4 animate-spin" /> : <Icons.play className="w-4 h-4" />}
                            {L.buttons.send}
                        </Button>
                    </div>

                    {/* Auth Fields */}
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Icons.lock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-700 font-semibold text-xs">{L.labels.authentication}</span>
                            <span className="text-[10px] text-slate-400">{L.labels.autoInjected}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                                    <span>{L.labels.xApiKey}</span>
                                    <span className="px-1 py-0.5 bg-red-50 text-red-600 rounded text-[9px]">{L.labels.required}</span>
                                </label>
                                <input
                                    type="text"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder={L.placeholders.apiKey}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                                    <span>{L.labels.authorization}</span>
                                    <span className="px-1 py-0.5 bg-slate-200 text-slate-600 rounded text-[9px]">{L.labels.optional}</span>
                                </label>
                                <input
                                    type="text"
                                    value={jwtToken}
                                    onChange={(e) => setJwtToken(e.target.value)}
                                    placeholder={L.placeholders.jwtToken}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                            <Icons.tip className="w-3 h-3" />
                            {L.messages.apiKeyHint}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                    <button
                        onClick={() => setRequestTab('headers')}
                        className={`flex-1 px-4 py-2.5 text-xs font-medium transition-all uppercase tracking-wide ${requestTab === 'headers'
                            ? 'text-[var(--primary)] border-b-2 border-[var(--primary)] bg-white'
                            : 'text-slate-400 hover:text-slate-600 bg-slate-50'
                            }`}
                    >
                        {L.labels.headers} ({headers.filter(h => h.enabled).length})
                    </button>
                    {method !== 'GET' && (
                        <button
                            onClick={() => setRequestTab('body')}
                            className={`flex-1 px-4 py-2.5 text-xs font-medium transition-all uppercase tracking-wide ${requestTab === 'body'
                                ? 'text-[var(--primary)] border-b-2 border-[var(--primary)] bg-white'
                                : 'text-slate-400 hover:text-slate-600 bg-slate-50'
                                }`}
                        >
                            {L.labels.body}
                        </button>
                    )}
                </div>

                {/* Tab Content */}
                <div className="p-4">
                    {requestTab === 'headers' && (
                        <div className="space-y-3">
                            {headers.map((header, index) => (
                                <div key={index} className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={header.enabled}
                                                onChange={(e) => updateHeader(index, 'enabled', e.target.checked)}
                                                className="w-4 h-4 rounded accent-[var(--primary)]"
                                            />
                                            <span className={header.enabled ? 'text-slate-700 font-medium' : 'text-slate-400'}>
                                                {header.key || L.labels.headers}
                                            </span>
                                        </label>
                                        <button onClick={() => removeHeader(index)} className="text-slate-400 hover:text-red-500 text-sm">
                                            <Icons.close className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            value={header.key}
                                            onChange={(e) => updateHeader(index, 'key', e.target.value)}
                                            placeholder={L.placeholders.headerName}
                                            className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                                        />
                                        <input
                                            type="text"
                                            value={header.value}
                                            onChange={(e) => updateHeader(index, 'value', e.target.value)}
                                            placeholder={L.placeholders.headerValue}
                                            className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                                        />
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={addHeader}
                                className="w-full py-2 rounded-lg border border-dashed border-slate-200 text-slate-400 text-xs font-medium hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-colors"
                            >
                                {L.buttons.addHeader}
                            </button>
                        </div>
                    )}

                    {requestTab === 'body' && method !== 'GET' && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-semibold text-slate-500 uppercase">{L.labels.jsonBody}</span>
                                <button
                                    onClick={formatBody}
                                    className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-bold hover:bg-slate-200"
                                >
                                    <Icons.sparkles className="w-3 h-3 inline mr-1" />
                                    {L.buttons.format}
                                </button>
                            </div>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="w-full h-48 p-4 bg-slate-900 text-green-400 font-mono text-xs rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                                placeholder={L.placeholders.jsonBody}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Response Panel */}
            {(response || loading) && (
                <div className="bg-white rounded-xl ring-1 ring-slate-100 overflow-hidden">
                    <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-slate-700 text-sm">{L.labels.response}</h3>
                            {responseStatus !== null && (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase ${getStatusColor(responseStatus)}`}>
                                    {responseStatus} {getStatusLabel(responseStatus)}
                                </span>
                            )}
                            {responseTime !== null && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                    <Icons.clock className="w-3 h-3 inline mr-1" />
                                    {responseTime}{L.labels.ms}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={copyResponse}
                            className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-500 text-[10px] font-semibold hover:bg-slate-50"
                        >
                            <Icons.copy className="w-3 h-3 inline mr-1" />
                            {L.buttons.copy}
                        </button>
                    </div>
                    <div className="bg-slate-900 p-4 max-h-96 overflow-auto">
                        <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-words leading-relaxed">
                            {loading ? L.labels.loading : (typeof response === 'string' ? response : JSON.stringify(response, null, 2))}
                        </pre>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!response && !loading && (
                <div className="bg-slate-50/50 rounded-xl border border-dashed border-slate-200 p-12 text-center">
                    <div className="w-12 h-12 bg-white rounded-xl ring-1 ring-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Icons.rocket className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-1">{L.labels.readyToTest}</h3>
                    <p className="text-slate-400 text-xs">{L.labels.readyToTestDesc}</p>
                </div>
            )}
        </div>
    );
};

