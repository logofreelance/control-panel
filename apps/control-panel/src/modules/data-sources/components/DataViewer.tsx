'use client';

// DataViewer - Premium Responsive Table View for Data Sources
// Pure UI component - all operations delegated to useDataViewer composable
// ✅ PURE DI: Uses useConfig() hook for all config, labels, icons, api

import { useState, useEffect } from 'react';
import { Button, Select } from '@cp/ui';
import { ConfirmDialog, useConfig } from '@/modules/_core';
import { useDataViewer } from '../composables';
import type { DataSource } from '../types';
import { ImportDataModal } from './ImportDataModal';

interface DataViewerProps {
    dataSource: DataSource;
}

const PAGE_SIZES = [10, 20, 50, 100];

export const DataViewer = ({ dataSource }: DataViewerProps) => {
    // ✅ Pure DI: Get all dependencies from context
    const { labels, icons: Icons, api } = useConfig();
    const L = labels.mod.dataSources;
    const C = labels.common;

    // All data operations from composable
    const {
        rows,
        loading,
        total,
        pagination,
        sorting,
        selection,
        fetchData,
        deleteRow,
        deleteSelected,
    } = useDataViewer(dataSource.id);

    // UI-only state
    const [confirmDelete, setConfirmDelete] = useState<Record<string, unknown> | null>(null);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    const columns = dataSource.schema?.columns || [];
    const totalPages = Math.ceil(total / pagination.limit) || 1;

    // Fetch data when dependencies change
    useEffect(() => {
        fetchData();
        selection.deselectAll();
    }, [dataSource.id, pagination.page, pagination.limit, sorting.sortColumn, sorting.sortDirection, fetchData, selection]);

    // UI Handlers - delegate to composable
    const handleSort = (colName: string) => {
        sorting.handleSort(colName);
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        await deleteRow(confirmDelete.id as number);
        setConfirmDelete(null);
    };

    const handleBulkDelete = async () => {
        if (selection.selectedCount === 0) return;
        if (!confirm(`${C.messages.confirmDeleteMultiple.replace('{count}', String(selection.selectedCount))}`)) return;

        setBulkDeleting(true);
        await deleteSelected();
        setBulkDeleting(false);
    };

    // Mobile Card View Component (pure UI)
    const MobileCardView = ({ row }: { row: Record<string, unknown> }) => (
        <div
            className={`p-4 border-b border-slate-100 last:border-b-0 ${selection.isSelected(row.id as number) ? 'bg-indigo-50/30' : ''}`}
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={selection.isSelected(row.id as number)}
                        onChange={() => selection.toggle(row.id as number)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        {C.table.id}: {String(row.id)}
                    </span>
                </div>
                <button
                    onClick={() => setConfirmDelete(row)}
                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                >
                    <Icons.delete className="w-4 h-4" />
                </button>
            </div>
            <div className="space-y-2">
                {columns.slice(0, 5).map(col => (
                    <div key={col.name} className="flex flex-col">
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                            {col.name}
                        </span>
                        <span className="text-sm text-slate-700 break-words">
                            {typeof row[col.name] === 'object'
                                ? JSON.stringify(row[col.name])
                                : String(row[col.name] || '-')
                            }
                        </span>
                    </div>
                ))}
                {columns.length > 5 && (
                    <div className="text-xs text-slate-400 italic pt-2">
                        +{columns.length - 5} {C.pagination.items}...
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm shadow-slate-200/50 overflow-hidden w-full max-w-full">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                        <Icons.chart className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">{L.labels.tableData}</h3>
                        <p className="text-xs text-slate-500">{L.labels.viewAndManageRecords}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {selection.selectedCount > 0 && (
                        <Button size="sm" variant="danger" onClick={handleBulkDelete} isLoading={bulkDeleting} className="gap-2">
                            <Icons.delete className="w-4 h-4" /> {C.actions.delete} ({selection.selectedCount})
                        </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => window.open(`${api.dataSources.list}/${dataSource.id}/export?format=csv`, '_blank')} className="gap-1">
                        <Icons.download className="w-4 h-4 hidden sm:inline" /> {C.actions.export}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsImportOpen(true)} className="gap-1">
                        <Icons.upload className="w-4 h-4 hidden sm:inline" /> {C.actions.import}
                    </Button>
                    <Button size="sm" variant="slate" onClick={fetchData} isLoading={loading}>
                        <Icons.refresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 w-12 text-center">
                                <input
                                    type="checkbox"
                                    checked={rows.length > 0 && selection.selectedCount === rows.length}
                                    onChange={() => selection.toggleAll(rows)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                            </th>
                            <th className="px-6 py-4 w-16">{C.table.id}</th>
                            {columns.slice(0, 5).map(col => (
                                <th
                                    key={col.name}
                                    className="px-6 py-4 cursor-pointer hover:text-indigo-600 transition-colors group"
                                    onClick={() => handleSort(col.name)}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.name}
                                        {sorting.sortColumn === col.name && (
                                            <span className="text-xs text-indigo-500">
                                                {sorting.getSortIcon(col.name)}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {columns.length > 5 && <th className="px-6 py-4 text-slate-400">...</th>}
                            <th className="px-6 py-4 text-right">{C.table.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading && rows.length === 0 ? (
                            <tr>
                                <td colSpan={100} className="p-12 text-center text-slate-400">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={100} className="p-12 text-center text-slate-400">
                                    {C.table.noData}
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, i) => (
                                <tr key={String(row.id || i)} className={`hover:bg-slate-50/50 transition-colors group ${selection.isSelected(row.id as number) ? 'bg-indigo-50/30' : ''}`}>
                                    <td className="px-6 py-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selection.isSelected(row.id as number)}
                                            onChange={() => selection.toggle(row.id as number)}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-400">{String(row.id)}</td>
                                    {columns.slice(0, 5).map(col => (
                                        <td key={col.name} className="px-6 py-4 max-w-[200px] truncate text-slate-700">
                                            {typeof row[col.name] === 'object'
                                                ? JSON.stringify(row[col.name])
                                                : String(row[col.name] || '-')
                                            }
                                        </td>
                                    ))}
                                    {columns.length > 5 && <td className="px-6 py-4 text-slate-400">...</td>}
                                    <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setConfirmDelete(row)}
                                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                        >
                                            <Icons.delete className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
                {loading && rows.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : rows.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        {C.table.noData}
                    </div>
                ) : (
                    <>
                        {/* Mobile Select All Header */}
                        <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={rows.length > 0 && selection.selectedCount === rows.length}
                                onChange={() => selection.toggleAll(rows)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-xs text-slate-500">
                                {selection.selectedCount > 0 ? `${selection.selectedCount} ${C.table.selected.replace('{count}', '')}` : C.table.selectAll}
                            </span>
                        </div>
                        {rows.map((row, i) => (
                            <MobileCardView key={String(row.id || i)} row={row} />
                        ))}
                    </>
                )}
            </div>

            {/* Pagination */}
            {totalPages >= 1 && (
                <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>{C.pagination.items}:</span>
                        <div className="w-20">
                            <Select
                                value={String(pagination.limit)}
                                onChange={(e) => pagination.setLimit(Number(e.target.value))}
                                size="sm"
                                fullWidth={true}
                                options={PAGE_SIZES.map(size => ({ label: String(size), value: String(size) }))}
                            />
                        </div>
                        <span className="hidden sm:inline text-slate-300">|</span>
                        <span className="hidden sm:inline">
                            {Math.min((pagination.page - 1) * pagination.limit + 1, total)}-{Math.min(pagination.page * pagination.limit, total)} {C.pagination.of} {total}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="slate"
                            disabled={pagination.page === 1}
                            onClick={() => pagination.setPage(pagination.page - 1)}
                        >
                            <span className="hidden sm:inline">{C.pagination.previous}</span>
                            <span className="sm:hidden"><Icons.arrowLeft className="w-4 h-4" /></span>
                        </Button>
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400">{C.pagination.page}</span>
                            <input
                                type="number"
                                min={1}
                                max={totalPages}
                                value={pagination.page}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val) && val >= 1 && val <= totalPages) {
                                        pagination.setPage(val);
                                    }
                                }}
                                className="w-12 h-7 text-center text-xs border border-slate-200 rounded focus:border-indigo-500 focus:outline-none"
                            />
                            <span className="text-xs text-slate-400">/ {totalPages}</span>
                        </div>
                        <Button
                            size="sm"
                            variant="slate"
                            disabled={pagination.page === totalPages}
                            onClick={() => pagination.setPage(pagination.page + 1)}
                        >
                            <span className="hidden sm:inline">{C.pagination.next}</span>
                            <span className="sm:hidden"><Icons.arrowRight className="w-4 h-4" /></span>
                        </Button>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleDelete}
                title={`${C.actions.delete} ${L.labels.records}`}
                message={L.messages.confirm.deleteRow}
                variant="danger"
            />

            <ImportDataModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                dataSourceId={dataSource.id}
                onSuccess={fetchData}
            />
        </div>
    );
};
