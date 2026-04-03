'use client';

import { Button, Input, Select, Switch, Card, CardContent, Heading, Text, Stack, Badge } from '@/components/ui';
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

		handleDataSourceChange,
		handleSave,
		handleDelete,
		router
	} = useEndpointEditor(targetId, endpointId, onBack);

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
			.replace(/^\//, '') // remove leading /
			.replace(/:[^/]+/g, '') // remove path params like :id
			.replace(/\//g, '_') // replace / with _
			.replace(/_+/g, '_') // collapse multiple underscores
			.replace(/_+$/, '') // remove trailing _
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
		<div className="space-y-8 pb-20">
			{/* Header & Preview */}
			<Stack direction="row" justify="between" align="center" className="flex-col sm:flex-row gap-4">
				<div>
					<Heading level={2} className="text-2xl sm:text-3xl">{endpointId ? L.buttons.edit : L.buttons.newEndpoint}</Heading>
					<Text variant="muted" className="text-sm">{L.subtitle}</Text>
				</div>
				<Stack direction="row" gap={2}>
					<Button variant="ghost" size="default" onClick={() => onBack?.()} className="text-xs">{L.buttons.cancel}</Button>
					<Button size="default" onClick={handleSave} isLoading={saving} className="text-xs">{L.buttons.save}</Button>
				</Stack>
			</Stack>

			{/* Method + Path Preview Bar */}
			<Card >
				<CardContent>
					<Stack direction="row" align="center" className="flex-col sm:flex-row gap-3 sm:gap-4 items-center">
						<Stack direction="row" align="center" gap={3} className="flex-1 min-w-0">
							<span className={cn(
								'px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-semibold shrink-0',
								METHOD_STYLES[form.method || 'GET'] || METHOD_STYLES.GET
							)}>
								{form.method || 'GET'}
							</span>
							<code className="text-foreground font-mono text-xs sm:text-sm flex-1 min-w-0 truncate font-semibold bg-muted px-4 py-2 rounded-full border border-border">
								{form.path || '/your-endpoint'}
							</code>
						</Stack>

						<Stack direction="row" align="center" justify="between" className="sm:justify-end gap-3 w-full sm:w-auto sm:ml-auto sm:pl-4 sm:border-l sm:border-t-0 border-t border-border pt-3 sm:pt-0">
							{/* Access Level Badge */}
							{(form.minRoleLevel ?? 0) === 0 ? (
								<span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-md text-[10px] font-semibold uppercase shrink-0 flex items-center gap-1">
									<Icons.globe className="w-3 h-3" /> {L.misc?.bypass || 'PUBLIC'}
								</span>
							) : (form.minRoleLevel ?? 0) < 90 ? (
								<span className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded-md text-[10px] font-semibold uppercase shrink-0 flex items-center gap-1">
									<Icons.lock className="w-3 h-3" /> {L.misc?.loginRequired || 'LOGIN'}
								</span>
							) : (
								<span className="px-2 py-1 bg-amber-500/10 text-amber-600 rounded-md text-[10px] font-semibold uppercase shrink-0 flex items-center gap-1">
									<Icons.crown className="w-3 h-3" /> {L.misc?.adminOnly || 'ADMIN'}
								</span>
							)}

							<Stack direction="row" align="center" gap={2} className="pr-1">
								<Switch
									checked={form.isActive || false}
									onCheckedChange={checked => setForm({ ...form, isActive: checked })}
								/>
								<span className={cn(
									'text-[10px] font-semibold uppercase',
									form.isActive ? 'text-emerald-600' : 'text-muted-foreground'
								)}>
									{form.isActive ? L.labels.active : L.labels.inactive}
								</span>
							</Stack>
						</Stack>
					</Stack>
				</CardContent>
			</Card>

			{/* Tabs Navigation */}
			<Card>
				<div className="flex border-b border-border overflow-x-auto scrollbar-slim">
					{TABS.map(tab => {
						const TabIcon = tab.Icon;
						if (tab.id === 'mutation' && !isWriteOp) return null; // Hide Mutation tab for GET
						return (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id as typeof activeTab)}
								className={cn(
									'flex-shrink-0 sm:flex-1 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5',
									activeTab === tab.id
										? 'text-primary border-b-2 border-primary bg-primary/5'
										: 'text-muted-foreground hover:text-foreground bg-muted/50'
								)}
							>
								<TabIcon className="w-4 h-4" />
								<span className={activeTab === tab.id ? 'inline' : 'hidden sm:inline'}>{tab.label}</span>
							</button>
						);
					})}
				</div>

				<CardContent>
					{/* Tab: Basic Info */}
					{activeTab === 'basic' && (
						<div className="space-y-8 animate-in fade-in duration-300">
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
									{pathError && <Text className="text-xs text-red-500 mt-1">{pathError}</Text>}
									{duplicateWarning && <Text className="text-xs text-amber-500 mt-1">{duplicateWarning}</Text>}
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-foreground mb-1">{L.labels.description}</label>
								<textarea
									className="w-full px-4 py-2 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
									value={form.description || ''}
									onChange={e => setForm({ ...form, description: e.target.value })}
									placeholder={L.placeholders.endpointDescription}
									rows={3}
								/>
							</div>

							<Select
								label={L.labels.categories}
								value={String(form.categoryId || '')}
								onChange={e => setForm({ ...form, categoryId: e.target.value || undefined })}
								options={[
									{ label: 'Uncategorized', value: '' }, // Literal fallback. Strict rules might flag.
									...categories.map(c => ({ label: c.name, value: String(c.id) }))
								]}
							/>
						</div>
					)}

					{/* Tab: Data Binding */}
					{activeTab === 'data' && (
						<div className="space-y-8 animate-in fade-in duration-300">
							<div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
								<Text className="text-amber-700 text-sm font-medium flex items-center gap-2">
									<Icons.database className="w-4 h-4" />
									{L.misc?.bindToDataSource}
								</Text>
							</div>

							<Select
								label={L.misc?.bindToDataSource}
								value={String(form.dataSourceId || '')}
								onChange={(e) => setForm({ ...form, dataSourceId: e.target.value || undefined, resourceId: undefined })}
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
										onChange={e => setForm({ ...form, resourceId: e.target.value || undefined })}
										options={[
											{ label: L.misc?.rawTableData || 'Raw', value: '' },
											...resources.map(res => ({ label: `${res.name} ${res.description ? `- ${res.description}` : ''}`, value: String(res.id) }))
										]}
									/>
									{resources.length === 0 && (
										<Text className="text-xs text-amber-500 mt-2">{L.misc?.noSpecificResources}</Text>
									)}
								</div>
							)}

							{form.dataSourceId && (
								<Card >
									<CardContent>
										<Heading level={4} className="font-semibold text-sm mb-2">{L.misc?.dataPreview}</Heading>
										<Text variant="muted" className="text-xs">{L.misc?.dataPreviewHint}</Text>
									</CardContent>
								</Card>
							)}
						</div>
					)}

					{/* Tab: Mutation (New) */}
					{activeTab === 'mutation' && isWriteOp && (
						<div className="space-y-8 animate-in fade-in duration-300">
							<div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
								<Text className="text-purple-700 text-sm font-medium flex items-center gap-2">
									<Icons.edit className="w-4 h-4" />
									{L.mutation?.title}
								</Text>
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

							<div className="border-t border-border pt-4">
								<Heading level={4} className="font-semibold text-sm mb-3">{L.mutation?.ownershipSecurity}</Heading>
								<Stack direction="row" align="center" gap={4} className="mb-4">
									<Switch
										checked={form.allowOwnerOnly !== false} // Default true
										onCheckedChange={checked => setForm({ ...form, allowOwnerOnly: checked })}
									/>
									<div>
										<Text className="text-sm font-semibold">{L.mutation?.restrictToOwner}</Text>
										<Text variant="muted" className="text-xs">{L.mutation?.restrictToOwnerHint}</Text>
									</div>
								</Stack>

								{form.allowOwnerOnly !== false && (
									<div>
										<Input
											label={L.mutation?.ownershipColumn}
											placeholder="e.g. user_id"
											value={form.ownershipColumn || ''}
											onChange={e => setForm({ ...form, ownershipColumn: e.target.value })}
										/>
										<Text variant="muted" className="text-xs mt-1">{L.mutation?.ownershipColumnHint}</Text>
									</div>
								)}
							</div>

							<div className="border-t border-border pt-4">
								<Heading level={4} className="font-semibold text-sm mb-2">{L.mutation?.columnSelector || 'Column Configuration'}</Heading>
								<Text variant="muted" className="text-xs mb-3">{L.mutation?.columnSelectorHint}</Text>

								{!form.dataSourceId ? (
									<Card >
										<CardContent className="text-center py-6">
											<Icons.database className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
											<Text variant="muted" className="text-sm">{L.mutation?.selectDataSourceFirst}</Text>
										</CardContent>
									</Card>
								) : columns.length === 0 ? (
									<Card >
										<CardContent className="text-center py-6">
											<Icons.database className="w-8 h-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
											<Text variant="muted" className="text-sm">{L.labels.loading}</Text>
										</CardContent>
									</Card>
								) : (
									<>
										{/* Legend */}
										<Stack direction="row" wrap gap={3} className="mb-4 text-xs">
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
										</Stack>

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
												let chipClass = 'bg-muted text-muted-foreground border-border';
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
											<label className="block text-sm font-medium text-foreground mb-2">{L.mutation?.autoPopulate}</label>
											<Text variant="muted" className="text-xs mb-3">{L.mutation?.autoPopulateHint}</Text>

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
														<Stack key={col.name} direction="row" align="center" gap={2}>
															<span className={cn(
																'shrink-0 w-28 px-2 py-1.5 rounded text-xs font-medium truncate',
																currentValue ? 'bg-blue-100 text-blue-700 border border-blue-200' :
																	hasRelation ? 'bg-purple-100 text-purple-700 border border-purple-200' :
																		'bg-muted text-muted-foreground border border-border'
															)} title={col.relationTarget ? `→ ${col.relationTarget}` : col.name}>
																{hasRelation && <Icons.link2 className="w-3 h-3 inline mr-1" />}
																{col.name}
															</span>
															<Select
																fullWidth={false}
																className={`flex-1 ${isUserRelation && !currentValue ? 'border-purple-300 bg-purple-50' : 'border-border'}`}
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
																<span className="shrink-0 px-2 py-1 bg-blue-500/10 text-blue-600 rounded text-xs font-mono">
																	{currentValue}
																</span>
															)}
															{hasRelation && !currentValue && (
																<span className="shrink-0 px-2 py-1 bg-purple-500/10 text-purple-600 rounded text-xs">
																	{L.mutation?.relationArrow}{col.relationTarget}
																</span>
															)}
														</Stack>
													);
												})}
											</div>
										</div>

										{/* Validation Section - Auto-generated from Writable columns */}
										{(() => {
											const writableList: string[] = form.writableFields ? JSON.parse(form.writableFields as string || '[]') : [];
											if (writableList.length === 0) return null;

											return (
												<div className="border-t border-border pt-4 mt-4">
													<Heading level={4} className="font-semibold text-sm mb-2">{L.mutation?.validationRules}</Heading>
													<Text variant="muted" className="text-xs mb-3">{L.mutation?.validationHint}</Text>
													<Text variant="muted" className="text-xs mb-4 font-mono">{L.mutation?.validationSyntax}</Text>

													<div className="space-y-3">
														{writableList.map(colName => {
															// Parse validation JSON
															const colInfo = columns.find(c => c.name === colName);

															return (
																<Stack key={colName} direction="row" align="start" gap={2}>
																	<span className="shrink-0 w-32 px-2 py-1.5 bg-green-100 text-green-700 rounded text-xs font-medium truncate" title={colName}>
																		{colName}
																	</span>
																	<Input
																		className="flex-1 text-xs font-mono"
																		placeholder={colInfo?.nullable === false ? 'required' : 'e.g. minLength:3, maxLength:100'}
																		value={getValidationRule(colName)}
																		onChange={e => setValidationRule(colName, e.target.value)}
																	/>
																</Stack>
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
						<div className="space-y-8 animate-in fade-in duration-300">
							{/* ... existing security content ... */}
							<div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
								<Text className="text-indigo-700 text-sm font-medium flex items-center gap-2">
									<Icons.lock className="w-4 h-4" />
									{L.misc?.accessLevelHint}
								</Text>
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
								? 'bg-green-500/10 border-green-500/20'
								: (form.minRoleLevel ?? 0) < 90
									? 'bg-blue-500/10 border-blue-500/20'
									: 'bg-amber-500/10 border-amber-500/20'
								}`}>
								<Stack direction="row" align="center" gap={3}>
									<span className="text-2xl">
										{(form.minRoleLevel ?? 0) === 0 ? <Icons.globe className="w-6 h-6" /> : (form.minRoleLevel ?? 0) < 90 ? <Icons.lock className="w-6 h-6" /> : <Icons.crown className="w-6 h-6" />}
									</span>
									<div>
										<Text className="font-semibold">
											{(form.minRoleLevel ?? 0) === 0
												? L.misc?.publicEndpoint
												: (form.minRoleLevel ?? 0) < 90
													? L.misc?.loginRequired
													: L.misc?.adminOnly}
										</Text>
										<Text variant="muted" className="text-xs">
											{(form.minRoleLevel ?? 0) === 0
												? L.misc?.publicEndpointHint
												: (form.minRoleLevel ?? 0) < 90
													? L.misc?.loginRequiredHint
													: L.misc?.adminOnlyHint}
										</Text>
									</div>
								</Stack>
							</div>

							{(form.minRoleLevel ?? 0) > 0 && (
								<>
									<div className="border-t border-border pt-4">
										<Heading level={4} className="font-semibold text-sm mb-3">{L.misc?.additionalRestrictions}</Heading>
									</div>

									<MultiSelect
										label={L.labels.roles}
										placeholder={L.placeholders.rolesCommaSep}
										options={availableRoles.map(r => r.name)}
										value={form.roles || ''}
										onChange={val => setForm({ ...form, roles: val })}
									/>
									<Stack direction="row" wrap gap={2} className="-mt-4">
										{availableRoles.filter(r => (form.roles || '').includes(r.name)).map(role => (
											<div key={role.name} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-lg">
												<span className="font-semibold">{role.name}</span>
												{role.isSuper && <span className="px-1 py-0.5 bg-red-100 text-red-600 rounded text-[8px]">{L.misc?.bypass}</span>}
												<span className="text-muted-foreground">{L.labels.levelShort}{role.level}</span>
											</div>
										))}
									</Stack>

									<MultiSelect
										label={L.labels.permissions}
										placeholder={L.placeholders.permissionsCommaSep}
										options={availablePermissions}
										value={form.permissions || ''}
										onChange={val => setForm({ ...form, permissions: val })}
									/>
								</>
							)}

							<div className="border-t border-border pt-4">
								<Heading level={4} className="font-semibold text-sm mb-3 flex items-center gap-2">
									<Icons.warning className="w-4 h-4 text-amber-500" /> {L.misc?.errorResponseOverride}
								</Heading>
								<Text variant="muted" className="text-xs mb-2">{L.misc?.errorResponseHint}</Text>
								{form.path && (
									<Text className="text-xs text-blue-500 mb-3 flex items-center gap-1">
										<Icons.zap className="w-3 h-3" />
										{L.misc?.autoGenFrom} <code className="bg-blue-500/10 px-1 rounded">{form.path}</code>
									</Text>
								)}
								<div className="space-y-3">
									{[401, 403, 404, 500].map(code => {
										const info = getErrorDisplayInfo(code);
										return (
											<div key={code} className="flex flex-col gap-1">
												<Stack direction="row" align="center" gap={2}>
													<span className={`w-12 text-xs font-mono font-semibold ${code < 500 ? 'text-amber-600' : 'text-red-600'}`}>
														{code}
													</span>
													<span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${info.isCustom
														? 'bg-purple-100 text-purple-700'
														: 'bg-blue-100 text-blue-700'
														}`}>
														{info.isCustom ? 'CUSTOM' : 'AUTO'}
													</span>
													<code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
														{info.errorCode}
													</code>
													{info.isCustom && (
														<button
															type="button"
															onClick={() => setErrorTemplate(code, '')}
															className="text-xs text-red-500 hover:underline ml-auto"
														>
															{L.misc?.resetToAuto}
														</button>
													)}
												</Stack>
												<input
													type="text"
													placeholder={info.template}
													value={getErrorTemplate(code)}
													onChange={e => setErrorTemplate(code, e.target.value)}
													className="flex-1 px-3 py-2 text-xs border border-border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
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

							<div className="flex-1 space-y-8 h-full overflow-y-auto pr-2">
								<div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
									<Text className="text-emerald-700 text-sm font-medium flex items-center gap-2">
										<Icons.upload className="w-4 h-4" />
										{L.misc?.responseTemplate}
									</Text>
								</div>

								<div>
									<label className="block text-sm font-medium text-foreground mb-2">{L.labels.responseData}</label>
									<textarea
										className="w-full px-4 py-3 rounded-xl border border-border font-mono text-sm bg-muted text-green-400 focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[300px]"
										value={form.responseData || ''}
										onChange={e => setForm({ ...form, responseData: e.target.value })}
										placeholder={L.placeholders.jsonData}
										id="responseDataEditor"
									/>
								</div>

								<Card >
									<CardContent>
										<Heading level={5} className="font-semibold text-sm mb-2">{L.misc?.preview}</Heading>
										<pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
											{(form.responseData || '{"status": "success"}')
												.replace('{{DATA}}', '[...]')
												.replace('{{COUNT}}', '10')
												.replace('{{USER_ID}}', '1')
												.replace('{{USER_ROLE}}', 'admin')
												.replace(/{{item\.(\w+)}}/g, '"$1_value"')}
										</pre>
									</CardContent>
								</Card>
							</div>

							{/* Data Lineage Helper Sidebar */}
							<div className="w-full lg:w-72 border-l border-border pl-0 lg:pl-6 h-full">
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
						<div className="space-y-8 animate-in fade-in duration-300">
							{/* ... existing test content ... */}
							<div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
								<Text className="text-purple-700 text-sm font-medium flex items-center gap-2">
									<Icons.flask className="w-4 h-4" />
									{L.misc?.clickToTest}
								</Text>
							</div>

							<div className="text-center py-8">
								<Text variant="muted" className="mb-4">{L.misc?.clickToTest}</Text>
								<Button
									onClick={() => {
										// Navigasi ke tab tester ditangani oleh parent via onBack/onNavigate
										onBack?.();
									}}
									className="gap-2"
								>
									<Icons.flask className="w-4 h-4" /> {L.misc?.openInTester}
								</Button>
							</div>

							{endpointId && (
								<div className="border-t border-border pt-6">
									<Heading level={4} className="font-semibold text-red-600 text-sm mb-3">{L.misc?.dangerZone}</Heading>
									<Button variant="destructive" className="w-full gap-2" onClick={handleDelete}>
										<Icons.trash className="w-4 h-4" /> {L.buttons.delete}
									</Button>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
