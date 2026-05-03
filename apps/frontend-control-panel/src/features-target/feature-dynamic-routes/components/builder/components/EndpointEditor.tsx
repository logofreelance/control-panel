'use client';
import { useState } from 'react';

import { Button, Input, Select, Switch, Card, CardContent, Badge, Label, Popover, PopoverTrigger, PopoverContent, Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui';
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
    tableColumnsMap,
    fetchTableColumns,
  } = useEndpointEditor(targetId, endpointId, onBack);

  const [activeRel, setActiveRel] = useState<string | null>(null);
  const [openDataSource, setOpenDataSource] = useState(false);
  const [openResource, setOpenResource] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);

  const safeParseJSON = <T,>(json: unknown, fallback: T): T => {
    if (json === null || json === undefined || json === '') return fallback;
    if (typeof json !== 'string') return json as unknown as T;
    try {
      return JSON.parse(json);
    } catch {
      return fallback;
    }
  };

  const getValidationRule = (colName: string): string => {
    try {
      const rules = safeParseJSON<Record<string, string>>(form.validationRules, {});
      return rules[colName] || '';
    } catch {
      return '';
    }
  };

  const setValidationRule = (colName: string, value: string) => {
    try {
      const rules = safeParseJSON<Record<string, string>>(form.validationRules, {});
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
      const templates = safeParseJSON<Record<string, string>>(form.errorTemplatesJson, {});
      return templates[String(statusCode)] || '';
    } catch {
      return '';
    }
  };

  const setErrorTemplate = (statusCode: number, value: string) => {
    try {
      const templates = safeParseJSON<Record<string, string>>(form.errorTemplatesJson, {});
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
        const parsed = safeParseJSON<Record<string, string>>(customTemplate, {});
        return { isCustom: true, template: customTemplate, errorCode: parsed.errorCode || '' };
      } catch {
        return { isCustom: true, template: customTemplate, errorCode: '' };
      }
    }

    const autoTemplate = generateSmartErrorDefault(form.path || '', statusCode);
    const parsed = safeParseJSON<Record<string, string>>(autoTemplate, {});
    return { isCustom: false, template: autoTemplate, errorCode: parsed.errorCode };
  };

  const [showGuide, setShowGuide] = useState(false);
  const [copiedRule, setCopiedRule] = useState<string | null>(null);

  const copyRule = (rule: string) => {
    navigator.clipboard.writeText(rule);
    setCopiedRule(rule);
    setTimeout(() => setCopiedRule(null), 1500);
  };

  const VALIDATION_RULES = [
    { rule: 'required', desc: 'field wajib diisi' },
    { rule: 'min:3', desc: 'minimal 3 karakter' },
    { rule: 'max:255', desc: 'maksimal 255 karakter' },
    { rule: 'email', desc: 'harus format email' },
    { rule: 'numeric', desc: 'harus angka' },
    { rule: 'url', desc: 'harus format URL' },
    { rule: 'boolean', desc: 'harus true/false/0/1' },
    { rule: 'date', desc: 'harus format tanggal' },
    { rule: 'json', desc: 'harus JSON valid' },
    { rule: 'in:a,b,c', desc: 'harus salah satu dari daftar' },
    { rule: 'uuid', desc: 'harus format UUID' },
    { rule: 'slug', desc: 'huruf kecil, angka, strip' },
  ];

  const AUTOPOPULATE_RULES = [
    { rule: '{{USER_ID}}', desc: 'ID user yang login' },
    { rule: '{{NOW}}', desc: 'timestamp sekarang' },
    { rule: '0', desc: 'nilai default angka' },
    { rule: 'default_text', desc: 'nilai default teks' },
  ];

  const renderValidationGuide = () => (
    <div className="rounded-xl border border-border/20 bg-muted/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setShowGuide(!showGuide)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-2 lowercase font-medium">
          <Icons.info className="size-3.5" />
          validation guide — click to {showGuide ? 'hide' : 'expand'}
        </span>
        <Icons.chevronDown className={cn('size-3.5 transition-transform', showGuide && 'rotate-180')} />
      </button>
      {showGuide && (
        <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200 border-t border-border/10 pt-3">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">validation rules <span className="font-normal lowercase">(click to copy)</span></p>
            <div className="flex flex-wrap gap-1.5">
              {VALIDATION_RULES.map(v => (
                <button
                  key={v.rule}
                  type="button"
                  onClick={() => copyRule(v.rule)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border flex items-center gap-1.5',
                    copiedRule === v.rule
                      ? 'bg-green-500/10 text-green-600 border-green-500/30'
                      : 'bg-background text-foreground border-border/30 hover:border-primary/40 hover:bg-primary/5'
                  )}
                >
                  {copiedRule === v.rule ? <Icons.check className="size-2.5" /> : <Icons.copy className="size-2.5 opacity-40" />}
                  {v.rule}
                  <span className="opacity-50 font-sans text-[10px]">— {v.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">combine with pipe <code className="text-primary">|</code></p>
            <div className="flex flex-wrap gap-1.5">
              {[
                'required|min:3',
                'required|email',
                'required|min:1|max:255',
                'numeric|min:0',
                'required|in:active,inactive',
              ].map(combo => (
                <button
                  key={combo}
                  type="button"
                  onClick={() => copyRule(combo)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border',
                    copiedRule === combo
                      ? 'bg-green-500/10 text-green-600 border-green-500/30'
                      : 'bg-primary/5 text-primary border-primary/20 hover:bg-primary/10'
                  )}
                >
                  {copiedRule === combo ? <Icons.check className="size-2.5 mr-1" /> : <Icons.copy className="size-2.5 opacity-40 mr-1" />}
                  {combo}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">auto-populate values <span className="font-normal lowercase">(click to copy)</span></p>
            <div className="flex flex-wrap gap-1.5">
              {AUTOPOPULATE_RULES.map(v => (
                <button
                  key={v.rule}
                  type="button"
                  onClick={() => copyRule(v.rule)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border flex items-center gap-1.5',
                    copiedRule === v.rule
                      ? 'bg-green-500/10 text-green-600 border-green-500/30'
                      : 'bg-background text-foreground border-border/30 hover:border-primary/40 hover:bg-primary/5'
                  )}
                >
                  {copiedRule === v.rule ? <Icons.check className="size-2.5" /> : <Icons.copy className="size-2.5 opacity-40" />}
                  {v.rule}
                  <span className="opacity-50 font-sans text-[10px]">— {v.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

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
                  <Popover open={openCategory} onOpenChange={setOpenCategory}>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCategory}
                          className="w-full justify-between h-11 px-4 text-base font-normal bg-background"
                        >
                          <span className="truncate">
                            {form.categoryId
                              ? categories.find((c) => String(c.id) === String(form.categoryId))?.name?.toLowerCase() || 'unknown category'
                              : 'uncategorized'}
                          </span>
                          <Icons.chevronDown className="ml-2 size-4 shrink-0 opacity-50" />
                        </Button>
                      }
                    />
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="search category..." className="h-10 text-base" />
                        <CommandList>
                          <CommandEmpty className="lowercase py-4 text-center text-sm text-muted-foreground">no category found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="uncategorized"
                              onSelect={() => {
                                setForm({ ...form, categoryId: undefined });
                                setOpenCategory(false);
                              }}
                              className="lowercase text-base py-3 px-3 my-0.5 rounded-lg !bg-transparent hover:!bg-muted data-[selected=true]:!bg-muted"
                            >
                              uncategorized
                              <Icons.check
                                className={cn(
                                  "ml-auto size-4",
                                  !form.categoryId ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                            {categories.map((c) => (
                              <CommandItem
                                key={c.id}
                                value={c.name.toLowerCase()}
                                onSelect={() => {
                                  setForm({ ...form, categoryId: String(c.id) });
                                  setOpenCategory(false);
                                }}
                                className="lowercase text-base py-3 px-3 my-0.5 rounded-lg !bg-transparent hover:!bg-muted data-[selected=true]:!bg-muted"
                              >
                                {c.name.toLowerCase()}
                                <Icons.check
                                  className={cn(
                                    "ml-auto size-4",
                                    String(form.categoryId) === String(c.id) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                    <Popover open={openDataSource} onOpenChange={setOpenDataSource}>
                      <PopoverTrigger
                        render={
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openDataSource}
                            className="w-full justify-between h-11 px-4 text-base font-normal bg-background"
                          >
                            <span className="truncate">
                              {form.dataSourceId
                                ? dataSources.find((ds) => String(ds.id) === String(form.dataSourceId))?.name?.toLowerCase() || 'unknown source'
                                : 'no binding (manual response)'}
                            </span>
                            <Icons.chevronDown className="ml-2 size-4 shrink-0 opacity-50" />
                          </Button>
                        }
                      />
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="search database source..." className="h-10 text-base" />
                          <CommandList>
                            <CommandEmpty className="lowercase py-4 text-center text-sm text-muted-foreground">no data source found.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                value="no binding (manual response)"
                                onSelect={() => {
                                  handleDataSourceChange({ target: { value: '' } } as any);
                                  setOpenDataSource(false);
                                }}
                                className="lowercase text-base py-3 px-3 my-0.5 rounded-lg !bg-transparent hover:!bg-muted data-[selected=true]:!bg-muted"
                              >
                                no binding (manual response)
                                <Icons.check
                                  className={cn(
                                    "ml-auto size-4",
                                    !form.dataSourceId ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                              {dataSources.map((ds) => (
                                <CommandItem
                                  key={ds.id}
                                  value={ds.name.toLowerCase()}
                                  onSelect={() => {
                                    handleDataSourceChange({ target: { value: String(ds.id) } } as any);
                                    setOpenDataSource(false);
                                  }}
                                  className="lowercase text-base py-3 px-3 my-0.5 rounded-lg !bg-transparent hover:!bg-muted data-[selected=true]:!bg-muted"
                                >
                                  {ds.name.toLowerCase()}
                                  <Icons.check
                                    className={cn(
                                      "ml-auto size-4",
                                      String(form.dataSourceId) === String(ds.id) ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {form.dataSourceId && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label className="lowercase mb-2 block px-1">resource logic</Label>
                      <Popover open={openResource} onOpenChange={setOpenResource}>
                        <PopoverTrigger
                          render={
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openResource}
                              className="w-full justify-between h-11 px-4 text-base font-normal bg-background"
                            >
                              <span className="truncate">
                                {form.resourceId
                                  ? resources.find((res) => String(res.id) === String(form.resourceId))?.name?.toLowerCase() || 'unknown resource'
                                  : 'raw table data'}
                              </span>
                              <Icons.chevronDown className="ml-2 size-4 shrink-0 opacity-50" />
                            </Button>
                          }
                        />
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="search resource..." className="h-10 text-base" />
                            <CommandList>
                              <CommandEmpty className="lowercase py-4 text-center text-sm text-muted-foreground">no resource found.</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  value="raw table data"
                                  onSelect={() => {
                                    setForm({ ...form, resourceId: undefined });
                                    setOpenResource(false);
                                  }}
                                  className="lowercase text-base py-3 px-3 my-0.5 rounded-lg !bg-transparent hover:!bg-muted data-[selected=true]:!bg-muted"
                                >
                                  raw table data
                                  <Icons.check
                                    className={cn(
                                      "ml-auto size-4",
                                      !form.resourceId ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                                {resources.map((res) => (
                                  <CommandItem
                                    key={res.id}
                                    value={res.name.toLowerCase()}
                                    onSelect={() => {
                                      setForm({ ...form, resourceId: String(res.id) });
                                      setOpenResource(false);
                                    }}
                                    className="lowercase text-base py-3 px-3 my-0.5 rounded-lg !bg-transparent hover:!bg-muted data-[selected=true]:!bg-muted"
                                  >
                                    {res.name.toLowerCase()}
                                    <Icons.check
                                      className={cn(
                                        "ml-auto size-4",
                                        String(form.resourceId) === String(res.id) ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
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

                {/* Lookup Column - Only for PUT/PATCH/DELETE */}
                {['PUT', 'PATCH', 'DELETE'].includes(form.method || '') && (
                  <div className="pt-2">
                    <TextHeading as="h3" size="h4" className="lowercase mb-1">
                      record lookup column
                    </TextHeading>
                    <p className="text-base text-muted-foreground lowercase mb-4">
                      the database column used to match the URL parameter (e.g. <code className="text-primary">/api/v1/packages/:slug</code>). default is <b>id</b>.
                    </p>
                    <div className="max-w-md">
                      <Select
                        value={form.lookupColumn || 'id'}
                        onChange={(e) => setForm({ ...form, lookupColumn: e.target.value })}
                        fullWidth
                        options={[
                          { label: 'id (default)', value: 'id' },
                          ...columns
                            .filter(c => c.name !== 'id' && c.name !== 'created_at' && c.name !== 'updated_at')
                            .map(c => ({ label: `${c.name} (${c.type})`, value: c.name }))
                        ]}
                      />
                      <p className="text-xs text-muted-foreground mt-2 italic px-1">
                        choose a unique column. the URL parameter value will be matched against this column.
                      </p>
                    </div>
                  </div>
                )}

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
                      <Select
                        value={form.ownershipColumn || 'user_id'}
                        onChange={(e) => setForm({ ...form, ownershipColumn: e.target.value })}
                        fullWidth
                        options={[
                          { label: 'user_id (default)', value: 'user_id' },
                          ...columns
                            .filter(c => c.name !== 'user_id' && c.name !== 'id' && c.name !== 'created_at' && c.name !== 'updated_at')
                            .map(c => ({ label: `${c.name} (${c.type})`, value: c.name }))
                        ]}
                      />
                      <p className="text-[13px] text-muted-foreground mt-2 lowercase px-1">
                        the column that stores the user ID to match against the authenticated user.
                      </p>
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
                          const writableList: string[] = safeParseJSON(form.writableFields, []);
                          const protectedList: string[] = safeParseJSON(form.protectedFields, []);
                          const autoPopObj: Record<string, string> = safeParseJSON(form.autoPopulateFields, {});

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

                      {/* --- RELATIONAL WRITE PERMISSIONS --- */}
                      <div className="pt-8 border-t border-border/10 mt-8">
                        <TextHeading as="h3" size="h4" className="lowercase mb-1">
                          relational write permissions
                        </TextHeading>
                        <p className="text-base text-muted-foreground lowercase mb-4">
                          select which child relations can be modified or created through this endpoint.
                        </p>

                        {relations.length === 0 ? (
                          <div className="p-4 rounded-xl bg-muted/10 border border-dashed border-border/20">
                            <p className="text-base text-muted-foreground lowercase text-center py-4">no relations found for this data source.</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="flex flex-wrap gap-2">
                              {(() => {
                                // Normalize: support legacy array format and new object format  
                                const rawRels = safeParseJSON<Record<string, any>>(form.writableRelations, {});
                                const normalizeRel = (val: any) => {
                                  if (Array.isArray(val)) return { fields: val, validation: {}, autoPopulate: {} };
                                  if (val && typeof val === 'object' && val.fields) return val;
                                  return { fields: [], validation: {}, autoPopulate: {} };
                                };
                                const writableRels: Record<string, any> = {};
                                for (const [k, v] of Object.entries(rawRels)) {
                                  writableRels[k] = normalizeRel(v);
                                }

                                return relations.map(rel => {
                                  const alias = rel.alias || rel.targetTable || rel.target?.tableName;
                                  if (!alias || !isNaN(Number(alias))) return null;
                                  
                                  const isWritable = alias in writableRels;
                                  const isActive = activeRel === alias;
                                  const fieldCount = isWritable ? (writableRels[alias]?.fields?.length || 0) : 0;

                                  const toggleRelation = () => {
                                    const newObj = { ...writableRels };
                                    if (isWritable) {
                                      delete newObj[alias];
                                      if (activeRel === alias) setActiveRel(null);
                                    } else {
                                      newObj[alias] = { fields: [], validation: {}, autoPopulate: {} };
                                      if (rel.targetId) fetchTableColumns(rel.targetId);
                                    }
                                    setForm({ ...form, writableRelations: JSON.stringify(newObj) });
                                  };

                                  const openDetail = (e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    if (!isWritable) {
                                       const newObj = { ...writableRels, [alias]: { fields: [], validation: {}, autoPopulate: {} } };
                                       setForm({ ...form, writableRelations: JSON.stringify(newObj) });
                                    }
                                    setActiveRel(activeRel === alias ? null : alias);
                                    if (rel.targetId) fetchTableColumns(rel.targetId);
                                  };

                                  return (
                                    <div key={alias} className="relative group">
                                      <button
                                        type="button"
                                        onClick={openDetail}
                                        className={cn(
                                          'px-4 py-2.5 rounded-xl text-base transition-all flex items-center gap-2 border',
                                          isWritable
                                            ? 'bg-primary/5 text-primary border-primary/10 hover:bg-primary/10'
                                            : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50',
                                          activeRel === alias && 'ring-2 ring-primary ring-offset-2'
                                        )}
                                      >
                                        <Icons.link className="size-3.5" />
                                        {alias}
                                        <Badge variant="outline" className="text-[10px] lowercase px-1.5 h-5 border-primary/20">
                                          {String(rel.type || 'rel').toLowerCase().replace('_', ' ')}
                                        </Badge>
                                        {isWritable && (
                                          <div className="flex items-center gap-1 ml-1 pl-2 border-l border-primary/20">
                                             <span className="text-[10px] font-bold">{fieldCount} cols</span>
                                             <Icons.chevronDown className={cn("size-3 transition-transform", activeRel === alias && "rotate-180")} />
                                          </div>
                                        )}
                                      </button>
                                      
                                      {/* Quick Toggle Switch (Unbind) */}
                                      {isWritable && (
                                         <button 
                                          onClick={(e) => { e.stopPropagation(); toggleRelation(); }}
                                          className="absolute -top-2 -right-2 size-5 rounded-full bg-destructive text-white flex items-center justify-center scale-0 group-hover:scale-100 transition-transform shadow-lg"
                                         >
                                           <Icons.close className="size-3" />
                                         </button>
                                      )}
                                    </div>
                                  );
                                });
                              })()}
                            </div>

                            {/* --- RELATION COLUMN SELECTOR (ACTIVE) --- */}
                            {(() => {
                               if (!activeRel) return null;
                               
                               const rel = relations.find(r => (r.alias || r.targetTable || r.target?.tableName) === activeRel);
                               if (!rel) return null;

                               const targetId = rel.targetId;
                               const targetCols = tableColumnsMap[targetId] || [];
                                                              const rawRels = safeParseJSON<Record<string, any>>(form.writableRelations, {});
                               
                               // Normalize: support legacy array format and new object format
                               const normalizeRelConfig = (val: any): { fields: string[]; validation: Record<string,string>; autoPopulate: Record<string,string> } => {
                                 if (Array.isArray(val)) return { fields: val, validation: {}, autoPopulate: {} };
                                 if (val && typeof val === 'object' && val.fields) return { fields: val.fields || [], validation: val.validation || {}, autoPopulate: val.autoPopulate || {} };
                                 return { fields: [], validation: {}, autoPopulate: {} };
                               };
                               
                               const writableRels: Record<string, any> = {};
                               for (const [k, v] of Object.entries(rawRels)) {
                                 writableRels[k] = normalizeRelConfig(v);
                               }
                               
                               const relConfig = writableRels[activeRel] || { fields: [], validation: {}, autoPopulate: {} };
                               const selectedCols: string[] = relConfig.fields;

                               const updateRelConfig = (newConfig: any) => {
                                  const newObj = { ...writableRels, [activeRel]: newConfig };
                                  setForm({ ...form, writableRelations: JSON.stringify(newObj) });
                               };

                               const toggleChildCol = (colName: string) => {
                                  const newFields = selectedCols.includes(colName)
                                    ? selectedCols.filter(c => c !== colName)
                                    : [...selectedCols, colName];
                                  updateRelConfig({ ...relConfig, fields: newFields });
                               };

                               const setChildValidation = (colName: string, rule: string) => {
                                  const newVal = { ...relConfig.validation };
                                  if (rule) { newVal[colName] = rule; } else { delete newVal[colName]; }
                                  updateRelConfig({ ...relConfig, validation: newVal });
                               };

                               const setChildAutoPopulate = (colName: string, value: string) => {
                                  const newAP = { ...relConfig.autoPopulate };
                                  if (value) { newAP[colName] = value; } else { delete newAP[colName]; }
                                  updateRelConfig({ ...relConfig, autoPopulate: newAP });
                               };

                               return (
                                 <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 animate-in zoom-in-95 duration-200">
                                    <div className="flex items-center justify-between mb-4">
                                       <div className="flex items-center gap-2">
                                          <Icons.settings className="size-4 text-primary" />
                                          <TextHeading as="h4" size="h5" className="lowercase">
                                            configuring columns for: <span className="text-primary">{activeRel}</span>
                                          </TextHeading>
                                       </div>
                                       <Button variant="ghost" size="sm" onClick={() => setActiveRel(null)}>
                                          <Icons.close className="size-4" />
                                       </Button>
                                    </div>

                                    {targetCols.length === 0 ? (
                                       <p className="text-base text-muted-foreground lowercase text-center py-4 italic">loading child schema...</p>
                                    ) : (
                                       <div className="space-y-6">
                                          {/* Column Chips */}
                                          <div>
                                            <p className="text-xs text-muted-foreground lowercase mb-2 font-medium">writable columns</p>
                                            <div className="flex flex-wrap gap-2">
                                               {targetCols.map((col: any) => {
                                                  const isColWritable = selectedCols.includes(col.name);
                                                  return (
                                                    <button
                                                      key={col.name}
                                                      type="button"
                                                      onClick={() => toggleChildCol(col.name)}
                                                      className={cn(
                                                        'px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 border',
                                                        isColWritable
                                                          ? 'bg-primary text-primary-foreground border-primary'
                                                          : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                                                      )}
                                                    >
                                                      {isColWritable ? <Icons.check className="size-3" /> : <Icons.plus className="size-3 opacity-50" />}
                                                      {col.name}
                                                      <span className="opacity-60 text-[10px]">({col.type})</span>
                                                    </button>
                                                  );
                                               })}
                                            </div>
                                          </div>

                                          {/* Validation & Auto-Populate for selected columns */}
                                          {selectedCols.length > 0 && (
                                            <div className="space-y-4 pt-4 border-t border-primary/10">
                                              <p className="text-xs text-muted-foreground lowercase font-medium flex items-center gap-2">
                                                <Icons.shield className="size-3.5" /> validation rules & auto-populate
                                              </p>
                                              {renderValidationGuide()}
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {selectedCols.map(colName => (
                                                  <div key={colName} className="p-3 rounded-xl bg-background border border-border/30 space-y-2">
                                                    <p className="text-sm font-medium text-primary lowercase">{colName}</p>
                                                    <div>
                                                      <Label className="text-[11px] text-muted-foreground lowercase block mb-1">validation</Label>
                                                      <Input
                                                        className="h-8 text-sm"
                                                        placeholder="e.g. required|min:3|max:255"
                                                        value={relConfig.validation[colName] || ''}
                                                        onChange={(e) => setChildValidation(colName, e.target.value)}
                                                      />
                                                    </div>
                                                    <div>
                                                      <Label className="text-[11px] text-muted-foreground lowercase block mb-1">auto-populate</Label>
                                                      <Input
                                                        className="h-8 text-sm"
                                                        placeholder="e.g. 0, {{USER_ID}}, default_value"
                                                        value={relConfig.autoPopulate[colName] || ''}
                                                        onChange={(e) => setChildAutoPopulate(colName, e.target.value)}
                                                      />
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                       </div>
                                    )}
                                    <p className="mt-4 text-xs text-muted-foreground italic">
                                       * only checked columns will be allowed to be written during nested save operations.
                                    </p>
                                 </div>
                               );
                            })()}
                          </div>
                        )}
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
    const writableList: string[] = safeParseJSON(form.writableFields, []);

    writableList.forEach(field => {
        example[field] = "value";
    });

    // Virtual Relations (Nested Writes)
    const rawRels = safeParseJSON<Record<string, any>>(form.writableRelations, {});
    const normalizeRel = (val: any) => {
      if (Array.isArray(val)) return { fields: val };
      if (val && typeof val === 'object' && val.fields) return val;
      return { fields: [] };
    };

    if (relations && relations.length > 0) {
        relations.forEach(rel => {
            const alias = rel.alias || rel.targetTable || rel.target?.tableName;
            if (alias && alias in rawRels) {
                const relConfig = normalizeRel(rawRels[alias]);
                const childExample: Record<string, any> = {};
                const childCols: string[] = relConfig.fields || [];
                if (childCols.length > 0) {
                    childCols.forEach((c: string) => childExample[c] = "value");
                } else {
                    childExample["..."] = "all fields allowed";
                }
                
                example[alias] = (rel.type === 'HAS_MANY' || rel.type === 'has_many') ? [childExample] : childExample;
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
                                    return safeParseJSON<Record<string, string>>(form.autoPopulateFields, {});
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
                          ? safeParseJSON<string[]>(form.writableFields, [])
                          : [];
                        if (writableList.length === 0) return null;

                        return (
                          <div className="pt-4 space-y-4">
                            <TextHeading as="h3" size="h4" className="lowercase">
                              validation rules
                            </TextHeading>
                            {renderValidationGuide()}
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
                             ? safeParseJSON<string[]>(form.filterableFields, [])
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
                             ? safeParseJSON<string[]>(form.sortableFields, [])
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

                {/* Ownership Security (for GET) */}
                <div className="space-y-4">
                  <div className="flex flex-row items-center justify-between gap-4 p-4 rounded-xl bg-muted/10 border border-border/5">
                    <div className="space-y-1">
                      <Label className="text-base lowercase">ownership filter</Label>
                      <p className="text-sm text-muted-foreground lowercase">
                        scope results to the logged-in user only. useful for personal data like profiles, orders, etc.
                      </p>
                    </div>
                    <Switch
                      checked={form.allowOwnerOnly || false}
                      onCheckedChange={(checked) => setForm({ ...form, allowOwnerOnly: checked })}
                    />
                  </div>

                  {form.allowOwnerOnly && (
                    <div className="pl-4 border-l-2 border-primary/20 space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="max-w-md">
                        <Label className="lowercase mb-2 block px-1">owner reference column</Label>
                        <Select
                          value={form.ownershipColumn || 'user_id'}
                          onChange={(e) => setForm({ ...form, ownershipColumn: e.target.value })}
                          fullWidth
                          options={[
                            { label: 'user_id (default)', value: 'user_id' },
                            ...columns
                              .filter(c => c.name !== 'user_id' && c.name !== 'id' && c.name !== 'created_at' && c.name !== 'updated_at')
                              .map(c => ({ label: `${c.name} (${c.type})`, value: c.name }))
                          ]}
                        />
                        <p className="text-[13px] text-muted-foreground mt-2 lowercase px-1">
                          the column that stores the user ID to match against the authenticated user.
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
