'use client';

import { Button, Input, Select, Switch, Card, CardContent, Badge, Label } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { cn } from '@/lib/utils';
import { Icons } from '../../../config/icons';
import { DYNAMIC_ROUTES_LABELS } from '../../../constants/ui-labels';
import { useEndpointEditor } from '../composables';
import { MultiSelect } from './MultiSelect';
import { DataLineageHelper } from './DataLineageHelper';

interface EndpointEditorProps {
	targetId: string;
	endpointId?: string;
	onBack?: () => void;
}

const METHOD_STYLES: Record<string, string> = {
	GET: 'bg-blue-500/10 text-blue-600',
	POST: 'bg-emerald-500/10 text-emerald-600',
	PUT: 'bg-amber-500/10 text-amber-600',
	DELETE: 'bg-red-500/10 text-red-600',
	PATCH: 'bg-purple-500/10 text-purple-600',
};

export const EndpointEditor = ({ targetId, endpointId, onBack }: EndpointEditorProps) => {
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
	} = useEndpointEditor(targetId, endpointId, onBack);

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

	const STATUS_ERROR_MAP: Record<number, { suffix: string; label: string }> = {
		401: { suffix: 'UNAUTHORIZED', label: 'Unauthorized' },
		403: { suffix: 'FORBIDDEN', label: 'Forbidden' },
		404: { suffix: 'NOT_FOUND', label: 'Not found' },
		500: { suffix: 'SERVER_ERROR', label: 'Server error' },
	};

	const generateSmartErrorDefault = (path: string, statusCode: number): string => {
		const slug = (path || '/unknown')
			.replace(/^\//, '')
			.replace(/:[^/]+/g, '')
			.replace(/\//g, '_')
			.replace(/_+/g, '_')
			.replace(/_+$/, '')
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
		<div className="space-y-8 pb-24 animate-in fade-in duration-500">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
				<div>
					<TextHeading size="h3" weight="semibold" className="text-2xl sm:text-3xl lowercase tracking-tight">
                        {endpointId ? L.buttons.edit : L.buttons.newEndpoint}
                    </TextHeading>
					<p className="text-sm text-muted-foreground/60 lowercase leading-relaxed">{L.subtitle}</p>
				</div>
				<div className="flex flex-row items-center gap-2">
					<Button variant="outline" size="sm" onClick={() => onBack?.()} className="rounded-xl lowercase text-xs h-10 px-6">
                        {L.buttons.cancel}
                    </Button>
					<Button size="sm" onClick={handleSave} disabled={saving} className="rounded-xl lowercase text-xs h-10 px-8">
                        {saving ? "saving..." : L.buttons.save}
                    </Button>
				</div>
			</div>

			{/* Method + Path Preview */}
			<Card className="rounded-3xl border-2 border-foreground/5 shadow-none bg-card overflow-hidden">
				<CardContent className="p-4 sm:p-5">
					<div className="flex flex-col sm:flex-row gap-4 items-center">
						<div className="flex flex-row items-center gap-4 flex-1 min-w-0 w-full">
							<Badge className={cn(
								'rounded-xl px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider shrink-0 w-20 text-center',
								METHOD_STYLES[form.method || 'GET'] || METHOD_STYLES.GET
							)}>
								{form.method || 'GET'}
							</Badge>
							<code className="text-foreground/80 font-mono text-sm flex-1 min-w-0 truncate font-semibold bg-muted/40 px-5 py-2.5 rounded-2xl border-2 border-border/10">
								{form.path || '/your-endpoint'}
							</code>
						</div>

						<div className="flex flex-row items-center justify-between sm:justify-end gap-6 w-full sm:w-auto sm:ml-auto sm:pl-8 sm:border-l sm:border-t-0 border-t border-border/10 pt-4 sm:pt-0">
							{/* Access Level */}
							{(form.minRoleLevel ?? 0) === 0 ? (
								<div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-500/10">
									<Icons.globe className="w-3 h-3" /> {L.misc?.bypass || 'PUBLIC'}
								</div>
							) : (form.minRoleLevel ?? 0) < 90 ? (
								<div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-500/5 px-3 py-1.5 rounded-xl border border-blue-500/10">
									<Icons.lock className="w-3 h-3" /> {L.misc?.loginRequired || 'LOGIN'}
								</div>
							) : (
								<div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-500/5 px-3 py-1.5 rounded-xl border border-amber-500/10">
									<Icons.crown className="w-3 h-3" /> {L.misc?.adminOnly || 'ADMIN'}
								</div>
							)}

							<div className="flex items-center gap-3 pr-2">
								<Switch
									checked={form.isActive || false}
									onCheckedChange={checked => setForm({ ...form, isActive: checked })}
								/>
								<span className={cn(
									'text-[10px] font-bold uppercase tracking-wider',
									form.isActive ? 'text-emerald-600' : 'text-muted-foreground/30'
								)}>
									{form.isActive ? L.labels.active : L.labels.inactive}
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tabs Navigation */}
			<Card className="rounded-3xl border-2 border-foreground/5 shadow-none overflow-hidden">
				<div className="flex border-b border-border/10 overflow-x-auto scrollbar-none bg-muted/20">
					{TABS.map(tab => {
						const TabIcon = tab.Icon;
						if (tab.id === 'mutation' && !isWriteOp) return null;
						return (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id as typeof activeTab)}
								className={cn(
									'flex-shrink-0 sm:flex-1 px-6 py-4 text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-2 lowercase',
									activeTab === tab.id
										? 'text-foreground bg-background border-b-2 border-foreground shadow-none'
										: 'text-muted-foreground/40 hover:text-foreground hover:bg-muted/30'
								)}
							>
								<TabIcon className={cn("w-4 h-4 transition-transform", activeTab === tab.id && "scale-110")} />
								<span className={activeTab === tab.id ? 'inline' : 'hidden sm:inline'}>{tab.label}</span>
							</button>
						);
					})}
				</div>

				<CardContent className="p-6 md:p-10">
					{activeTab === 'basic' && (
						<div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
							<div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
								<div className="col-span-1">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 mb-2 block px-1">method</Label>
									<Select
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
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 mb-2 block px-1">endpoint path</Label>
									<Input
										placeholder="/api/v1/resource"
										value={form.path || ''}
										onChange={e => {
											const newPath = e.target.value;
											setForm({ ...form, path: newPath });
											setPathError(validatePath(newPath));
											setDuplicateWarning(null);
										}}
										className={cn("h-11 rounded-xl bg-muted/20 border-border/10", (pathError || duplicateWarning) && 'border-red-500/50')}
									/>
									{pathError && <p className="text-[10px] text-red-500 mt-1.5 lowercase px-1">{pathError}</p>}
									{duplicateWarning && <p className="text-[10px] text-amber-500 mt-1.5 lowercase px-1">{duplicateWarning}</p>}
								</div>
							</div>

							<div>
								<Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 mb-2 block px-1">description</Label>
								<textarea
									className="w-full px-4 py-3 rounded-xl border-2 border-border/10 bg-muted/20 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm min-h-[120px]"
									value={form.description || ''}
									onChange={e => setForm({ ...form, description: e.target.value })}
									placeholder={L.placeholders.endpointDescription}
									rows={3}
								/>
							</div>

                            <div className="max-w-md">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 mb-2 block px-1">category group</Label>
                                <Select
                                    value={String(form.categoryId || '')}
                                    onChange={e => setForm({ ...form, categoryId: e.target.value || undefined })}
                                    options={[
                                        { label: 'uncategorized', value: '' },
                                        ...categories.map(c => ({ label: c.name.toLowerCase(), value: String(c.id) }))
                                    ]}
                                />
                            </div>
						</div>
					)}

					{activeTab === 'data' && (
						<div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
							<div className="bg-blue-500/5 border-2 border-blue-500/10 rounded-2xl p-6 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
								    <Icons.database className="w-5 h-5 text-blue-500" />
                                </div>
								<p className="text-blue-700/80 text-sm font-medium leading-relaxed lowercase">
									{L.misc?.bindToDataSource || "connect this endpoint to a dynamic database for automated data processing and rpc capabilities."}
								</p>
							</div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 mb-2 block px-1">database source</Label>
                                    <Select
                                        value={String(form.dataSourceId || '')}
                                        onChange={(e) => setForm({ ...form, dataSourceId: e.target.value || undefined, resourceId: undefined })}
                                        options={[
                                            { label: 'no binding (manual response)', value: '' },
                                            ...dataSources.map(ds => ({ label: ds.name.toLowerCase(), value: String(ds.id) }))
                                        ]}
                                    />
                                </div>

                                {form.dataSourceId && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 mb-2 block px-1">resource logic</Label>
                                        <Select
                                            value={String(form.resourceId || '')}
                                            onChange={e => setForm({ ...form, resourceId: e.target.value || undefined })}
                                            options={[
                                                { label: 'raw table data', value: '' },
                                                ...resources.map(res => ({ label: `${res.name.toLowerCase()}`, value: String(res.id) }))
                                            ]}
                                        />
                                        {resources.length === 0 && (
                                            <p className="text-[10px] text-amber-500 mt-2 lowercase italic px-1">{L.misc?.noSpecificResources || "no custom logic resources found for this data source."}</p>
                                        )}
                                    </div>
                                )}
                            </div>

							{form.dataSourceId && (
								<Card className="rounded-3xl border-2 border-dashed border-border/20 shadow-none bg-muted/5">
									<CardContent className="p-6">
										<TextHeading size="h6" weight="semibold" className="text-sm lowercase mb-2">data lineage preview</TextHeading>
										<p className="text-xs text-muted-foreground/40 lowercase">{L.misc?.dataPreviewHint || "this endpoint will automatically stream data from the selected source using the platform's lineage engine."}</p>
									</CardContent>
								</Card>
							)}
						</div>
					)}

					{activeTab === 'mutation' && isWriteOp && (
						<div className="space-y-10 animate-in slide-in-from-bottom-2 duration-500">
							<div className="bg-emerald-500/5 border-2 border-emerald-500/10 rounded-2xl p-6 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
								    <Icons.edit className="w-5 h-5 text-emerald-500" />
                                </div>
								<p className="text-emerald-700/80 text-sm font-medium leading-relaxed lowercase">
									{L.mutation?.title || "configure how this endpoint modifies your database. set operation types, ownership rules, and field permissions."}
								</p>
							</div>

                            <div className="max-w-md">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 mb-2 block px-1">operation type</Label>
                                <Select
                                    value={form.operationType || 'create'}
                                    onChange={e => setForm({ ...form, operationType: e.target.value as 'create' | 'update' | 'delete' })}
                                    options={[
                                        { label: 'create (insert new record)', value: 'create' },
                                        { label: 'update (modify existing record)', value: 'update' },
                                        { label: 'delete (remove record)', value: 'delete' },
                                    ]}
                                />
                            </div>

							<div className="border-t border-border/10 pt-8 space-y-6">
								<TextHeading size="h6" weight="semibold" className="text-sm lowercase">ownership security</TextHeading>
								<div className="flex flex-row items-center gap-6 p-4 rounded-2xl bg-muted/20 border-2 border-border/5">
									<Switch
										checked={form.allowOwnerOnly !== false}
										onCheckedChange={checked => setForm({ ...form, allowOwnerOnly: checked })}
									/>
									<div>
										<p className="text-sm font-semibold lowercase">{L.mutation?.restrictToOwner || "restrict to record owner"}</p>
										<p className="text-xs text-muted-foreground/40 lowercase">{L.mutation?.restrictToOwnerHint || "only users who created the record can modify or delete it."}</p>
									</div>
								</div>

								{form.allowOwnerOnly !== false && (
									<div className="max-w-md animate-in slide-in-from-top-2 duration-300">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 mb-2 block px-1">owner reference column</Label>
										<Input
											placeholder="e.g. user_id"
											value={form.ownershipColumn || ''}
											onChange={e => setForm({ ...form, ownershipColumn: e.target.value })}
                                            className="rounded-xl h-11 bg-muted/20 border-border/10"
										/>
									</div>
								)}
							</div>

							<div className="border-t border-border/10 pt-8">
								<TextHeading size="h6" weight="semibold" className="text-sm lowercase mb-2">{L.mutation?.columnSelector || 'field configuration'}</TextHeading>
								<p className="text-xs text-muted-foreground/40 lowercase mb-6">{L.mutation?.columnSelectorHint || "select which database fields are writable, protected, or auto-populated by the system."}</p>

								{!form.dataSourceId ? (
									<div className="text-center py-12 rounded-3xl border-2 border-dashed border-border/10 bg-muted/5">
										<Icons.database className="w-8 h-8 text-muted-foreground/20 mx-auto mb-4" />
										<p className="text-xs text-muted-foreground/40 lowercase">{L.mutation?.selectDataSourceFirst || "select a data source to configure fields."}</p>
									</div>
								) : columns.length === 0 ? (
									<div className="text-center py-12 rounded-3xl border-2 border-dashed border-border/10 bg-muted/5">
										<Icons.database className="w-8 h-8 text-muted-foreground/20 mx-auto mb-4 animate-pulse" />
										<p className="text-xs text-muted-foreground/40 lowercase">{L.labels.loading || "fetching schema..."}</p>
									</div>
								) : (
									<div className="space-y-8">
										{/* Legend */}
										<div className="flex flex-wrap gap-4 px-1">
											{[
												{ color: 'bg-emerald-500', label: 'writable' },
												{ color: 'bg-red-500', label: 'protected' },
												{ color: 'bg-blue-500', label: 'auto' },
                                                { color: 'bg-muted-foreground/20', label: 'none' },
											].map(l => (
                                                <div key={l.label} className="flex items-center gap-2">
                                                    <div className={cn("size-2.5 rounded-full", l.color)} />
                                                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{l.label}</span>
                                                </div>
                                            ))}
										</div>

										{/* Column Chips */}
										<div className="flex flex-wrap gap-2">
											{columns.map(col => {
												const writableList: string[] = form.writableFields ? JSON.parse(form.writableFields as string || '[]') : [];
												const protectedList: string[] = form.protectedFields ? JSON.parse(form.protectedFields as string || '[]') : [];
												const autoPopObj: Record<string, string> = form.autoPopulateFields ? JSON.parse(form.autoPopulateFields as string || '{}') : {};

												const isWritable = writableList.includes(col.name);
												const isProtected = protectedList.includes(col.name);
												const isAutoPopulate = col.name in autoPopObj;

												let chipClass = 'bg-muted/30 text-muted-foreground/60 border-border/10';
												if (isProtected) chipClass = 'bg-red-500/10 text-red-600 border-red-500/20 shadow-[0_0_15px_-5px_rgba(239,68,68,0.4)]';
												else if (isAutoPopulate) chipClass = 'bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-[0_0_15px_-5px_rgba(59,130,246,0.4)]';
												else if (isWritable) chipClass = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.4)]';

												const toggleColumn = () => {
													if (!isWritable && !isProtected) {
														setForm({ ...form, writableFields: JSON.stringify([...writableList, col.name]) });
													} else if (isWritable) {
														setForm({
															...form,
															writableFields: JSON.stringify(writableList.filter(n => n !== col.name)),
															protectedFields: JSON.stringify([...protectedList, col.name])
														});
													} else {
														setForm({ ...form, protectedFields: JSON.stringify(protectedList.filter(n => n !== col.name)) });
													}
												};

												return (
													<button
														key={col.name}
														type="button"
														onClick={toggleColumn}
														className={cn(
                                                            "px-4 py-2.5 rounded-xl text-xs font-bold border-2 transition-all hover:scale-105 active:scale-95 flex items-center gap-2",
                                                            chipClass
                                                        )}
													>
														{col.isPrimary && <Icons.key className="w-3.5 h-3.5 shrink-0 opacity-40" />}
														{col.name}
														<span className="opacity-30 font-mono text-[9px]">({col.type})</span>
													</button>
												);
											})}
										</div>

										{/* Auto-Populate */}
										<div className="pt-6 space-y-4">
											<Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 block px-1">auto-populate variables</Label>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
												{columns.filter(col => !col.isPrimary).map(col => {
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

													const isUserRelation = col.relationTarget?.toLowerCase().includes('user');
													const hasRelation = !!col.relationTarget;

													return (
														<div key={col.name} className="flex flex-row items-center gap-3 p-3 rounded-2xl bg-muted/10 border-2 border-border/5 group hover:border-foreground/5 transition-colors">
															<span className={cn(
																'shrink-0 w-28 px-3 py-1.5 rounded-xl text-[10px] font-bold truncate lowercase tracking-tight',
																currentValue ? 'bg-blue-500/10 text-blue-600' :
																	hasRelation ? 'bg-violet-500/10 text-violet-600' :
																		'bg-muted text-muted-foreground/40'
															)}>
																{col.name}
															</span>
															<Select
																className="flex-1"
																value={currentValue}
																onChange={e => handleAutoPopChange(e.target.value)}
																placeholder="inject variable..."
																size="sm"
																options={[
																	{ label: 'none', value: '' },
																	...(isUserRelation ? [{ label: 'user id (recommended)', value: '{{USER_ID}}' }] : []),
																	...(!isUserRelation ? [{ label: 'user id', value: '{{USER_ID}}' }] : []),
																	{ label: 'current timestamp', value: '{{NOW}}' },
																	{ label: 'authenticated user role', value: '{{USER_ROLE}}' },
																]}
															/>
														</div>
													);
												})}
											</div>
										</div>

										{/* Validation Rules */}
										{(() => {
											const writableList: string[] = form.writableFields ? JSON.parse(form.writableFields as string || '[]') : [];
											if (writableList.length === 0) return null;

											return (
												<div className="border-t border-border/10 pt-8 mt-4 space-y-6">
													<TextHeading size="h6" weight="semibold" className="text-sm lowercase">validation rules & constraints</TextHeading>
													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														{writableList.map(colName => {
															const colInfo = columns.find(c => c.name === colName);
															return (
																<div key={colName} className="flex flex-row items-center gap-3 p-3 rounded-2xl bg-muted/10 border-2 border-border/5">
																	<span className="shrink-0 w-32 px-3 py-1.5 bg-emerald-500/5 text-emerald-600 rounded-xl text-[10px] font-bold truncate lowercase tracking-tight">
																		{colName}
																	</span>
																	<Input
																		className="flex-1 h-9 rounded-lg bg-background border-border/10 text-xs font-mono"
																		placeholder={colInfo?.nullable === false ? 'required' : 'e.g. min:5, max:100'}
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
									</div>
								)}
							</div>
						</div>
					)}


					{activeTab === 'security' && (
						<div className="space-y-10 animate-in slide-in-from-bottom-2 duration-500">
							<div className="bg-indigo-500/5 border-2 border-indigo-500/10 rounded-2xl p-6 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
								    <Icons.lock className="w-5 h-5 text-indigo-500" />
                                </div>
								<p className="text-indigo-700/80 text-sm font-medium leading-relaxed lowercase">
									{L.misc?.accessLevelHint || "define who can access this endpoint. you can set global access levels or restrict to specific roles and permissions."}
								</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 px-1">base access level</Label>
                                    <Select
                                        className="w-full"
                                        value={String(form.minRoleLevel ?? 0)}
                                        onChange={e => setForm({ ...form, minRoleLevel: Number(e.target.value) })}
                                        options={[
                                            { label: 'public (any user)', value: '0' },
                                            { label: 'login required', value: '10' },
                                            { label: 'moderator only', value: '50' },
                                            { label: 'admin only', value: '90' },
                                        ]}
                                    />
                                    
                                    <div className={cn(
                                        "p-6 rounded-3xl border-2 transition-colors",
                                        (form.minRoleLevel ?? 0) === 0 ? 'bg-emerald-500/5 border-emerald-500/10' :
                                        (form.minRoleLevel ?? 0) < 90 ? 'bg-blue-500/5 border-blue-500/10' :
                                        'bg-amber-500/5 border-amber-500/10'
                                    )}>
                                        <div className="flex flex-row items-center gap-4">
                                            <div className="size-10 rounded-xl bg-background flex items-center justify-center shadow-none border-2 border-border/5">
                                                {(form.minRoleLevel ?? 0) === 0 ? <Icons.globe className="w-5 h-5 text-emerald-500" /> : 
                                                 (form.minRoleLevel ?? 0) < 90 ? <Icons.lock className="w-5 h-5 text-blue-500" /> : 
                                                 <Icons.crown className="w-5 h-5 text-amber-500" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm lowercase leading-tight">
                                                    {(form.minRoleLevel ?? 0) === 0 ? "public endpoint" : 
                                                     (form.minRoleLevel ?? 0) < 90 ? "protected access" : 
                                                     "internal admin restricted"}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground/40 lowercase mt-1">
                                                    {L.misc?.accessLevelDesc || "this setting applies platform-wide security protocols to the path lineage."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 px-1">granular role restrictions</Label>
                                    <MultiSelect
                                        label="authorized roles"
                                        placeholder="select roles..."
                                        options={availableRoles.map(r => r.name)}
                                        value={form.roles || ''}
                                        onChange={val => setForm({ ...form, roles: val })}
                                    />
                                    <MultiSelect
                                        label="required permissions"
                                        placeholder="select permissions..."
                                        options={availablePermissions}
                                        value={form.permissions || ''}
                                        onChange={val => setForm({ ...form, permissions: val })}
                                    />
                                </div>
                            </div>

							<div className="border-t border-border/10 pt-10 space-y-6">
								<div className="flex items-center gap-3">
									<Icons.warning className="w-5 h-5 text-amber-500" />
                                    <TextHeading size="h6" weight="semibold" className="text-sm lowercase">error response overrides</TextHeading>
								</div>
								
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{[401, 403, 404, 500].map(code => {
										const info = getErrorDisplayInfo(code);
										return (
											<div key={code} className="p-4 rounded-2xl bg-muted/10 border-2 border-border/5 space-y-3 group hover:border-foreground/5 transition-all">
												<div className="flex flex-row items-center justify-between">
													<div className="flex items-center gap-3">
                                                        <span className={cn(
                                                            "w-12 h-6 flex items-center justify-center rounded-lg text-[10px] font-bold",
                                                            code < 500 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                        )}>
                                                            {code}
                                                        </span>
                                                        <Badge variant="secondary" className="rounded-lg text-[8px] font-bold uppercase px-2 py-0.5 border-none">
                                                            {info.isCustom ? 'custom' : 'auto-generated'}
                                                        </Badge>
                                                    </div>
													{info.isCustom && (
														<button
															type="button"
															onClick={() => setErrorTemplate(code, '')}
															className="text-[10px] font-bold text-red-500/50 hover:text-red-500 lowercase transition-colors"
														>
															reset
														</button>
													)}
												</div>
                                                <div className="bg-background/40 p-2 rounded-lg border border-border/5">
                                                    <code className="text-[10px] text-muted-foreground/40 font-mono">CODE: {info.errorCode}</code>
                                                </div>
												<input
													type="text"
													placeholder={info.template}
													value={getErrorTemplate(code)}
													onChange={e => setErrorTemplate(code, e.target.value)}
													className="w-full h-10 px-4 text-xs bg-background border-2 border-border/10 rounded-xl font-mono focus:outline-none focus:border-foreground/20 placeholder:text-muted-foreground/20"
												/>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					)}

					{activeTab === 'response' && (
						<div className="flex flex-col lg:flex-row gap-8 animate-in slide-in-from-bottom-2 duration-500 h-[600px]">
							<div className="flex-1 space-y-6 h-full overflow-y-auto pr-2 scrollbar-none">
								<div className="bg-violet-500/5 border-2 border-violet-500/10 rounded-2xl p-6 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                                        <Icons.upload className="w-5 h-5 text-violet-500" />
                                    </div>
                                    <p className="text-violet-700/80 text-sm font-medium leading-relaxed lowercase">
                                        {L.misc?.responseTemplate || "design the structure of your api response. use the mapper engine to inject dynamic data from the database into your json structure."}
                                    </p>
                                </div>

								<div className="space-y-4">
									<Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 px-1">response data structure (json mapper)</Label>
									<textarea
										className="w-full px-5 py-4 rounded-3xl border-2 border-border/10 font-mono text-sm bg-muted/30 text-foreground/80 focus:outline-none focus:border-foreground/20 min-h-[400px] scrollbar-none transition-all"
										value={form.responseData || ''}
										onChange={e => setForm({ ...form, responseData: e.target.value })}
										placeholder={L.placeholders.jsonData}
										id="responseDataEditor"
									/>
								</div>
							</div>

							{/* Data Lineage Helper Sidebar */}
							<div className="w-full lg:w-80 border-l border-border/10 pl-0 lg:pl-10 h-full overflow-y-auto pr-2 scrollbar-none">
								<DataLineageHelper
									targetId={targetId}
									dataSourceId={form.dataSourceId}
									onInsert={(variable) => {
										const textarea = document.getElementById('responseDataEditor') as HTMLTextAreaElement;
										if (textarea) {
											const start = textarea.selectionStart;
											const end = textarea.selectionEnd;
											const text = textarea.value;
											const before = text.substring(0, start);
											const after = text.substring(end, text.length);
											const newText = before + variable + after;
											setForm({ ...form, responseData: newText });
											setTimeout(() => {
												textarea.focus();
												textarea.setSelectionRange(start + variable.length, start + variable.length);
											}, 10);
										}
									}}
								/>
                                <div className="mt-8 p-6 rounded-3xl bg-muted/10 border-2 border-dashed border-border/10">
                                    <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mb-3">schema preview</p>
                                    <pre className="text-[11px] text-muted-foreground/40 font-mono truncate">
                                        {(form.responseData || '{"status": "success"}').substring(0, 50)}...
                                    </pre>
                                </div>
							</div>
						</div>
					)}

					{activeTab === 'test' && (
						<div className="space-y-10 animate-in slide-in-from-bottom-2 duration-500 py-10">
							<div className="text-center max-w-lg mx-auto">
                                <div className="size-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-none border-4 border-primary/5">
                                    <Icons.flask className="size-10 text-primary" />
                                </div>
                                <TextHeading size="h4" className="mb-4 lowercase tracking-tight">launch in api tester</TextHeading>
								<p className="text-sm text-muted-foreground/40 lowercase mb-10 leading-relaxed">
                                    validate your endpoint logic in real-time. the platform will automatically inject necessary headers and parameters based on your configuration.
                                </p>
								<Button
									onClick={() => onBack?.()}
                                    size="lg"
									className="rounded-2xl h-14 px-10 gap-3 text-sm lowercase"
								>
									<Icons.zap className="size-5" /> open interactive tester
								</Button>
							</div>

							{endpointId && (
								<div className="border-t border-border/10 pt-16 max-w-md mx-auto">
									<div className="p-6 rounded-3xl border-2 border-red-500/5 bg-red-500/5 text-center">
                                        <p className="text-red-500/60 text-xs font-bold uppercase tracking-widest mb-4">danger zone</p>
                                        <p className="text-xs text-red-500/40 lowercase mb-8">permanently delete this endpoint from the global lineage. this action cannot be undone.</p>
                                        <Button variant="destructive" className="w-full h-11 rounded-xl gap-2 text-xs lowercase" onClick={handleDelete}>
                                            <Icons.trash className="w-4 h-4" /> destroy endpoint
                                        </Button>
                                    </div>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
