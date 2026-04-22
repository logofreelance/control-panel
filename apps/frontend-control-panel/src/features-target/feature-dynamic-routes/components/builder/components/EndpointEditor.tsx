'use client';

import { Button, Input, Select, Switch, Card, CardContent, Badge, Label } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { cn } from '@/lib/utils';
import { Icons } from '../../../config/icons';
import { DYNAMIC_ROUTES_LABELS } from '../../../constants/ui-labels';
import { useEndpointEditor } from '../composables';
import { MultiSelect } from './MultiSelect';
import { DataLineageHelper } from './DataLineageHelper';

import { ConfirmDialog } from '@/modules/_core';

interface EndpointEditorProps {
  targetId: string;
  endpointId?: string;
  onBack?: () => void;
  onTest?: (method: string, path: string) => void;
}

const METHOD_STYLES: Record<string, string> = {
  GET: 'bg-primary/10 text-primary',
  POST: 'bg-primary/10 text-primary',
  PUT: 'bg-primary/10 text-primary',
  DELETE: 'bg-destructive/10 text-destructive',
  PATCH: 'bg-primary/10 text-primary',
};

export const EndpointEditor = ({ targetId, endpointId, onBack, onTest }: EndpointEditorProps) => {
  const L = DYNAMIC_ROUTES_LABELS.routeBuilder;

  const {
    loading,
    saving,
    form,
    setForm,
    categories,
    dataSources,
    resources,
    columns,
    relations,
    availableRoles,
    availablePermissions,
    activeTab,
    setActiveTab,
    pathError,
    setPathError,
    duplicateWarning,
    setDuplicateWarning,
    validatePath,

    handleDataSourceChange,
    handleSave,
    handleDelete,
    executeDelete,
    deleteConfirm,
    setDeleteConfirm,
  } = useEndpointEditor(targetId, endpointId, onBack);

  const getValidationRule = (colName: string): string => {
    try {
      const rules = form.validationRules ? JSON.parse(form.validationRules) : {};
      return rules[colName] || '';
    } catch {
      return '';
    }
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

  const getErrorTemplate = (statusCode: number): string => {
    try {
      const templates = form.errorTemplatesJson ? JSON.parse(form.errorTemplatesJson) : {};
      return templates[String(statusCode)] || '';
    } catch {
      return '';
    }
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

  const STATUS_ERROR_MAP: Record<number, { suffix: string; label: string }> = {
    401: { suffix: 'UNAUTHORIZED', label: 'Unauthorized' },
    403: { suffix: 'FORBIDDEN', label: 'Forbidden' },
    404: { suffix: 'NOT_FOUND', label: 'Not found' },
    500: { suffix: 'SERVER_ERROR', label: 'Server error' },
  };

  const generateSmartErrorDefault = (path: string, statusCode: number): string => {
    const slug =
      (path || '/unknown')
        .replace(/^\//, '')
        .replace(/:[^/]+/g, '')
        .replace(/\//g, '_')
        .replace(/_+/g, '_')
        .replace(/_+$/, '')
        .toUpperCase() || 'ENDPOINT';

    const errorInfo = STATUS_ERROR_MAP[statusCode] || {
      suffix: String(statusCode),
      label: 'Error',
    };
    const errorCode = `${slug}_${errorInfo.suffix}`;

    return JSON.stringify({
      status: 'error',
      code: statusCode,
      errorCode: errorCode,
      message: `${errorInfo.label} at ${path || '/'}`,
    });
  };

  const getErrorDisplayInfo = (
    statusCode: number,
  ): { isCustom: boolean; template: string; errorCode: string } => {
    const customTemplate = getErrorTemplate(statusCode);
    if (customTemplate) {
      try {
        const parsed = JSON.parse(customTemplate);
        return { isCustom: true, template: customTemplate, errorCode: parsed.errorCode || '' };
      } catch {
        return { isCustom: true, template: customTemplate, errorCode: '' };
      }
    }

    const autoTemplate = generateSmartErrorDefault(form.path || '', statusCode);
    const parsed = JSON.parse(autoTemplate);
    return { isCustom: false, template: autoTemplate, errorCode: parsed.errorCode };
  };

  const TABS = [
    { id: 'basic', label: 'basic info', Icon: Icons.globe },
    { id: 'data', label: 'data binding', Icon: Icons.database },
    { id: 'mutation', label: 'mutation settings', Icon: Icons.edit },
    { id: 'query', label: 'query settings', Icon: Icons.settings },
    { id: 'security', label: 'security', Icon: Icons.lock },
    { id: 'response', label: 'response', Icon: Icons.upload },
    { id: 'test', label: 'quick test', Icon: Icons.flask },
  ] as const;

  const isWriteOp = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(form.method || 'GET');

  return (
    <div className="space-y-6 pb-24 animate-page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <TextHeading as="h1" size="h3" className="lowercase">
            {endpointId ? L.buttons.edit : L.buttons.newEndpoint}
          </TextHeading>
          <p className="text-base text-muted-foreground lowercase">{L.subtitle}</p>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Button variant="outline" onClick={() => onBack?.()}>
            {L.buttons.cancel}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'saving...' : L.buttons.save}
          </Button>
        </div>
      </div>

      {/* Method + Path Preview */}
      <Card size="sm">
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex flex-row items-center gap-4 flex-1 min-w-0 w-full">
              <Badge variant="secondary">{(form.method || 'GET').toLowerCase()}</Badge>
              <div className="text-base text-foreground break-all flex-1 min-w-0 truncate py-2.5 px-4 bg-muted/30 rounded-xl border border-border/5">
                {form.path || '/your-endpoint'}
              </div>
            </div>

            <div className="flex flex-row items-center gap-4 w-full sm:w-auto sm:pl-4 sm:border-l border-border/10">
              {/* Access Level */}
              <Badge variant="secondary">
                {(form.minRoleLevel ?? 0) === 0
                  ? L.misc?.bypass || 'public'
                  : (form.minRoleLevel ?? 0) < 90
                    ? L.misc?.loginRequired || 'login'
                    : L.misc?.adminOnly || 'admin'}
              </Badge>

              <div className="flex items-center gap-3">
                <Switch
                  checked={form.isActive || false}
                  onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                />
                <span className="text-base text-muted-foreground lowercase">
                  {form.isActive ? L.labels.active : L.labels.inactive}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border/10 overflow-x-auto scrollbar-none bg-transparent px-2 mb-2">
        {TABS.map((tab) => {
          const TabIcon = tab.Icon;
          if (tab.id === 'mutation' && !isWriteOp) return null;
          if (tab.id === 'query' && isWriteOp) return null;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'flex-shrink-0 transition-all flex items-center justify-center lowercase border-b-2 bg-transparent gap-2 px-5 py-4',
                isActive
                  ? 'text-base font-semibold text-primary border-primary'
                  : 'text-base font-normal text-muted-foreground border-transparent hover:text-foreground',
              )}
            >
              <TabIcon className="size-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <Card>
        <CardContent>
          <div className="py-2">
            {activeTab === 'basic' && (
              <div className="space-y-6 animate-page-enter">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="col-span-1">
                    <Label className="lowercase mb-2 block px-1">method</Label>
                    <Select
                      value={form.method}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          method: e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
                        })
                      }
                      fullWidth
                      options={[
                        { label: 'get', value: 'GET' },
                        { label: 'post', value: 'POST' },
                        { label: 'put', value: 'PUT' },
                        { label: 'delete', value: 'DELETE' },
                        { label: 'patch', value: 'PATCH' },
                      ]}
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-3">
                    <Label className="lowercase mb-2 block px-1">endpoint path</Label>
                    <Input
                      placeholder="/api/v1/resource"
                      value={form.path || ''}
                      onChange={(e) => {
                        const newPath = e.target.value;
                        setForm({ ...form, path: newPath });
                        setPathError(validatePath(newPath));
                        setDuplicateWarning(null);
                      }}
                    />
                    {pathError && (
                      <p className="text-base text-destructive mt-1 lowercase px-1">{pathError}</p>
                    )}
                    {duplicateWarning && (
                      <p className="text-base text-primary mt-1 lowercase px-1">
                        {duplicateWarning}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="lowercase mb-2 block px-1">description</Label>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl border-2 border-border/70 bg-background/50 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-base min-h-[120px] placeholder:text-muted-foreground/50 outline-none"
                    value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder={L.placeholders.endpointDescription.toLowerCase()}
                    rows={3}
                  />
                </div>

                <div className="max-w-md">
                  <Label className="lowercase mb-2 block px-1">category group</Label>
                  <Select
                    value={String(form.categoryId || '')}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value || undefined })}
                    fullWidth
                    options={[
                      { label: 'uncategorized', value: '' },
                      ...categories.map((c) => ({
                        label: c.name.toLowerCase(),
                        value: String(c.id),
                      })),
                    ]}
                  />
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6 animate-page-enter">
                <p className="text-base text-muted-foreground lowercase leading-relaxed bg-muted/30 p-4 rounded-xl">
                  {L.misc?.bindToDataSource ||
                    'connect this endpoint to a dynamic database for automated data processing and rpc capabilities.'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="lowercase mb-2 block px-1">database source</Label>
                    <Select
                      value={String(form.dataSourceId || '')}
                      onChange={handleDataSourceChange}
                      fullWidth
                      options={[
                        { label: 'no binding (manual response)', value: '' },
                        ...dataSources.map((ds) => ({
                          label: ds.name.toLowerCase(),
                          value: String(ds.id),
                        })),
                      ]}
                    />
                  </div>

                  {form.dataSourceId && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label className="lowercase mb-2 block px-1">resource logic</Label>
                      <Select
                        value={String(form.resourceId || '')}
                        onChange={(e) =>
                          setForm({ ...form, resourceId: e.target.value || undefined })
                        }
                        fullWidth
                        options={[
                          { label: 'raw table data', value: '' },
                          ...resources.map((res) => ({
                            label: `${res.name.toLowerCase()}`,
                            value: String(res.id),
                          })),
                        ]}
                      />
                    </div>
                  )}
                </div>

                {form.dataSourceId && (
                  <div className="p-4 rounded-xl bg-muted/20">
                    <TextHeading as="h3" size="h5" className="lowercase mb-1">
                      data lineage preview
                    </TextHeading>
                    <p className="text-base text-muted-foreground lowercase">
                      {L.misc?.dataPreviewHint ||
                        "this endpoint will automatically stream data from the selected source using the platform's lineage engine."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'mutation' && isWriteOp && (
              <div className="space-y-8 animate-page-enter">
                <p className="text-base text-muted-foreground lowercase leading-relaxed bg-muted/30 p-4 rounded-xl">
                  {L.mutation?.title ||
                    'configure how this endpoint modifies your database. set operation types, ownership rules, and field permissions.'}
                </p>

                <div className="max-w-md">
                  <Label className="lowercase mb-2 block px-1">operation type</Label>
                  <Select
                    value={form.operationType || 'create'}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        operationType: e.target.value as 'create' | 'update' | 'delete',
                      })
                    }
                    fullWidth
                    options={[
                      { label: 'create (insert new record)', value: 'create' },
                      { label: 'update (modify existing record)', value: 'update' },
                      { label: 'delete (remove record)', value: 'delete' },
                    ]}
                  />
                </div>

                <div className="pt-2">
                  <TextHeading as="h3" size="h4" className="lowercase mb-4">
                    ownership security
                  </TextHeading>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/10 border border-border/10">
                    <Switch
                      checked={form.allowOwnerOnly !== false}
                      onCheckedChange={(checked) => setForm({ ...form, allowOwnerOnly: checked })}
                    />
                    <div>
                      <p className="text-base font-medium lowercase">
                        {L.mutation?.restrictToOwner || 'restrict to record owner'}
                      </p>
                      <p className="text-base text-muted-foreground lowercase">
                        {L.mutation?.restrictToOwnerHint ||
                          'only users who created the record can modify or delete it.'}
                      </p>
                    </div>
                  </div>

                  {form.allowOwnerOnly !== false && (
                    <div className="max-w-md animate-in slide-in-from-top-2 duration-300">
                      <Label className="lowercase mb-2 block px-1">owner reference column</Label>
                      <Input
                        placeholder="e.g. user_id"
                        value={form.ownershipColumn || ''}
                        onChange={(e) => setForm({ ...form, ownershipColumn: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <TextHeading as="h3" size="h4" className="lowercase mb-1">
                    {L.mutation?.columnSelector || 'column configuration'}
                  </TextHeading>
                  <p className="text-base text-muted-foreground lowercase mb-4">
                    {L.mutation?.columnSelectorHint ||
                      'click columns to toggle their write permission'}
                  </p>

                  {!form.dataSourceId ? (
                    <div className="text-center py-12 rounded-xl bg-muted/10 border border-dashed border-border/20">
                      <p className="text-base text-muted-foreground lowercase">
                        {L.mutation?.selectDataSourceFirst ||
                          'select a data source to configure fields.'}
                      </p>
                    </div>
                  ) : columns.length === 0 ? (
                    <div className="text-center py-12 rounded-xl bg-muted/10 border border-dashed border-border/20">
                      <p className="text-base text-muted-foreground lowercase">
                        {L.labels.loading || 'fetching schema...'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Legend */}
                      <div className="flex flex-wrap items-center gap-4 p-3 rounded-xl bg-muted/20 border border-border/5">
                        <span className="text-base text-muted-foreground lowercase mr-1">legend:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                          <span className="text-base text-muted-foreground lowercase">ignored</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="size-2.5 rounded-full bg-primary" />
                          <span className="text-base text-primary lowercase">writable</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="size-2.5 rounded-full bg-destructive" />
                          <span className="text-base text-destructive lowercase">protected</span>
                        </div>
                        <span className="text-base text-muted-foreground/50 lowercase ml-auto hidden sm:inline">click to cycle →</span>
                      </div>

                      {/* Column Chips */}
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const writableList: string[] = form.writableFields
                            ? JSON.parse((form.writableFields as string) || '[]')
                            : [];
                          const protectedList: string[] = form.protectedFields
                            ? JSON.parse((form.protectedFields as string) || '[]')
                            : [];
                          const autoPopObj: Record<string, string> = form.autoPopulateFields
                            ? JSON.parse((form.autoPopulateFields as string) || '{}')
                            : {};

                          return columns.map((col) => {
                            const isWritable = writableList.includes(col.name);
                            const isProtected = protectedList.includes(col.name);
                            const isAutoPopulate = col.name in autoPopObj;

                          const toggleColumn = () => {
                            if (!isWritable && !isProtected) {
                              setForm({
                                ...form,
                                writableFields: JSON.stringify([...writableList, col.name]),
                              });
                            } else if (isWritable) {
                              setForm({
                                ...form,
                                writableFields: JSON.stringify(
                                  writableList.filter((n) => n !== col.name),
                                ),
                                protectedFields: JSON.stringify([...protectedList, col.name]),
                              });
                            } else {
                              setForm({
                                ...form,
                                protectedFields: JSON.stringify(
                                  protectedList.filter((n) => n !== col.name),
                                ),
                              });
                            }
                          };

                          const stateLabel = isProtected ? 'protected' : isWritable ? 'writable' : isAutoPopulate ? 'auto' : '';
                          const StateIcon = isProtected ? Icons.shield : isWritable ? Icons.edit : isAutoPopulate ? Icons.sparkles : null;

                          return (
                            <button
                              key={col.name}
                              type="button"
                              onClick={toggleColumn}
                              className={cn(
                                'px-4 py-2.5 rounded-xl text-base transition-all flex items-center gap-2 border group relative',
                                isProtected
                                  ? 'bg-destructive/5 text-destructive border-destructive/10 hover:bg-destructive/10'
                                  : isAutoPopulate || isWritable
                                    ? 'bg-primary/5 text-primary border-primary/10 hover:bg-primary/10'
                                    : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50',
                              )}
                            >
                              {col.isPrimary ? <Icons.key className="size-3.5" /> : StateIcon ? <StateIcon className="size-3.5" /> : null}
                              {col.name}
                              <span className="opacity-40 text-base">({col.type})</span>
                              {stateLabel && (
                                <Badge variant={isProtected ? 'destructive' : 'default'} className="text-[11px] px-1.5 py-0 h-5 lowercase">
                                  {stateLabel}
                                </Badge>
                              )}
                            </button>
                          );
                        });
                        })()}
                      </div>

                      {/* --- PAYLOAD DISCOVERY SECTION --- */}
                      <div className="pt-8 border-t border-border/10 mt-8 space-y-4">
                          <TextHeading as="h3" size="h4" className="lowercase flex items-center gap-2">
                              <Icons.zap className="size-5 text-primary" />
                              expected payload structure
                          </TextHeading>
                          <p className="text-base text-muted-foreground lowercase mb-4">
                              use this json structure to interact with this endpoint. it includes your writable fields and child relations for nested writes.
                          </p>
                          
                          <div className="relative group">
                              <pre className="p-6 rounded-2xl bg-muted/30 border border-border/5 text-sm font-mono overflow-x-auto text-foreground leading-relaxed">
{JSON.stringify((() => {
    const example: Record<string, any> = {};
    
    // Core fields
    const writableList: string[] = form.writableFields
        ? JSON.parse((form.writableFields as string) || '[]')
        : [];

    writableList.forEach(field => {
        example[field] = "value";
    });

    // Virtual Relations (Nested Writes)
    if (relations && relations.length > 0) {
        relations.forEach(rel => {
            const alias = rel.alias || rel.target?.tableName;
            if (alias && (rel.type === 'has_many' || rel.type === 'has_one')) {
                example[alias] = rel.type === 'has_many' ? [{ /* child data */ }] : { /* child data */ };
            }
        });
    }
    
    return example;
})(), null, 2)}
                              </pre>
                              <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                                  <Icons.info className="size-5 text-primary shrink-0" />
                                  <p className="text-base text-muted-foreground lowercase">
                                      tip: you can also send child data using relation aliases (e.g. <b>"styles": [ ... ]</b>) to perform nested creates.
                                  </p>
                              </div>
                          </div>
                      </div>

                      {/* Auto-Populate */}
                      <div className="pt-4 space-y-4">
                        <Label className="lowercase block px-1">auto-populate variables</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(() => {
                            const autoPopObj: Record<string, string> = form.autoPopulateFields
                              ? (() => {
                                  try {
                                    return JSON.parse((form.autoPopulateFields as string) || '{}');
                                  } catch {
                                    return {};
                                  }
                                })()
                              : {};

                            return columns
                              .filter((col) => !col.isPrimary)
                              .map((col) => {
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

                              return (
                                <div
                                  key={col.name}
                                  className="flex flex-row items-center gap-3 p-3 rounded-xl bg-muted/10 border border-border/5"
                                >
                                  <span className="shrink-0 w-28 text-base text-muted-foreground truncate lowercase">
                                    {col.name}
                                  </span>
                                  <Select
                                    value={currentValue}
                                    onChange={(e) => handleAutoPopChange(e.target.value)}
                                    placeholder="inject..."
                                    fullWidth
                                    options={[
                                      { label: 'none', value: '' },
                                      { label: 'user id', value: '{{USER_ID}}' },
                                      { label: 'timestamp', value: '{{NOW}}' },
                                      { label: 'user role', value: '{{USER_ROLE}}' },
                                    ]}
                                  />
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>

                      {/* Validation Rules */}
                      {(() => {
                        const writableList: string[] = form.writableFields
                          ? JSON.parse((form.writableFields as string) || '[]')
                          : [];
                        if (writableList.length === 0) return null;

                        return (
                          <div className="pt-4 space-y-4">
                            <TextHeading as="h3" size="h4" className="lowercase">
                              validation rules
                            </TextHeading>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {writableList.map((colName) => (
                                <div
                                  key={colName}
                                  className="flex flex-row items-center gap-3 p-3 rounded-xl bg-muted/10 border border-border/5"
                                >
                                  <span className="shrink-0 w-28 text-base text-muted-foreground truncate lowercase">
                                    {colName}
                                  </span>
                                  <Input
                                    placeholder="e.g. min:5"
                                    value={getValidationRule(colName)}
                                    onChange={(e) => setValidationRule(colName, e.target.value)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'query' && !isWriteOp && (
              <div className="space-y-8 animate-page-enter">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/5">
                  <TextHeading as="h3" size="h4" className="lowercase mb-1">{L.querySettings.title}</TextHeading>
                  <p className="text-base text-muted-foreground lowercase">{L.querySettings.subtitle}</p>
                </div>

                {/* Pagination */}
                <div className="space-y-4">
                  <div className="flex flex-row items-center justify-between gap-4 p-4 rounded-xl bg-muted/10 border border-border/5">
                    <div className="space-y-1">
                      <Label className="text-base lowercase">{L.querySettings.pagination.title}</Label>
                      <p className="text-sm text-muted-foreground lowercase">{L.querySettings.pagination.enableHint}</p>
                    </div>
                    <Switch
                      checked={form.allowDynamicPagination ?? true}
                      onCheckedChange={(checked) => setForm({ ...form, allowDynamicPagination: checked })}
                    />
                  </div>
                  
                  {form.allowDynamicPagination && (
                    <div className="max-w-xs pl-4 border-l-2 border-primary/20">
                      <Label className="lowercase mb-2 block px-1">{L.querySettings.pagination.defaultLimit}</Label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={form.defaultLimit || 20}
                        onChange={(e) => setForm({ ...form, defaultLimit: parseInt(e.target.value) || 20 })}
                      />
                    </div>
                  )}
                </div>

                {/* Filtering */}
                <div className="space-y-6">
                  <div className="flex flex-row items-center justify-between gap-4 p-4 rounded-xl bg-muted/10 border border-border/5">
                    <div className="space-y-1">
                      <Label className="text-base lowercase">{L.querySettings.filtering.title}</Label>
                      <p className="text-sm text-muted-foreground lowercase">{L.querySettings.filtering.enableHint}</p>
                    </div>
                    <Switch
                      checked={form.allowDynamicFilters || false}
                      onCheckedChange={(checked) => setForm({ ...form, allowDynamicFilters: checked })}
                    />
                  </div>

                  {form.allowDynamicFilters && (
                    <div className="pl-4 border-l-2 border-primary/20 space-y-4">
                      <Label className="lowercase mb-2 block px-1">{L.querySettings.filtering.filterableFields}</Label>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                           const filterableList: string[] = form.filterableFields
                             ? JSON.parse((form.filterableFields as string) || '[]')
                             : [];
                           
                           return columns.map(col => {
                             const isFilterable = filterableList.includes(col.name);
                             const toggleFilter = () => {
                               const newList = isFilterable 
                                 ? filterableList.filter(n => n !== col.name)
                                 : [...filterableList, col.name];
                               setForm({ ...form, filterableFields: JSON.stringify(newList) });
                             };

                             return (
                               <button
                                 key={col.name}
                                 type="button"
                                 onClick={toggleFilter}
                                 className={cn(
                                   'px-3 py-1.5 rounded-lg text-[13px] transition-all flex items-center gap-1.5 border',
                                   isFilterable 
                                     ? 'bg-primary/5 text-primary border-primary/20' 
                                     : 'bg-muted/20 text-muted-foreground border-transparent'
                                 )}
                               >
                                 {isFilterable && <Icons.check className="size-3" />}
                                 {col.name}
                               </button>
                             );
                           });
                        })()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sorting */}
                <div className="space-y-6">
                  <div className="flex flex-row items-center justify-between gap-4 p-4 rounded-xl bg-muted/10 border border-border/5">
                    <div className="space-y-1">
                      <Label className="text-base lowercase">{L.querySettings.sorting.title}</Label>
                      <p className="text-sm text-muted-foreground lowercase">{L.querySettings.sorting.enableHint}</p>
                    </div>
                    <Switch
                      checked={form.allowDynamicSort || false}
                      onCheckedChange={(checked) => setForm({ ...form, allowDynamicSort: checked })}
                    />
                  </div>

                  {form.allowDynamicSort && (
                    <div className="pl-4 border-l-2 border-primary/20 space-y-4">
                      <Label className="lowercase mb-2 block px-1">{L.querySettings.sorting.sortableFields}</Label>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                           const sortableList: string[] = form.sortableFields
                             ? JSON.parse((form.sortableFields as string) || '[]')
                             : [];
                           
                           return columns.map(col => {
                             const isSortable = sortableList.includes(col.name);
                             const toggleSort = () => {
                               const newList = isSortable 
                                 ? sortableList.filter(n => n !== col.name)
                                 : [...sortableList, col.name];
                               setForm({ ...form, sortableFields: JSON.stringify(newList) });
                             };

                             return (
                               <button
                                 key={col.name}
                                 type="button"
                                 onClick={toggleSort}
                                 className={cn(
                                   'px-3 py-1.5 rounded-lg text-[13px] transition-all flex items-center gap-1.5 border',
                                   isSortable 
                                     ? 'bg-primary/5 text-primary border-primary/20' 
                                     : 'bg-muted/20 text-muted-foreground border-transparent'
                                 )}
                               >
                                 {isSortable && <Icons.check className="size-3" />}
                                 {col.name}
                               </button>
                             );
                           });
                        })()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Detail View Resolution */}
                <div className="space-y-6">
                  <div className="flex flex-row items-center justify-between gap-4 p-4 rounded-xl bg-muted/10 border border-border/5">
                    <div className="space-y-1">
                      <Label className="text-base lowercase">{L.querySettings.detailView.title}</Label>
                      <p className="text-sm text-muted-foreground lowercase">{L.querySettings.detailView.enableHint}</p>
                    </div>
                    <Switch
                      checked={form.allowDetailView ?? true}
                      onCheckedChange={(checked) => setForm({ ...form, allowDetailView: checked })}
                    />
                  </div>

                  {form.allowDetailView && (
                    <div className="pl-4 border-l-2 border-primary/20 space-y-4">
                      <div className="max-w-md">
                        <Label className="lowercase mb-2 block px-1">{L.querySettings.detailView.lookupColumn}</Label>
                        <Select
                          value={form.lookupColumn || 'id'}
                          onChange={(e) => setForm({ ...form, lookupColumn: e.target.value })}
                          fullWidth
                          options={[
                            { label: 'id (uuid)', value: 'id' },
                            ...columns.map(col => ({
                              label: col.name.toLowerCase(),
                              value: col.name
                            })).filter(o => o.value !== 'id')
                          ]}
                        />
                        <p className="text-[13px] text-muted-foreground mt-2 lowercase px-1">
                           {L.querySettings.detailView.lookupColumnHint}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 animate-page-enter">
                <p className="text-base text-muted-foreground lowercase leading-relaxed bg-muted/30 p-4 rounded-xl">
                  {L.misc?.accessLevelHint ||
                    'define who can access this endpoint. you can set global access levels or restrict to specific roles and permissions.'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="lowercase px-1">base access level</Label>
                    <Select
                      fullWidth
                      value={String(form.minRoleLevel ?? 0)}
                      onChange={(e) => setForm({ ...form, minRoleLevel: Number(e.target.value) })}
                      options={[
                        { label: 'public (any user)', value: '0' },
                        { label: 'login required', value: '10' },
                        { label: 'moderator only', value: '50' },
                        { label: 'admin only', value: '90' },
                      ]}
                    />

                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="flex flex-row items-center gap-3">
                        <Icons.lock className="size-5 text-primary" />
                        <div>
                          <p className="font-medium text-base lowercase">
                            {(form.minRoleLevel ?? 0) === 0
                              ? 'public endpoint'
                              : (form.minRoleLevel ?? 0) < 90
                                ? 'protected access'
                                : 'admin restricted'}
                          </p>
                          <p className="text-base text-muted-foreground lowercase">
                            {L.misc?.accessLevel}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <MultiSelect
                      label="required roles"
                      options={availableRoles.map((r) => r.name)}
                      value={form.roles || ''}
                      onChange={(val) => setForm({ ...form, roles: val })}
                      placeholder="select roles..."
                    />
                  </div>
                  <div className="space-y-6">
                    <MultiSelect
                      label="required permissions"
                      options={availablePermissions}
                      value={form.permissions || ''}
                      onChange={(val) => setForm({ ...form, permissions: val })}
                      placeholder="select permissions..."
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'response' && (
              <div className="space-y-8 animate-page-enter">
                {/* Status Templates */}
                <div className="space-y-4">
                  <TextHeading as="h3" size="h4" className="lowercase">
                    status templates
                  </TextHeading>
                  <p className="text-base text-muted-foreground lowercase">
                    {L.misc?.errorResponseHint ||
                      'customize json responses for specific http status codes.'}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[401, 403, 404, 500].map((code) => {
                      const info = getErrorDisplayInfo(code);
                      return (
                        <Card key={code}>
                          <CardContent>
                            <div className="flex items-center justify-between mb-4 mt-2">
                              <Badge variant={info.isCustom ? 'default' : 'secondary'}>
                                {code} {STATUS_ERROR_MAP[code].label.toLowerCase()}
                              </Badge>
                              {info.isCustom && (
                                <Button variant="ghost" onClick={() => setErrorTemplate(code, '')}>
                                  reset
                                </Button>
                              )}
                            </div>
                            <textarea
                              className="w-full p-4 rounded-xl bg-muted/30 border border-border/5 text-base min-h-[140px] outline-none"
                              value={info.template}
                              onChange={(e) => setErrorTemplate(code, e.target.value)}
                              placeholder="json response..."
                            />
                            <p className="text-base text-muted-foreground mt-2 lowercase">
                              code: {info.errorCode}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Response Data Structure */}
                <div className="space-y-4 pt-6 border-t border-border/10">
                  <TextHeading as="h3" size="h4" className="lowercase">
                    successful response mapper
                  </TextHeading>
                  <p className="text-base text-muted-foreground lowercase">
                    {L.misc.responseTemplate ||
                      'define the output structure for successful requests.'}
                  </p>
                  <textarea
                    id="responseDataEditor"
                    className="w-full px-4 py-3 rounded-xl border-2 border-border/70 bg-background/50 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-base min-h-[300px] placeholder:text-muted-foreground/50 outline-none"
                    value={form.responseData || ''}
                    onChange={(e) => setForm({ ...form, responseData: e.target.value })}
                    placeholder={L.placeholders.jsonData.toLowerCase()}
                  />
                </div>

                {/* Lineage Helper Preview */}
                <div className="pt-6 border-t border-border/10">
                  <DataLineageHelper
                    targetId={targetId}
                    dataSourceId={form.dataSourceId}
                    onInsert={(variable) => {
                      const text = form.responseData || '';
                      setForm({ ...form, responseData: text + variable });
                    }}
                  />
                </div>
              </div>
            )}

            {activeTab === 'test' && (
              <div className="space-y-12 animate-page-enter py-16">
                <div className="text-center max-w-lg mx-auto">
                  <div className="size-16 bg-primary/5 rounded-xl flex items-center justify-center mx-auto mb-6 border border-primary/10">
                    <Icons.flask className="size-8 text-primary" />
                  </div>
                  <TextHeading as="h3" size="h3" className="mb-4 lowercase">
                    launch in api tester
                  </TextHeading>
                  <p className="text-base text-muted-foreground lowercase mb-8">
                    validate your endpoint logic in real-time. the platform will automatically
                    inject necessary headers and parameters.
                  </p>
                  <Button onClick={() => onTest?.(form.method || 'GET', form.path || '/')} size="lg">
                    <Icons.zap className="size-5 mr-3" /> open interactive tester
                  </Button>
                </div>

                {endpointId && (
                  <div className="max-w-md mx-auto pt-12">
                    <div className="p-6 rounded-xl bg-destructive/5 text-center border border-destructive/10">
                      <p className="text-destructive text-base font-semibold lowercase mb-2">
                        danger zone
                      </p>
                      <p className="text-base text-muted-foreground lowercase mb-6">
                        permanently delete this endpoint from the global lineage. this action cannot
                        be undone.
                      </p>
                      <Button variant="destructive" className="w-full" onClick={handleDelete}>
                        <Icons.trash className="size-4 mr-3" /> destroy endpoint
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={executeDelete}
        title="Delete Endpoint"
        message="Are you sure you want to permanently delete this endpoint from the global lineage?"
        confirmText="Destroy Endpoint"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
