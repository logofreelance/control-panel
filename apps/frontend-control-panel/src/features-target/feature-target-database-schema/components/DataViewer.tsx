'use client';

// DataViewer - Premium Responsive Table View for Data Sources
// Pure UI component - all operations delegated to useDataViewer composable
// ✅ PURE DI: Uses useConfig() hook for all config, labels, icons, api

import { useState, useEffect } from 'react';
import { Button, Select, Heading, Text, Stack, Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ConfirmDialog, useConfig } from '@/modules/_core';
import { useDataViewer } from '../composables';
import type { DatabaseTable } from '../types';
import { ImportDataModal } from './ImportDataModal';

interface DataViewerProps {
    DatabaseTable: DatabaseTable;
}

const PAGE_SIZES = [10, 20, 50, 100];

export const DataViewer = ({ DatabaseTable }: DataViewerProps) => {
    // ✅ Pure DI: Get all dependencies from context
    const { labels, icons: Icons, api } = useConfig();
    const L = labels.mod.databaseSchema;
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
    } = useDataViewer(DatabaseTable.id);

    // UI-only state
    const [confirmDelete, setConfirmDelete] = useState<Record<string, unknown> | null>(null);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    const columns = DatabaseTable.schema?.columns || [];
    const totalPages = Math.ceil(total / pagination.limit) || 1;

    // Fetch data when dependencies change
    useEffect(() => {
        fetchData();
        selection.deselectAll();
    }, [DatabaseTable.id, pagination.page, pagination.limit, sorting.sortColumn, sorting.sortDirection, fetchData, selection]);

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
            className={cn("p-4 border-b border-border last:border-b-0", selection.isSelected(row.id as number) ? 'bg-primary/5' : '')}
        >
            <Stack direction="row" align="start" justify="between" gap={3} className="mb-3">
                <Stack direction="row" align="center" gap={3}>
                    <input
                        type="checkbox"
                        checked={selection.isSelected(row.id as number)}
                        onChange={() => selection.toggle(row.id as number)}
                        className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                        {C.table.id}: {String(row.id)}
                    </span>
                </Stack>
                <button
                    onClick={() => setConfirmDelete(row)}
                    className="text-muted-foreground hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                >
                    <Icons.delete className="w-4 h-4" />
                </button>
            </Stack>
            <div className="space-y-2">
                {columns.slice(0, 5).map(col => (
                    <div key={col.name} className="flex flex-col">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                            {col.name}
                        </span>
                        <Text className="text-sm break-words">
                            {typeof row[col.name] === 'object'
                                ? JSON.stringify(row[col.name])
                                : String(row[col.name] || '-')
                            }
                        </Text>
                    </div>
                ))}
                {columns.length > 5 && (
                    <Text variant="muted" className="text-xs italic pt-2">
                        +{columns.length - 5} {C.pagination.items}...
                    </Text>
                )}
            </div>
        </div>
    );

    return (
        <Card  className="overflow-hidden w-full max-w-full">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30">
                <Stack direction="row" align="center" gap={3}>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icons.chart className="w-5 h-5" />
                    </div>
                    <div>
                        <Heading level={5}>{L.labels.tableData}</Heading>
                        <Text variant="muted" className="text-xs">{L.labels.viewAndManageRecords}</Text>
                    </div>
                </Stack>
                <Stack direction="row" wrap gap={2}>
                    {selection.selectedCount > 0 && (
                        <Button size="sm" variant="destructive" onClick={handleBulkDelete} isLoading={bulkDeleting} className="gap-2">
                            <Icons.delete className="w-4 h-4" /> {C.actions.delete} ({selection.selectedCount})
                        </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => window.open(`${api.databaseSchema.list}/${DatabaseTable.id}/export?format=csv`, '_blank')} className="gap-1">
                        <Icons.download className="w-4 h-4 hidden sm:inline" /> {C.actions.export}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsImportOpen(true)} className="gap-1">
                        <Icons.upload className="w-4 h-4 hidden sm:inline" /> {C.actions.import}
                    </Button>
                    <Button size="sm" variant="outline" onClick={fetchData} isLoading={loading}>
                        <Icons.refresh className={cn("w-4 h-4", loading && 'animate-spin')} />
                    </Button>
                </Stack>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
                        <tr>
                            <th className="px-6 py-4 w-12 text-center">
                                <input
                                    type="checkbox"
                                    checked={rows.length > 0 && selection.selectedCount === rows.length}
                                    onChange={() => selection.toggleAll(rows)}
                                    className="rounded border-border text-primary focus:ring-primary"
                                />
                            </th>
                            <th className="px-6 py-4 w-16">{C.table.id}</th>
                            {columns.slice(0, 5).map(col => (
                                <th
                                    key={col.name}
                                    className="px-6 py-4 cursor-pointer hover:text-primary transition-colors group"
                                    onClick={() => handleSort(col.name)}
                                >
                                    <Stack direction="row" align="center" gap={1}>
                                        {col.name}
                                        {sorting.sortColumn === col.name && (
                                            <span className="text-xs text-primary">
                                                {sorting.getSortIcon(col.name)}
                                            </span>
                                        )}
                                    </Stack>
                                </th>
                            ))}
                            {columns.length > 5 && <th className="px-6 py-4 text-muted-foreground">...</th>}
                            <th className="px-6 py-4 text-right">{C.table.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading && rows.length === 0 ? (
                            <tr>
                                <td colSpan={100} className="p-12 text-center text-muted-foreground">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={100} className="p-12 text-center text-muted-foreground">
                                    {C.table.noData}
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, i) => (
                                <tr key={String(row.id || i)} className={cn("hover:bg-muted/30 transition-colors group", selection.isSelected(row.id as number) ? 'bg-primary/5' : '')}>
                                    <td className="px-6 py-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selection.isSelected(row.id as number)}
                                            onChange={() => selection.toggle(row.id as number)}
                                            className="rounded border-border text-primary focus:ring-primary"
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-mono text-muted-foreground">{String(row.id)}</td>
                                    {columns.slice(0, 5).map(col => (
                                        <td key={col.name} className="px-6 py-4 max-w-[200px] truncate text-foreground">
                                            {typeof row[col.name] === 'object'
                                                ? JSON.stringify(row[col.name])
                                                : String(row[col.name] || '-')
                                            }
                                        </td>
                                    ))}
                                    {columns.length > 5 && <td className="px-6 py-4 text-muted-foreground">...</td>}
                                    <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setConfirmDelete(row)}
                                            className="text-muted-foreground hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
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
                    <div className="p-12 text-center text-muted-foreground">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : rows.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        {C.table.noData}
                    </div>
                ) : (
                    <>
                        {/* Mobile Select All Header */}
                        <div className="p-3 bg-muted border-b border-border flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={rows.length > 0 && selection.selectedCount === rows.length}
                                onChange={() => selection.toggleAll(rows)}
                                className="rounded border-border text-primary focus:ring-primary"
                            />
                            <Text variant="muted" className="text-xs">
                                {selection.selectedCount > 0 ? `${selection.selectedCount} ${C.table.selected.replace('{count}', '')}` : C.table.selectAll}
                            </Text>
                        </div>
                        {rows.map((row, i) => (
                            <MobileCardView key={String(row.id || i)} row={row} />
                        ))}
                    </>
                )}
            </div>

            {/* Pagination */}
            {totalPages >= 1 && (
                <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/30">
                    <Stack direction="row" align="center" gap={2} className="text-xs text-muted-foreground">
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
                        <span className="hidden sm:inline text-muted-foreground">|</span>
                        <span className="hidden sm:inline">
                            {Math.min((pagination.page - 1) * pagination.limit + 1, total)}-{Math.min(pagination.page * pagination.limit, total)} {C.pagination.of} {total}
                        </span>
                    </Stack>
                    <Stack direction="row" align="center" gap={2}>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={pagination.page === 1}
                            onClick={() => pagination.setPage(pagination.page - 1)}
                        >
                            <span className="hidden sm:inline">{C.pagination.previous}</span>
                            <span className="sm:hidden"><Icons.arrowLeft className="w-4 h-4" /></span>
                        </Button>
                        <Stack direction="row" align="center" gap={1}>
                            <span className="text-xs text-muted-foreground">{C.pagination.page}</span>
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
                                className="w-12 h-7 text-center text-xs border border-border rounded focus:border-primary focus:outline-none"
                            />
                            <span className="text-xs text-muted-foreground">/ {totalPages}</span>
                        </Stack>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={pagination.page === totalPages}
                            onClick={() => pagination.setPage(pagination.page + 1)}
                        >
                            <span className="hidden sm:inline">{C.pagination.next}</span>
                            <span className="sm:hidden"><Icons.arrowRight className="w-4 h-4" /></span>
                        </Button>
                    </Stack>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleDelete}
                title={`${C.actions.delete} ${L.labels.records}`}
                message={L.messages.confirm.deleteRow}
                variant="destructive"
            />

            <ImportDataModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                DatabaseTableId={DatabaseTable.id}
                onSuccess={fetchData}
            />
        </Card>
    );
};
