/* eslint-disable react/jsx-no-literals */
'use client';

import { useRouter } from 'next/navigation';
import { Button, Modal, Select } from '@cp/ui';
import { Icons, MODULE_LABELS } from '@cp/config/client';
import { ConfirmDialog, useToast } from '@/modules/_core';
import { env } from '@/lib/env';
import { useApiManagement } from '../composables';

// Method badge colors - using static mapping as it's purely UI presentation
const METHOD_STYLES: Record<string, { bg: string; text: string }> = {
    GET: { bg: 'bg-blue-500', text: 'text-white' },
    POST: { bg: 'bg-green-500', text: 'text-white' },
    PUT: { bg: 'bg-amber-500', text: 'text-white' },
    DELETE: { bg: 'bg-red-500', text: 'text-white' },
    PATCH: { bg: 'bg-purple-500', text: 'text-white' },
};

export const ApiManagementView = () => {
    const router = useRouter();
    const { addToast } = useToast();
    const L = MODULE_LABELS.apiManagement;

    const {
        loading,
        categories,
        endpoints,
        filteredEndpoints,
        stats,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedMethod,
        setSelectedMethod,
        isCategoryModalOpen,
        setIsCategoryModalOpen,
        editingCategory,
        setEditingCategory,
        categoryForm,
        setCategoryForm,
        deleteConfirm,
        setDeleteConfirm,
        deleteLoading,
        handleSaveCategory,
        executeDelete,
        handleToggleEndpoint,
        openDeleteConfirm
    } = useApiManagement();

    const copyToClipboard = (path: string) => {
        navigator.clipboard.writeText(`${env.BACKEND_SYSTEM_API}${path}`);
        addToast(L.messages.copiedPath, 'success');
    };

    // SOLID Loading Overlay
    // absolute inset-0 bg-white (NO opacity) -> Covers content completely (Blank)
    // z-20 -> Ensures it sits on top
    const LoadingOverlay = () => (
        <div className="absolute inset-0 bg-white z-20 flex items-center justify-center rounded-xl">
            <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin shadow-sm" />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                        <Icons.rocket className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">{L.title}</h1>
                        <p className="text-sm text-slate-500">{L.subtitle}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm gap-1" onClick={() => {
                        setEditingCategory(null);
                        setCategoryForm({ name: '', description: '' });
                        setIsCategoryModalOpen(true);
                    }}>
                        <Icons.plus className="w-4 h-4" />
                        <span className="hidden sm:inline">{L.buttons.newCategory}</span><span className="sm:hidden">{L.labels.categories}</span>
                    </Button>
                    <Button size="sm" className="text-xs sm:text-sm gap-1" onClick={() => router.push('/api-management/new')}>
                        <Icons.plus className="w-4 h-4" />
                        <span className="hidden sm:inline">{L.buttons.newEndpoint}</span><span className="sm:hidden">{L.buttons.new}</span>
                    </Button>
                </div>
            </div>

            {/* Stats Cards - Granular Loading Wrapper */}
            <div className="relative min-h-[140px]">
                {loading && <LoadingOverlay />}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {[
                        { label: L.labels.endpoints, value: stats.total, Icon: Icons.link, bg: 'bg-blue-50', text: 'text-blue-600', sub: 'Total Routes', color: 'text-blue-600' },
                        { label: L.labels.active, value: stats.active, Icon: Icons.checkCircle, bg: 'bg-emerald-50', text: 'text-emerald-600', sub: 'Online', color: 'text-emerald-600' },
                        { label: L.labels.categories, value: stats.categories, Icon: Icons.folder, bg: 'bg-purple-50', text: 'text-purple-600', sub: 'Groups', color: 'text-purple-600' },
                        { label: L.labels.method, value: stats.methods, Icon: Icons.branch, bg: 'bg-amber-50', text: 'text-amber-600', sub: 'Types', color: 'text-amber-600' },
                    ].map((stat, i) => {
                        const StatIcon = stat.Icon;
                        return (
                            <div key={i} className="bg-white rounded-xl p-5 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/50 transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                                    <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center ${stat.text}`}>
                                        <StatIcon className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-2xl font-semibold tracking-tight text-slate-900">{stat.value}</p>
                                    <p className="text-[10px] font-normal text-slate-400 mt-1">{stat.sub}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Search & Filter Bar - Granular Loading Wrapper */}
            <div className="relative min-h-[76px]">
                {loading && <LoadingOverlay />}
                <div className="bg-white rounded-xl shadow-sm shadow-slate-200/50 p-3 sm:p-4 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0 sm:min-w-[200px] relative">
                        <Icons.search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 text-xs sm:text-sm placeholder:text-slate-400"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <div className="w-40 sm:w-auto flex-1 sm:flex-none">
                            <Select
                                placeholder={L.labels.allCategories}
                                size="sm"
                                fullWidth={true}
                                value={selectedCategory || ''}
                                onChange={e => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                                options={[
                                    { label: L.labels.allCategories, value: '' },
                                    ...categories.map(c => ({ label: c.name, value: c.id }))
                                ]}
                            />
                        </div>
                        <div className="w-28 sm:w-auto flex-1 sm:flex-none">
                            <Select
                                placeholder={L.labels.method}
                                size="sm"
                                fullWidth={true}
                                value={selectedMethod || ''}
                                onChange={e => setSelectedMethod(e.target.value || null)}
                                options={[
                                    { label: L.labels.method, value: '' },
                                    ...['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => ({ label: m, value: m }))
                                ]}
                            />
                        </div>
                        {(searchQuery || selectedCategory || selectedMethod) && (
                            <Button variant="ghost" size="sm" className="text-xs h-9" onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory(null);
                                setSelectedMethod(null);
                            }}>
                                <Icons.close className="w-3.5 h-3.5" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Grid - Granular Loading Wrapper */}
            <div className="relative min-h-[400px]">
                {loading && <LoadingOverlay />}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Categories Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        <h3 className="font-semibold text-slate-800 px-1 flex items-center gap-2 text-xs uppercase tracking-wider opacity-90">
                            <Icons.folder className="w-3.5 h-3.5" /> {L.labels.categories}
                        </h3>
                        <div className="space-y-2">
                            {categories.map(cat => {
                                const count = endpoints.filter(e => e.categoryId === cat.id).length;
                                const isSelected = selectedCategory === cat.id;
                                return (
                                    <div
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                                        className={`p-3 rounded-xl transition-all cursor-pointer group border ${isSelected
                                            ? 'bg-blue-50/50 border-blue-100'
                                            : 'bg-white border-transparent hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                                                    <Icons.folder className="w-3.5 h-3.5" />
                                                </div>
                                                <div>
                                                    <h4 className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>{cat.name}</h4>
                                                    <p className="text-[10px] text-slate-400">{count} {L.labels.endpoint}{count !== 1 ? 's' : ''}</p>
                                                </div>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => {
                                                    setEditingCategory(cat);
                                                    setCategoryForm({ name: cat.name, description: cat.description || '' });
                                                    setIsCategoryModalOpen(true);
                                                }} className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-slate-400 hover:text-slate-600"><Icons.pencil className="w-3 h-3" /></button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {categories.length === 0 && (
                                <div className="text-center p-6 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                                    {L.labels.noCategories}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Endpoints List */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-xs uppercase tracking-wider opacity-90">
                                <Icons.link className="w-3.5 h-3.5" /> {L.labels.endpoints}
                            </h3>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{filteredEndpoints.length} results</span>
                        </div>

                        <div className="space-y-3">
                            {filteredEndpoints.map((ep, idx) => {
                                const methodStyle = METHOD_STYLES[ep.method] || METHOD_STYLES.GET;
                                const category = categories.find(c => c.id === ep.categoryId);

                                return (
                                    <div
                                        key={ep.id}
                                        onClick={() => router.push(`/api-management/${ep.id}`)}
                                        className="bg-white rounded-xl p-4 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-200/50 transition-all group cursor-pointer animate-in slide-in-from-left-2 duration-300 fill-mode-both"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        {/* Mobile: Stack layout / Desktop: Flex row */}
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                            {/* Method Badge & Path */}
                                            <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                                                <div className={`px-2 py-1 rounded-[6px] text-[10px] font-bold ${methodStyle.bg} ${methodStyle.text} shrink-0 w-14 text-center tracking-wide`}>
                                                    {ep.method}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <code className="text-xs sm:text-sm font-semibold text-slate-800 truncate tracking-tight">{ep.path}</code>
                                                        {category && (
                                                            <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded border border-slate-100 font-medium">{category.name}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className={`w-1.5 h-1.5 rounded-full ${ep.isActive ? 'bg-emerald-500 shadow-[0_0_6px_-1px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></span>
                                                            <span className={`text-[10px] font-medium ${ep.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                                {ep.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                        <span className="text-slate-200 text-[10px]">•</span>
                                                        <span className="text-[10px] text-slate-400 sm:hidden">{category?.name || 'Uncategorized'}</span>
                                                        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-block">RPC</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center justify-end gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                                                {/* Actions visible on hover (desktop) or always (mobile) */}
                                                <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); copyToClipboard(ep.path); }}
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                                        title="Copy Path"
                                                    >
                                                        <Icons.copy className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); router.push(`/api-tester?method=${ep.method}&path=${ep.path}`); }}
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                                        title="Test Endpoint"
                                                    >
                                                        <Icons.flask className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); router.push(`/api-management/${ep.id}/edit`); }}
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Icons.pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <div className="w-px h-3 bg-slate-200 mx-1 self-center"></div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleToggleEndpoint(ep.id); }}
                                                        className={`w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors ${ep.isActive ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                                                        title={ep.isActive ? "Turn Off" : "Turn On"}
                                                    >
                                                        <Icons.power className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteConfirm('endpoint', ep.id, ep.path)}
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Icons.trash className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredEndpoints.length === 0 && (
                                <div className="text-center p-12 bg-white rounded-xl shadow-sm shadow-slate-200/50 text-slate-400">
                                    <Icons.search className="w-10 h-10 mx-auto mb-4 opacity-20 text-slate-400" />
                                    <p className="font-medium text-slate-600 text-sm">{endpoints.length === 0 ? L.misc?.noEndpointsOne : L.misc?.noEndpointsFilter}</p>
                                    <p className="text-xs mt-1 text-slate-400">
                                        {endpoints.length === 0
                                            ? L.misc?.noEndpointsTwo
                                            : L.misc?.tryAdjusting}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Modal */}
            <Modal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                title={editingCategory ? 'Edit Category' : 'New Category'}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{L.labels.name}</label>
                        <input
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                            value={categoryForm.name}
                            onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                            placeholder={L.placeholders.categoryName}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{L.labels.description}</label>
                        <textarea
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                            value={categoryForm.description}
                            onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                            placeholder={L.placeholders.categoryDescription}
                            rows={3}
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="ghost" onClick={() => setIsCategoryModalOpen(false)}>{L.buttons.cancel}</Button>
                        <Button onClick={handleSaveCategory}>{L.buttons.saveCategory}</Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={executeDelete}
                title={deleteConfirm?.type === 'category' ? 'Delete Category?' : 'Delete Endpoint?'}
                message={`Are you sure you want to delete "${deleteConfirm?.name}"?`}
                confirmText={L.buttons.delete}
                cancelText={L.buttons.cancel}
                variant="danger"
                loading={deleteLoading}
            />
        </div>
    );
};
