'use client';

import { Button, Input, Select, Switch } from '@cp/ui';
import { Icons, MODULE_LABELS } from '@cp/config/client';
import { useEndpointEditor } from '../composables';
import { MultiSelect } from './MultiSelect';
import { DataLineageHelper } from './DataLineageHelper';

interface EndpointEditorProps {
    endpointId?: number;
}

export const EndpointEditor = ({ endpointId }: EndpointEditorProps) => {
    const L = MODULE_LABELS.apiManagement;

    const {
        loading,
        saving,
        form,
        setForm,
        categories,
        dataSources,
        resources,
        columns, // For Mutation tab column selector
        availableRoles,
        availablePermissions,
        activeTab,
        setActiveTab,
        pathError,
        setPathError,
        duplicateWarning,
        setDuplicateWarning,
        validatePath,


        handleSave,
        handleDelete,
        router
    } = useEndpointEditor(endpointId);

    // Helper to get/set validation rules from JSON
    const getValidationRule = (colName: string): string => {
        try {
            const rules = form.validationRules ? JSON.parse(form.validationRules) : {};
            return rules[colName] || '';
        } catch { return ''; }
    };

    const setValidationRule = (colName: string, value: string) => {
        try {
            const rules = form.validationRules ? JSON.parse(form.validationRules) : {};
            if (value) {
                rules[colName] = value;
            } else {
                delete rules[colName];
            }
            setForm({ ...form, validationRules: JSON.stringify(rules) });
        } catch {
            setForm({ ...form, validationRules: JSON.stringify({ [colName]: value }) });
        }
    };

    // Helper to get/set error templates from JSON
    const getErrorTemplate = (statusCode: number): string => {
        try {
            const templates = form.errorTemplatesJson ? JSON.parse(form.errorTemplatesJson) : {};
            return templates[String(statusCode)] || '';
        } catch { return ''; }
    };

    const setErrorTemplate = (statusCode: number, value: string) => {
        try {
            const templates = form.errorTemplatesJson ? JSON.parse(form.errorTemplatesJson) : {};
            if (value) {
                templates[String(statusCode)] = value;
            } else {
                delete templates[String(statusCode)];
            }
            setForm({ ...form, errorTemplatesJson: JSON.stringify(templates) });
        } catch {
            setForm({ ...form, errorTemplatesJson: JSON.stringify({ [String(statusCode)]: value }) });
        }
    };

    // Smart Error Code Generator based on path
    const STATUS_ERROR_MAP: Record<number, { suffix: string; label: string }> = {
        401: { suffix: 'UNAUTHORIZED', label: 'Unauthorized' },
        403: { suffix: 'FORBIDDEN', label: 'Forbidden' },
        404: { suffix: 'NOT_FOUND', label: 'Not found' },
        500: { suffix: 'SERVER_ERROR', label: 'Server error' },
    };

    const generateSmartErrorDefault = (path: string, statusCode: number): string => {
        // Convert path to SNAKE_CASE: /users/profile -> USERS_PROFILE
        const slug = (path || '/unknown')
            .replace(/^\//, '')           // remove leading /
            .replace(/:[^/]+/g, '')       // remove path params like :id
            .replace(/\//g, '_')          // replace / with _
            .replace(/_+/g, '_')          // collapse multiple underscores
            .replace(/_+$/, '')           // remove trailing _
            .toUpperCase() || 'ENDPOINT';

        const errorInfo = STATUS_ERROR_MAP[statusCode] || { suffix: String(statusCode), label: 'Error' };
        const errorCode = `${slug}_${errorInfo.suffix}`;

        return JSON.stringify({
            status: 'error',
            code: statusCode,
            errorCode: errorCode,
            message: `${errorInfo.label} at ${path || '/'}`,
        });
    };

    // Get display text for error template (custom or auto-generated)
    const getErrorDisplayInfo = (statusCode: number): { isCustom: boolean; template: string; errorCode: string } => {
        const customTemplate = getErrorTemplate(statusCode);
        if (customTemplate) {
            try {
                const parsed = JSON.parse(customTemplate);
                return { isCustom: true, template: customTemplate, errorCode: parsed.errorCode || '' };
            } catch {
                return { isCustom: true, template: customTemplate, errorCode: '' };
            }
        }

        // Auto-generate based on path
        const autoTemplate = generateSmartErrorDefault(form.path || '', statusCode);
        const parsed = JSON.parse(autoTemplate);
        return { isCustom: false, template: autoTemplate, errorCode: parsed.errorCode };
    };

    const TABS = [
        { id: 'basic', label: L.tabs.basic, Icon: Icons.globe },
        { id: 'data', label: L.tabs.data, Icon: Icons.database },
        { id: 'mutation', label: L.tabs.mutation, Icon: Icons.edit },
        { id: 'security', label: L.tabs.security, Icon: Icons.lock },
        { id: 'response', label: L.tabs.response, Icon: Icons.upload },
        { id: 'test', label: L.tabs.test, Icon: Icons.flask },
    ] as const;

    const isWriteOp = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(form.method || 'GET');

    if (loading) return null;

    return (
        <div className="space-y-6 pb-20">
            {/* ... Header & Preview ... */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">{endpointId ? L.buttons.edit : L.buttons.newEndpoint}</h1>
                    <p className="text-sm text-slate-500">{L.subtitle}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-xs">{L.buttons.cancel}</Button>
                    <Button size="sm" onClick={handleSave} isLoading={saving} className="text-xs shadow-sm shadow-blue-500/30">{L.buttons.save}</Button>
                </div>
            </div>

            {/* Method + Path Preview Bar */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-wrap sm:flex-nowrap items-center gap-4">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold text-white shrink-0 tracking-wide ${form.method === 'GET' ? 'bg-blue-500' :
                    form.method === 'POST' ? 'bg-green-500' :
                        form.method === 'PUT' ? 'bg-amber-500' :
                            form.method === 'DELETE' ? 'bg-red-500' : 'bg-purple-500'
                    }`}>
                    {form.method || 'GET'}
                </span>
                <code className="text-slate-700 font-mono text-sm flex-1 min-w-0 truncate font-semibold tracking-tight">
                    {form.path || '/your-endpoint'}
                </code>

                {/* Access Level Badge */}
                {(form.minRoleLevel ?? 0) === 0 ? (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold uppercase tracking-wide shrink-0 flex items-center gap-1">
                        <Icons.globe className="w-3 h-3" /> {L.misc?.bypass || 'PUBLIC'}
                    </span>
                ) : (form.minRoleLevel ?? 0) < 90 ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold uppercase tracking-wide shrink-0 flex items-center gap-1">
                        <Icons.lock className="w-3 h-3" /> {L.misc?.loginRequired || 'LOGIN'}
                    </span>
                ) : (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-[10px] font-bold uppercase tracking-wide shrink-0 flex items-center gap-1">
                        <Icons.crown className="w-3 h-3" /> {L.misc?.adminOnly || 'ADMIN'}
                    </span>
                )}

                <div className="flex items-center gap-3 ml-auto pl-4 border-l border-slate-100">
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={form.isActive || false}
                            onCheckedChange={checked => setForm({ ...form, isActive: checked })}
                        />
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${form.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {form.isActive ? L.labels.active : L.labels.inactive}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-slim">
                    {TABS.map(tab => {
                        const TabIcon = tab.Icon;
                        if (tab.id === 'mutation' && !isWriteOp) return null; // Hide Mutation tab for GET
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`flex-shrink-0 sm:flex-1 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${activeTab === tab.id
                                    ? 'bg-[var(--primary)]/5 text-[var(--primary)] border-b-2 border-[var(--primary)]'
                                    : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                <TabIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="p-5">
                    {/* Tab: Basic Info */}
                    {activeTab === 'basic' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div className="col-span-1">
                                    <Select
                                        label={L.labels.method}
                                        value={form.method}
                                        onChange={e => setForm({ ...form, method: e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' })}
                                        options={[
                                            { label: 'GET', value: 'GET' },
                                            { label: 'POST', value: 'POST' },
                                            { label: 'PUT', value: 'PUT' },
                                            { label: 'DELETE', value: 'DELETE' },
                                            { label: 'PATCH', value: 'PATCH' },
                                        ]}
                                    />
                                </div>
                                <div className="col-span-1 sm:col-span-3">
                                    <Input
                                        label={L.labels.path}
                                        placeholder={L.placeholders.endpointPath}
                                        value={form.path || ''}
                                        onChange={e => {
                                            const newPath = e.target.value;
                                            setForm({ ...form, path: newPath });
                                            setPathError(validatePath(newPath));
                                            // Duplicate check is now performed on Save or we can debounce it.
                                            // For now, removing real-time server check to avoid flood.
                                            setDuplicateWarning(null);
                                        }}
                                        className={pathError || duplicateWarning ? 'border-red-500' : ''}
                                    />
                                    {pathError && <p className="text-xs text-red-500 mt-1">{pathError}</p>}
                                    {duplicateWarning && <p className="text-xs text-amber-500 mt-1">{duplicateWarning}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{L.labels.description}</label>
                                <textarea
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                                    value={form.description || ''}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder={L.placeholders.endpointDescription}
                                    rows={3}
                                />
                            </div>

                            <Select
                                label={L.labels.categories}
                                value={String(form.categoryId || '')}
                                onChange={e => setForm({ ...form, categoryId: e.target.value ? Number(e.target.value) : undefined })}
                                options={[
                                    { label: 'Uncategorized', value: '' }, // Literal fallback. Strict rules might flag.
                                    ...categories.map(c => ({ label: c.name, value: String(c.id) }))
                                ]}
                            />
                        </div>
                    )}

                    {/* Tab: Data Binding */}
                    {activeTab === 'data' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                <p className="text-amber-700 text-sm font-medium flex items-center gap-2">
                                    <Icons.database className="w-4 h-4" />
                                    {L.misc?.bindToDataSource}
                                </p>
                            </div>

                            <Select
                                label={L.misc?.bindToDataSource}
                                value={String(form.dataSourceId || '')}
                                onChange={(e) => setForm({ ...form, dataSourceId: e.target.value ? Number(e.target.value) : undefined, resourceId: undefined })}
                                options={[
                                    { label: L.misc?.noBinding || 'No Binding', value: '' },
                                    ...dataSources.map(ds => ({ label: ds.name, value: String(ds.id) }))
                                ]}
                            />

                            {form.dataSourceId && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <Select
                                        label={L.misc?.selectResourceLogic}
                                        value={String(form.resourceId || '')}
                                        onChange={e => setForm({ ...form, resourceId: e.target.value ? Number(e.target.value) : undefined })}
                                        options={[
                                            { label: L.misc?.rawTableData || 'Raw', value: '' },
                                            ...resources.map(res => ({ label: `${res.name} ${res.description ? `- ${res.description}` : ''}`, value: String(res.id) }))
                                        ]}
                                    />
                                    {resources.length === 0 && (
                                        <p className="text-xs text-amber-500 mt-2">{L.misc?.noSpecificResources}</p>
                                    )}
                                </div>
                            )}

                            {form.dataSourceId && (
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <h4 className="font-semibold text-slate-700 text-sm mb-2">{L.misc?.dataPreview}</h4>
                                    <p className="text-xs text-slate-500">{L.misc?.dataPreviewHint}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Mutation (New) */}
                    {activeTab === 'mutation' && isWriteOp && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                                <p className="text-purple-700 text-sm font-medium flex items-center gap-2">
                                    <Icons.edit className="w-4 h-4" />
                                    {L.mutation?.title}
                                </p>
                            </div>

                            <Select
                                label={L.mutation?.operationBehavior}
                                value={form.operationType || 'create'}
                                onChange={e => setForm({ ...form, operationType: e.target.value as 'create' | 'update' | 'delete' })}
                                options={[
                                    { label: 'Create (Insert)', value: 'create' },
                                    { label: 'Update (Modify)', value: 'update' },
                                    { label: 'Delete (Remove)', value: 'delete' },
                                ]}
                            />

                            <div className="border-t border-slate-100 pt-4">
                                <h4 className="font-bold text-slate-700 text-sm mb-3">{L.mutation?.ownershipSecurity}</h4>
                                <div className="flex items-center gap-4 mb-4">
                                    <Switch
                                        checked={form.allowOwnerOnly !== false} // Default true
                                        onCheckedChange={checked => setForm({ ...form, allowOwnerOnly: checked })}
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">{L.mutation?.restrictToOwner}</p>
                                        <p className="text-xs text-slate-500">{L.mutation?.restrictToOwnerHint}</p>
                                    </div>
                                </div>

                                {form.allowOwnerOnly !== false && (
                                    <div>
                                        <Input
                                            label={L.mutation?.ownershipColumn}
                                            placeholder="e.g. user_id"
                                            value={form.ownershipColumn || ''}
                                            onChange={e => setForm({ ...form, ownershipColumn: e.target.value })}
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">{L.mutation?.ownershipColumnHint}</p>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-slate-100 pt-4">
                                <h4 className="font-semibold text-slate-700 text-sm mb-2">{L.mutation?.columnSelector || 'Column Configuration'}</h4>
                                <p className="text-xs text-slate-500 mb-3">{L.mutation?.columnSelectorHint}</p>

                                {!form.dataSourceId ? (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                                        <Icons.database className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                        <p className="text-sm text-slate-500">{L.mutation?.selectDataSourceFirst}</p>
                                    </div>
                                ) : columns.length === 0 ? (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                                        <Icons.database className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-pulse" />
                                        <p className="text-sm text-slate-500">{L.labels.loading}</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Legend */}
                                        <div className="flex flex-wrap gap-3 mb-4 text-xs">
                                            <span className="flex items-center gap-1">
                                                <span className="w-3 h-3 rounded bg-green-500"></span>
                                                {L.mutation?.legendWritable}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="w-3 h-3 rounded bg-red-500"></span>
                                                {L.mutation?.legendProtected}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="w-3 h-3 rounded bg-blue-500"></span>
                                                {L.mutation?.legendAutoPopulate}
                                            </span>
                                        </div>

                                        {/* Column Chips */}
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {columns.map(col => {
                                                // Parse current states
                                                const writableList: string[] = form.writableFields ? JSON.parse(form.writableFields as string || '[]') : [];
                                                const protectedList: string[] = form.protectedFields ? JSON.parse(form.protectedFields as string || '[]') : [];
                                                const autoPopObj: Record<string, string> = form.autoPopulateFields ? JSON.parse(form.autoPopulateFields as string || '{}') : {};

                                                const isWritable = writableList.includes(col.name);
                                                const isProtected = protectedList.includes(col.name);
                                                const isAutoPopulate = col.name in autoPopObj;

                                                // Determine chip style based on state
                                                let chipClass = 'bg-slate-100 text-slate-600 border-slate-200';
                                                if (isProtected) chipClass = 'bg-red-100 text-red-700 border-red-200';
                                                else if (isAutoPopulate) chipClass = 'bg-blue-100 text-blue-700 border-blue-200';
                                                else if (isWritable) chipClass = 'bg-green-100 text-green-700 border-green-200';

                                                const toggleColumn = () => {
                                                    // Cycle: neutral -> writable -> protected -> neutral
                                                    if (!isWritable && !isProtected) {
                                                        // Add to writable
                                                        setForm({ ...form, writableFields: JSON.stringify([...writableList, col.name]) });
                                                    } else if (isWritable) {
                                                        // Move to protected
                                                        setForm({
                                                            ...form,
                                                            writableFields: JSON.stringify(writableList.filter(n => n !== col.name)),
                                                            protectedFields: JSON.stringify([...protectedList, col.name])
                                                        });
                                                    } else {
                                                        // Remove from protected (back to neutral)
                                                        setForm({ ...form, protectedFields: JSON.stringify(protectedList.filter(n => n !== col.name)) });
                                                    }
                                                };

                                                return (
                                                    <button
                                                        key={col.name}
                                                        type="button"
                                                        onClick={toggleColumn}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:scale-105 ${chipClass}`}
                                                        title={`${col.name} (${col.type})${col.isPrimary ? ' - Primary Key' : ''}`}
                                                    >
                                                        {col.isPrimary && <Icons.key className="w-3 h-3 inline mr-1" />}
                                                        {col.name}
                                                        <span className="ml-1 opacity-50">({col.type})</span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Auto-Populate Section - Per-column dropdowns */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-slate-700 mb-2">{L.mutation?.autoPopulate}</label>
                                            <p className="text-xs text-slate-500 mb-3">{L.mutation?.autoPopulateHint}</p>

                                            <div className="space-y-2">
                                                {columns.filter(col => !col.isPrimary).map(col => {
                                                    // Parse current auto-populate config
                                                    const autoPopObj: Record<string, string> = form.autoPopulateFields ?
                                                        (() => { try { return JSON.parse(form.autoPopulateFields as string || '{}'); } catch { return {}; } })() : {};
                                                    const currentValue = autoPopObj[col.name] || '';

                                                    const handleAutoPopChange = (value: string) => {
                                                        const newObj = { ...autoPopObj };
                                                        if (value) {
                                                            newObj[col.name] = value;
                                                        } else {
                                                            delete newObj[col.name];
                                                        }
                                                        setForm({ ...form, autoPopulateFields: JSON.stringify(newObj) });
                                                    };

                                                    // Smart detection: if column relates to users table, suggest USER_ID
                                                    const isUserRelation = col.relationTarget?.toLowerCase().includes('user');
                                                    const hasRelation = !!col.relationTarget;

                                                    return (
                                                        <div key={col.name} className="flex items-center gap-2">
                                                            <span className={`shrink-0 w-28 px-2 py-1.5 rounded text-xs font-medium truncate ${currentValue ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                                hasRelation ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                                                    'bg-slate-100 text-slate-600 border border-slate-200'
                                                                }`} title={col.relationTarget ? `→ ${col.relationTarget}` : col.name}>
                                                                {hasRelation && <Icons.link2 className="w-3 h-3 inline mr-1" />}
                                                                {col.name}
                                                            </span>
                                                            <Select
                                                                fullWidth={false}
                                                                className={`flex-1 ${isUserRelation && !currentValue ? 'border-purple-300 bg-purple-50' : 'border-slate-200'}`}
                                                                value={currentValue}
                                                                onChange={e => handleAutoPopChange(e.target.value)}
                                                                placeholder="Select value..."
                                                                size="sm"
                                                                options={[
                                                                    { label: L.mutation?.autoPopNone || 'None', value: '' },
                                                                    ...(isUserRelation ? [{ label: L.mutation?.autoPopUserIdRecommended || 'User ID (Recommended)', value: '{{USER_ID}}' }] : []),
                                                                    ...(!isUserRelation ? [{ label: L.mutation?.autoPopUserId || 'User ID', value: '{{USER_ID}}' }] : []),
                                                                    { label: L.mutation?.autoPopNow || 'Current Timestamp', value: '{{NOW}}' },
                                                                    { label: L.mutation?.autoPopUserRole || 'User Role', value: '{{USER_ROLE}}' },
                                                                ]}
                                                            />
                                                            {currentValue && (
                                                                <span className="shrink-0 px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-mono">
                                                                    {currentValue}
                                                                </span>
                                                            )}
                                                            {hasRelation && !currentValue && (
                                                                <span className="shrink-0 px-2 py-1 bg-purple-50 text-purple-600 rounded text-[10px]">
                                                                    {L.mutation?.relationArrow}{col.relationTarget}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Validation Section - Auto-generated from Writable columns */}
                                        {(() => {
                                            const writableList: string[] = form.writableFields ? JSON.parse(form.writableFields as string || '[]') : [];
                                            if (writableList.length === 0) return null;

                                            return (
                                                <div className="border-t border-slate-100 pt-4 mt-4">
                                                    <h4 className="font-semibold text-slate-700 text-sm mb-2">{L.mutation?.validationRules}</h4>
                                                    <p className="text-xs text-slate-500 mb-3">{L.mutation?.validationHint}</p>
                                                    <p className="text-[10px] text-slate-400 mb-4 font-mono">{L.mutation?.validationSyntax}</p>

                                                    <div className="space-y-3">
                                                        {writableList.map(colName => {
                                                            // Parse validation JSON
                                                            const colInfo = columns.find(c => c.name === colName);

                                                            return (
                                                                <div key={colName} className="flex items-start gap-2">
                                                                    <span className="shrink-0 w-32 px-2 py-1.5 bg-green-100 text-green-700 rounded text-xs font-medium truncate" title={colName}>
                                                                        {colName}
                                                                    </span>
                                                                    <Input
                                                                        className="flex-1 text-xs font-mono"
                                                                        placeholder={colInfo?.nullable === false ? 'required' : 'e.g. minLength:3, maxLength:100'}
                                                                        value={getValidationRule(colName)}
                                                                        onChange={e => setValidationRule(colName, e.target.value)}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </>
                                )}
                            </div>
                        </div>
                    )}


                    {/* Tab: Security */}
                    {activeTab === 'security' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* ... existing security content ... */}
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                                <p className="text-indigo-700 text-sm font-medium flex items-center gap-2">
                                    <Icons.lock className="w-4 h-4" />
                                    {L.misc?.accessLevelHint}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Select
                                    label={L.misc?.accessLevel}
                                    className="w-full font-medium transition-colors"
                                    value={String(form.minRoleLevel ?? 0)}
                                    onChange={e => setForm({ ...form, minRoleLevel: Number(e.target.value) })}
                                    options={[
                                        { label: L.options.public || 'Public', value: '0' },
                                        { label: L.options.login || 'Login Required', value: '10' },
                                        { label: L.options.moderator || 'Moderator', value: '50' },
                                        { label: L.options.admin || 'Admin', value: '90' },
                                    ]}
                                />
                            </div>

                            <div className={`p-4 rounded-xl border-2 ${(form.minRoleLevel ?? 0) === 0
                                ? 'bg-green-50 border-green-200'
                                : (form.minRoleLevel ?? 0) < 90
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-amber-50 border-amber-200'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">
                                        {(form.minRoleLevel ?? 0) === 0 ? <Icons.globe className="w-6 h-6" /> : (form.minRoleLevel ?? 0) < 90 ? <Icons.lock className="w-6 h-6" /> : <Icons.crown className="w-6 h-6" />}
                                    </span>
                                    <div>
                                        <p className="font-semibold text-slate-800">
                                            {(form.minRoleLevel ?? 0) === 0
                                                ? L.misc?.publicEndpoint
                                                : (form.minRoleLevel ?? 0) < 90
                                                    ? L.misc?.loginRequired
                                                    : L.misc?.adminOnly}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {(form.minRoleLevel ?? 0) === 0
                                                ? L.misc?.publicEndpointHint
                                                : (form.minRoleLevel ?? 0) < 90
                                                    ? L.misc?.loginRequiredHint
                                                    : L.misc?.adminOnlyHint}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {(form.minRoleLevel ?? 0) > 0 && (
                                <>
                                    <div className="border-t border-slate-100 pt-4">
                                        <h4 className="font-semibold text-slate-700 text-sm mb-3">{L.misc?.additionalRestrictions}</h4>
                                    </div>

                                    <MultiSelect
                                        label={L.labels.roles}
                                        placeholder={L.placeholders.rolesCommaSep}
                                        options={availableRoles.map(r => r.name)}
                                        value={form.roles || ''}
                                        onChange={val => setForm({ ...form, roles: val })}
                                    />
                                    <div className="flex flex-wrap gap-2 -mt-4">
                                        {availableRoles.filter(r => (form.roles || '').includes(r.name)).map(role => (
                                            <div key={role.name} className="inline-flex items-center gap-1 text-[10px] bg-slate-100 px-2 py-1 rounded-lg">
                                                <span className="font-semibold">{role.name}</span>
                                                {role.isSuper && <span className="px-1 py-0.5 bg-red-100 text-red-600 rounded text-[8px]">{L.misc?.bypass}</span>}
                                                <span className="text-slate-400">{L.labels.levelShort}{role.level}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <MultiSelect
                                        label={L.labels.permissions}
                                        placeholder={L.placeholders.permissionsCommaSep}
                                        options={availablePermissions}
                                        value={form.permissions || ''}
                                        onChange={val => setForm({ ...form, permissions: val })}
                                    />
                                </>
                            )}

                            <div className="border-t border-slate-100 pt-4">
                                <h4 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
                                    <Icons.warning className="w-4 h-4 text-amber-500" /> {L.misc?.errorResponseOverride}
                                </h4>
                                <p className="text-[10px] text-slate-400 mb-2">{L.misc?.errorResponseHint}</p>
                                {form.path && (
                                    <p className="text-[10px] text-blue-500 mb-3 flex items-center gap-1">
                                        <Icons.zap className="w-3 h-3" />
                                        {L.misc?.autoGenFrom} <code className="bg-blue-50 px-1 rounded">{form.path}</code>
                                    </p>
                                )}
                                <div className="space-y-3">
                                    {[401, 403, 404, 500].map(code => {
                                        const info = getErrorDisplayInfo(code);
                                        return (
                                            <div key={code} className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-12 text-xs font-mono font-semibold ${code < 500 ? 'text-amber-600' : 'text-red-600'}`}>
                                                        {code}
                                                    </span>
                                                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${info.isCustom
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {info.isCustom ? 'CUSTOM' : 'AUTO'}
                                                    </span>
                                                    <code className="text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                                                        {info.errorCode}
                                                    </code>
                                                    {info.isCustom && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setErrorTemplate(code, '')}
                                                            className="text-[10px] text-red-500 hover:underline ml-auto"
                                                        >
                                                            {L.misc?.resetToAuto}
                                                        </button>
                                                    )}
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder={info.template}
                                                    value={getErrorTemplate(code)}
                                                    onChange={e => setErrorTemplate(code, e.target.value)}
                                                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 placeholder:text-slate-300"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab: Response */}
                    {activeTab === 'response' && (
                        <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-300 items-start h-[600px]">

                            <div className="flex-1 space-y-6 h-full overflow-y-auto pr-2">
                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                                    <p className="text-emerald-700 text-sm font-medium flex items-center gap-2">
                                        <Icons.upload className="w-4 h-4" />
                                        {L.misc?.responseTemplate}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">{L.labels.responseData}</label>
                                    <textarea
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 font-mono text-sm bg-slate-900 text-green-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 min-h-[300px]"
                                        value={form.responseData || ''}
                                        onChange={e => setForm({ ...form, responseData: e.target.value })}
                                        placeholder={L.placeholders.jsonData}
                                        id="responseDataEditor"
                                    />
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <h4 className="font-semibold text-slate-700 text-sm mb-2">{L.misc?.preview}</h4>
                                    <pre className="text-xs text-slate-600 font-mono whitespace-pre-wrap">
                                        {(form.responseData || '{"status": "success"}')
                                            .replace('{{DATA}}', '[...]')
                                            .replace('{{COUNT}}', '10')
                                            .replace('{{USER_ID}}', '1')
                                            .replace('{{USER_ROLE}}', 'admin')
                                            .replace(/{{item\.(\w+)}}/g, '"$1_value"')}
                                    </pre>
                                </div>
                            </div>

                            {/* Data Lineage Helper Sidebar */}
                            <div className="w-full lg:w-72 border-l border-slate-100 pl-0 lg:pl-6 h-full">
                                <DataLineageHelper
                                    dataSourceId={form.dataSourceId}
                                    onInsert={(variable) => {
                                        const textarea = document.getElementById('responseDataEditor') as HTMLTextAreaElement;
                                        if (textarea) {
                                            const start = textarea.selectionStart;
                                            const end = textarea.selectionEnd;
                                            const text = textarea.value;
                                            const before = text.substring(0, start);
                                            const after = text.substring(end, text.length);

                                            // Insert variable
                                            const newText = before + variable + after;
                                            setForm({ ...form, responseData: newText });

                                            // Restore focus and cursor
                                            setTimeout(() => {
                                                textarea.focus();
                                                textarea.setSelectionRange(start + variable.length, start + variable.length);
                                            }, 0);
                                        } else {
                                            // Fallback if ref/id fails
                                            setForm({ ...form, responseData: (form.responseData || '') + variable });
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Tab: Quick Test */}
                    {activeTab === 'test' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* ... existing test content ... */}
                            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                                <p className="text-purple-700 text-sm font-medium flex items-center gap-2">
                                    <Icons.flask className="w-4 h-4" />
                                    {L.misc?.clickToTest}
                                </p>
                            </div>

                            <div className="text-center py-8">
                                <p className="text-slate-500 mb-4">{L.misc?.clickToTest}</p>
                                <Button
                                    onClick={() => {
                                        const testUrl = `/api-management/tester?method=${form.method}&path=/green${form.path || ''}`;
                                        router.push(testUrl);
                                    }}
                                    className="gap-2"
                                >
                                    <Icons.flask className="w-4 h-4" /> {L.misc?.openInTester}
                                </Button>
                            </div>

                            {endpointId && (
                                <div className="border-t border-slate-100 pt-6">
                                    <h4 className="font-semibold text-red-600 text-sm mb-3">{L.misc?.dangerZone}</h4>
                                    <Button variant="danger" className="w-full gap-2" onClick={handleDelete}>
                                        <Icons.trash className="w-4 h-4" /> {L.buttons.delete}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

