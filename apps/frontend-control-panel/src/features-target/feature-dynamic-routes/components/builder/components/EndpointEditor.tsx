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
	GET: 'bg-chart-3/10 text-chart-3',
	POST: 'bg-chart-2/10 text-chart-2',
	PUT: 'bg-chart-1/10 text-chart-1',
	DELETE: 'bg-chart-5/10 text-chart-5',
	PATCH: 'bg-chart-4/10 text-chart-4',
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
		{ id: 'basic', label: 'basic info', Icon: Icons.globe },
		{ id: 'data', label: 'data binding', Icon: Icons.database },
		{ id: 'mutation', label: 'mutation settings', Icon: Icons.edit },
		{ id: 'security', label: 'security', Icon: Icons.lock },
		{ id: 'response', label: 'response', Icon: Icons.upload },
		{ id: 'test', label: 'quick test', Icon: Icons.flask },
	] as const;

	const isWriteOp = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(form.method || 'GET');

	if (loading) return null;

	return (
		<div className="space-y-4 sm:space-y-6 pb-24 animate-page-enter">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
				<div>
					<TextHeading size="h3" weight="semibold" className="text-2xl sm:text-3xl lowercase">
                        {endpointId ? L.buttons.edit : L.buttons.newEndpoint}
                    </TextHeading>
					<p className="text-base text-muted-foreground lowercase leading-relaxed">{L.subtitle}</p>
				</div>
				<div className="flex flex-row items-center gap-3">
					<Button variant="outline" onClick={() => onBack?.()} className="rounded-xl lowercase font-medium">
                        {L.buttons.cancel}
                    </Button>
					<Button onClick={handleSave} disabled={saving} className="rounded-xl lowercase font-medium">
                        {saving ? "saving..." : L.buttons.save}
                    </Button>
				</div>
			</div>

			{/* Method + Path Preview */}
			<Card className="bg-muted/30 overflow-hidden">
				<CardContent className="py-4 px-5 sm:px-6">
					<div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-center">
						<div className="flex flex-row items-center gap-4 flex-1 min-w-0 w-full">
							<Badge className={cn(
								'rounded-full w-16 h-8 text-xs font-bold lowercase shrink-0 flex items-center justify-center border-none shadow-none',
								METHOD_STYLES[form.method || 'GET'] || METHOD_STYLES.GET
							)}>
								{(form.method || 'GET').toLowerCase()}
							</Badge>
							<div className="text-foreground text-base flex-1 min-w-0 truncate font-medium bg-background px-6 py-2.5 rounded-full ring-1 ring-foreground/5">
								{form.path || '/your-endpoint'}
							</div>
						</div>

						<div className="flex flex-row items-center gap-6 w-full sm:w-auto sm:pl-6 sm:border-l border-foreground/10 pt-3 sm:pt-0">
							{/* Access Level */}
							{(form.minRoleLevel ?? 0) === 0 ? (
								<div className="flex items-center gap-2 text-sm font-semibold text-chart-2 lowercase bg-chart-2/10 px-4 py-2 rounded-full">
									<Icons.globe className="size-4" /> {L.misc?.bypass || 'bypass'}
								</div>
							) : (form.minRoleLevel ?? 0) < 90 ? (
								<div className="flex items-center gap-2 text-sm font-semibold text-chart-1 lowercase bg-chart-1/10 px-4 py-2 rounded-full">
									<Icons.lock className="size-4" /> {L.misc?.loginRequired || 'login'}
								</div>
							) : (
								<div className="flex items-center gap-2 text-sm font-semibold text-chart-3 lowercase bg-chart-3/10 px-4 py-2 rounded-full">
									<Icons.crown className="size-4" /> {L.misc?.adminOnly || 'admin'}
								</div>
							)}

							<div className="flex items-center gap-3">
								<Switch
									checked={form.isActive || false}
									onCheckedChange={checked => setForm({ ...form, isActive: checked })}
								/>
								<span className={cn(
									'text-sm font-semibold lowercase hidden sm:inline',
									form.isActive ? 'text-chart-2' : 'text-muted-foreground'
								)}>
									{form.isActive ? L.labels.active : L.labels.inactive}
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tabs Navigation */}
			<Card className="overflow-hidden bg-card">
				<div className="flex border-b border-foreground/5 overflow-x-auto scrollbar-none bg-transparent px-2 sm:px-4">
					{TABS.map(tab => {
						const TabIcon = tab.Icon;
						if (tab.id === 'mutation' && !isWriteOp) return null;
						const isActive = activeTab === tab.id;
						
						return (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id as typeof activeTab)}
								className={cn(
									'flex-shrink-0 transition-all whitespace-nowrap flex items-center justify-center lowercase border-b-2 bg-transparent',
									isActive
										? 'px-4 sm:px-6 py-4 sm:py-5 text-sm sm:text-base font-medium text-primary border-primary gap-2 sm:gap-3'
										: 'px-3 sm:px-6 py-4 sm:py-5 text-sm sm:text-base font-normal text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/20 gap-0 sm:gap-3'
								)}
							>
								<TabIcon className={cn("size-4.5 sm:size-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground/60")} />
								<span className={isActive ? 'inline' : 'hidden sm:inline'}>{tab.label}</span>
							</button>
						);
					})}
				</div>

				<CardContent className="p-5 md:p-10">
					{activeTab === 'basic' && (
						<div className="space-y-6 animate-page-enter">
							<div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
								<div className="col-span-1">
                                    <Label className="text-sm font-normal text-muted-foreground lowercase mb-2 block px-1">method</Label>
									<Select
										value={form.method}
										onChange={e => setForm({ ...form, method: e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' })}
                                        className="rounded-xl bg-muted border-none w-full"
                                        size="lg"
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
                                    <Label className="text-sm font-normal text-muted-foreground lowercase mb-2 block px-1">endpoint path</Label>
									<Input
										placeholder="/api/v1/resource"
										value={form.path || ''}
										onChange={e => {
											const newPath = e.target.value;
											setForm({ ...form, path: newPath });
											setPathError(validatePath(newPath));
											setDuplicateWarning(null);
										}}
										className={cn("h-11 rounded-xl bg-muted border-none", (pathError || duplicateWarning) && 'ring-2 ring-destructive/20')}
									/>
									{pathError && <p className="text-xs text-destructive mt-1.5 lowercase px-1">{pathError}</p>}
									{duplicateWarning && <p className="text-xs text-chart-3 mt-1.5 lowercase px-1">{duplicateWarning}</p>}
								</div>
							</div>

							<div>
								<Label className="text-sm font-normal text-muted-foreground lowercase mb-2 block px-1">description</Label>
								<textarea
									className="w-full px-4 py-3 rounded-xl border-none bg-muted focus:ring-2 focus:ring-primary/10 transition-all text-sm min-h-[120px] placeholder:text-muted-foreground"
									value={form.description || ''}
									onChange={e => setForm({ ...form, description: e.target.value })}
									placeholder={L.placeholders.endpointDescription.toLowerCase()}
									rows={3}
								/>
							</div>

                            <div className="max-w-md">
                                <Label className="text-sm font-normal text-muted-foreground lowercase mb-2 block px-1">category group</Label>
                                <Select
                                    value={String(form.categoryId || '')}
                                    onChange={e => setForm({ ...form, categoryId: e.target.value || undefined })}
                                    className="rounded-xl bg-muted border-none w-full"
                                    size="lg"
                                    options={[
                                        { label: 'uncategorized', value: '' },
                                        ...categories.map(c => ({ label: c.name.toLowerCase(), value: String(c.id) }))
                                    ]}
                                />
                            </div>
						</div>
					)}

					{activeTab === 'data' && (
						<div className="space-y-6 animate-page-enter">
							<div className="bg-chart-1/5 rounded-2xl py-4 px-5 flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-chart-1/8 flex items-center justify-center shrink-0">
								    <Icons.database className="size-5 text-chart-1" />
                                </div>
								<p className="text-chart-1 text-sm font-medium leading-relaxed lowercase">
									{L.misc?.bindToDataSource || "connect this endpoint to a dynamic database for automated data processing and rpc capabilities."}
								</p>
							</div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <Label className="text-sm font-normal text-muted-foreground lowercase mb-2 block px-1">database source</Label>
                                    <Select
                                        value={String(form.dataSourceId || '')}
                                        onChange={(e) => setForm({ ...form, dataSourceId: e.target.value || undefined, resourceId: undefined })}
                                        className="rounded-xl bg-muted border-none w-full"
                                        size="lg"
                                        options={[
                                            { label: 'no binding (manual response)', value: '' },
                                            ...dataSources.map(ds => ({ label: ds.name.toLowerCase(), value: String(ds.id) }))
                                        ]}
                                    />
                                </div>

                                {form.dataSourceId && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Label className="text-sm font-normal text-muted-foreground lowercase mb-2 block px-1">resource logic</Label>
                                        <Select
                                            value={String(form.resourceId || '')}
                                            onChange={e => setForm({ ...form, resourceId: e.target.value || undefined })}
                                            className="rounded-xl bg-muted border-none w-full"
                                            size="lg"
                                            options={[
                                                { label: 'raw table data', value: '' },
                                                ...resources.map(res => ({ label: `${res.name.toLowerCase()}`, value: String(res.id) }))
                                            ]}
                                        />
                                        {resources.length === 0 && (
                                            <p className="text-xs text-chart-3 mt-2 lowercase italic px-1">{L.misc?.noSpecificResources || "no custom logic resources found for this data source."}</p>
                                        )}
                                    </div>
                                )}
                            </div>

							{form.dataSourceId && (
								<Card className="bg-muted">
									<CardContent className="p-6">
										<TextHeading size="h6" weight="semibold" className="text-sm lowercase mb-2">data lineage preview</TextHeading>
										<p className="text-xs text-muted-foreground lowercase">{L.misc?.dataPreviewHint || "this endpoint will automatically stream data from the selected source using the platform's lineage engine."}</p>
									</CardContent>
								</Card>
							)}
						</div>
					)}

					{activeTab === 'mutation' && isWriteOp && (
						<div className="space-y-6 animate-page-enter">
							<div className="bg-chart-2/5 rounded-2xl px-5 py-4 flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-chart-2/8 flex items-center justify-center shrink-0">
								    <Icons.edit className="size-5 text-chart-2" />
                                </div>
								<p className="text-chart-2 text-sm font-medium leading-relaxed lowercase">
									{L.mutation?.title || "configure how this endpoint modifies your database. set operation types, ownership rules, and field permissions."}
								</p>
							</div>

                            <div className="max-w-md">
                                <Label className="text-sm font-normal text-muted-foreground lowercase mb-2 block px-1">operation type</Label>
                                <Select
                                    value={form.operationType || 'create'}
                                    onChange={e => setForm({ ...form, operationType: e.target.value as 'create' | 'update' | 'delete' })}
                                    className="rounded-xl bg-muted border-none w-full"
                                    size="lg"
                                    options={[
                                        { label: 'create (insert new record)', value: 'create' },
                                        { label: 'update (modify existing record)', value: 'update' },
                                        { label: 'delete (remove record)', value: 'delete' },
                                    ]}
                                />
                            </div>

							<div className="pt-6 space-y-4">
								<TextHeading size="h6" weight="semibold" className="text-sm lowercase">ownership security</TextHeading>
								<div className="flex flex-row items-center gap-6 p-4 rounded-xl bg-muted border-none">
									<Switch
										checked={form.allowOwnerOnly !== false}
										onCheckedChange={checked => setForm({ ...form, allowOwnerOnly: checked })}
									/>
									<div>
										<p className="text-sm font-semibold lowercase">{L.mutation?.restrictToOwner || "restrict to record owner"}</p>
										<p className="text-xs text-muted-foreground lowercase">{L.mutation?.restrictToOwnerHint || "only users who created the record can modify or delete it."}</p>
									</div>
								</div>

								{form.allowOwnerOnly !== false && (
									<div className="max-w-md animate-in slide-in-from-top-2 duration-300">
                                        <Label className="text-sm font-normal text-muted-foreground lowercase mb-2 block px-1">owner reference column</Label>
										<Input
											placeholder="e.g. user_id"
											value={form.ownershipColumn || ''}
											onChange={e => setForm({ ...form, ownershipColumn: e.target.value })}
                                            className="rounded-xl h-11 bg-muted border-none"
										/>
									</div>
								)}
							</div>

							<div className="pt-6">
								<TextHeading size="h6" weight="semibold" className="text-sm lowercase mb-2">{L.mutation?.columnSelector || 'field configuration'}</TextHeading>
								<p className="text-sm text-muted-foreground lowercase mb-6">{L.mutation?.columnSelectorHint || "select which database fields are writable, protected, or auto-populated by the system."}</p>

								{!form.dataSourceId ? (
									<div className="text-center py-12 rounded-2xl bg-muted">
										<Icons.database className="size-8 text-muted-foreground/20 mx-auto mb-4" />
										<p className="text-sm text-muted-foreground lowercase">{L.mutation?.selectDataSourceFirst || "select a data source to configure fields."}</p>
									</div>
								) : columns.length === 0 ? (
									<div className="text-center py-12 rounded-2xl bg-muted">
										<Icons.database className="size-8 text-muted-foreground/20 mx-auto mb-4 animate-pulse" />
										<p className="text-sm text-muted-foreground lowercase">{L.labels.loading || "fetching schema..."}</p>
									</div>
								) : (
									<div className="space-y-6">
										{/* Legend */}
										<div className="flex flex-wrap gap-4 px-1">
											{[
												{ color: 'bg-chart-2', label: 'writable' },
												{ color: 'bg-chart-5', label: 'protected' },
												{ color: 'bg-chart-1', label: 'auto' },
                                                { color: 'bg-muted-foreground', label: 'none' },
											].map(l => (
                                                <div key={l.label} className="flex items-center gap-2">
                                                    <div className={cn("size-2.5 rounded-full", l.color)} />
                                                    <span className="text-xs font-medium text-muted-foreground lowercase">{l.label}</span>
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

												let chipClass = 'bg-muted text-muted-foreground border-none';
												if (isProtected) chipClass = 'bg-chart-5/10 text-chart-5 border-none';
												else if (isAutoPopulate) chipClass = 'bg-chart-1/10 text-chart-1 border-none';
												else if (isWritable) chipClass = 'bg-chart-2/10 text-chart-2 border-none';

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
                                                            "px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                                                            chipClass
                                                        )}
													>
														{col.isPrimary && <Icons.key className="size-3.5 shrink-0" />}
														{col.name}
														<span className="opacity-40 text-xs">({col.type})</span>
													</button>
												);
											})}
										</div>

										{/* Auto-Populate */}
										<div className="pt-6 space-y-4">
											<Label className="text-sm font-normal text-muted-foreground block px-1 lowercase">auto-populate variables</Label>
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
														<div key={col.name} className="flex flex-row items-center gap-3 p-3 rounded-xl bg-muted border-none">
															<span className={cn(
																'shrink-0 w-28 px-3 py-1.5 rounded-lg text-sm font-medium truncate lowercase',
																currentValue ? 'bg-chart-1/10 text-chart-1' :
																	hasRelation ? 'bg-chart-4/10 text-chart-4' :
																		'bg-background text-muted-foreground'
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
												<div className="pt-8 space-y-6">
													<TextHeading size="h6" weight="semibold" className="text-sm lowercase">validation rules & constraints</TextHeading>
													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														{writableList.map(colName => {
															const colInfo = columns.find(c => c.name === colName);
															return (
																<div key={colName} className="flex flex-row items-center gap-3 p-3 rounded-xl bg-muted border-none">
																	<span className="shrink-0 w-32 px-3 py-1.5 bg-chart-2/10 text-chart-2 rounded-lg text-xs font-medium truncate lowercase">
																		{colName}
																	</span>
																	<Input
																		className="flex-1 h-9 rounded-lg bg-background border-none text-xs"
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
						<div className="space-y-6 animate-page-enter">
							<div className="bg-chart-4/5 rounded-2xl px-5 py-4 flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-chart-4/8 flex items-center justify-center shrink-0">
								    <Icons.lock className="size-5 text-chart-4" />
                                </div>
								<p className="text-chart-4 text-sm font-medium leading-relaxed lowercase">
									{L.misc?.accessLevelHint || "define who can access this endpoint. you can set global access levels or restrict to specific roles and permissions."}
								</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <Label className="text-sm font-normal text-muted-foreground lowercase px-1">base access level</Label>
                                    <Select
                                        className="rounded-xl bg-muted border-none w-full"
                                        size="lg"
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
                                        "p-6 rounded-2xl border-none transition-colors",
                                        (form.minRoleLevel ?? 0) === 0 ? 'bg-chart-2/10' :
                                        (form.minRoleLevel ?? 0) < 90 ? 'bg-chart-1/10' :
                                        'bg-chart-3/10'
                                    )}>
                                        <div className="flex flex-row items-center gap-4">
                                            <div className="size-10 rounded-xl bg-background flex items-center justify-center shadow-none">
                                                {(form.minRoleLevel ?? 0) === 0 ? <Icons.globe className="size-5 text-chart-2" /> : 
                                                 (form.minRoleLevel ?? 0) < 90 ? <Icons.lock className="size-5 text-chart-1" /> : 
                                                 <Icons.crown className="size-5 text-chart-3" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm lowercase leading-tight">
                                                    {(form.minRoleLevel ?? 0) === 0 ? "public endpoint" : 
                                                     (form.minRoleLevel ?? 0) < 90 ? "protected access" : 
                                                     "internal admin restricted"}
                                                </p>
                                                <p className="text-sm text-muted-foreground lowercase mt-1">
                                                    {L.misc?.accessLevel || "this setting applies platform-wide security protocols to the path lineage."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <Label className="text-sm font-normal text-muted-foreground lowercase px-1">granular role restrictions</Label>
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

							<div className="pt-6 space-y-6">
								<div className="flex items-center gap-3">
									<Icons.warning className="size-5 text-chart-3" />
                                    <TextHeading size="h6" weight="semibold" className="text-sm lowercase">error response overrides</TextHeading>
								</div>
								
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{[401, 403, 404, 500].map(code => {
										const info = getErrorDisplayInfo(code);
										return (
											<div key={code} className="p-4 rounded-xl bg-muted space-y-3">
												<div className="flex flex-row items-center justify-between">
													<div className="flex items-center gap-3">
                                                        <span className={cn(
                                                            "w-12 h-7 flex items-center justify-center rounded-lg text-sm font-semibold",
                                                            code < 500 ? 'bg-chart-3/10 text-chart-3' : 'bg-chart-5/10 text-chart-5'
                                                        )}>
                                                            {code}
                                                        </span>
                                                        <Badge variant="secondary" className="rounded-lg text-sm font-medium lowercase px-2 py-0.5 border-none">
                                                            {info.isCustom ? 'custom' : 'auto'}
                                                        </Badge>
                                                    </div>
													{info.isCustom && (
														<button
															type="button"
															onClick={() => setErrorTemplate(code, '')}
															className="text-sm font-normal text-chart-5 hover:underline lowercase"
														>
															reset
														</button>
													)}
												</div>
                                                <div className="bg-background p-2 rounded-lg">
                                                    <div className="text-sm text-muted-foreground lowercase">code: {info.errorCode}</div>
                                                </div>
												<input
													type="text"
													placeholder={info.template}
													value={getErrorTemplate(code)}
													onChange={e => setErrorTemplate(code, e.target.value)}
													className="w-full h-11 px-4 text-sm bg-background border-none rounded-xl focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground"
												/>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					)}

					{activeTab === 'response' && (
						<div className="flex flex-col lg:flex-row gap-8 animate-page-enter h-[600px]">
							<div className="flex-1 space-y-6 h-full overflow-y-auto pr-2 scrollbar-none">
								<div className="bg-chart-4/5 rounded-2xl px-5 py-4 flex items-center gap-4">
                                    <div className="size-10 rounded-xl bg-chart-4/8 flex items-center justify-center shrink-0">
                                        <Icons.upload className="size-5 text-chart-4" />
                                    </div>
                                    <p className="text-chart-4 text-sm font-medium leading-relaxed lowercase">
                                        {L.misc.responseTemplate || "response template"}
                                    </p>
                                </div>

								<div className="space-y-4">
									<Label className="text-sm font-normal text-muted-foreground px-1 lowercase">response data structure (json mapper)</Label>
									<textarea
										className="w-full px-5 py-4 rounded-2xl border-none text-base bg-muted text-foreground focus:ring-2 focus:ring-primary/10 min-h-[400px] scrollbar-none transition-all whitespace-pre"
										value={form.responseData || ''}
										onChange={e => setForm({ ...form, responseData: e.target.value })}
										placeholder={L.placeholders.jsonData.toLowerCase()}
										id="responseDataEditor"
									/>
								</div>
							</div>

							{/* Data Lineage Helper Sidebar */}
							<div className="w-full lg:w-80 border-l border-foreground/5 pl-0 lg:pl-10 h-full overflow-y-auto pr-2 scrollbar-none">
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
                                <div className="mt-8 p-6 rounded-2xl bg-muted">
                                    <p className="text-sm font-semibold text-muted-foreground lowercase mb-3">schema preview</p>
                                    <div className="text-sm text-muted-foreground truncate">
                                        {(form.responseData || '{"status": "success"}').substring(0, 50)}...
                                    </div>
                                </div>
							</div>
						</div>
					)}

					{activeTab === 'test' && (
						<div className="space-y-10 animate-page-enter py-10">
							<div className="text-center max-w-lg mx-auto">
                                <div className="size-20 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-none">
                                    <Icons.flask className="size-10 text-primary" />
                                </div>
                                <TextHeading size="h4" className="mb-4 lowercase">launch in api tester</TextHeading>
								<p className="text-sm text-muted-foreground lowercase mb-10 leading-relaxed">
                                    validate your endpoint logic in real-time. the platform will automatically inject necessary headers and parameters based on your configuration.
                                </p>
								<Button
									onClick={() => onBack?.()}
									className="rounded-xl h-12 px-10 gap-3 text-sm lowercase font-medium"
								>
									<Icons.zap className="size-5" /> open interactive tester
								</Button>
							</div>

							{endpointId && (
								<div className="max-w-md mx-auto pt-10">
									<div className="p-6 rounded-2xl bg-chart-5/5 text-center">
                                        <p className="text-chart-5 text-xs font-semibold lowercase mb-3">danger zone</p>
                                        <p className="text-xs text-muted-foreground lowercase mb-6">permanently delete this endpoint from the global lineage. this action cannot be undone.</p>
                                        <Button variant="destructive" className="w-full h-11 rounded-xl gap-2 text-xs lowercase" onClick={handleDelete}>
                                            <Icons.trash className="size-4" /> destroy endpoint
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
