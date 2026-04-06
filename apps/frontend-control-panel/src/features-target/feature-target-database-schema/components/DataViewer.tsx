'use client';

/**
 * DataViewer - Flat Luxury UI Refactor
 * Premium Responsive Table View for Data Sources
 */

import { useState, useEffect } from 'react';
import { Button, Select, Badge, Card, CardContent } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { cn } from '@/lib/utils';
import { ConfirmDialog, useConfig } from '@/modules/_core';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { useDataViewer } from '../composables';
import type { DatabaseTable } from '../types';
import { ImportDataModal } from './ImportDataModal';

const L = MODULE_LABELS.databaseSchema;
const PAGE_SIZES = [10, 20, 50, 100];

interface DataViewerProps {
    DatabaseTable: DatabaseTable;
}

export const DataViewer = ({ DatabaseTable }: DataViewerProps) => {
    // ✅ Pure DI: Get all dependencies from context
    const { labels, icons: Icons, api } = useConfig();
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
    }, [DatabaseTable.id, pagination.page, pagination.limit, sorting.sortColumn, sorting.sortDirection]);

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
        setBulkDeleting(true);
        await deleteSelected();
        setBulkDeleting(false);
    };

    return (
        <Card className="border-none shadow-sm bg-card/40 overflow-hidden">
            {/* Table Action Bar */}
            <header className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/5">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm shadow-primary/5">
                        <Icons.chart className="size-6" />
                    </div>
                    <div>
                        <TextHeading size="h5" className="text-base font-semibold lowercase leading-none">{L.labels.tableData}</TextHeading>
                        <p className="text-[11px] text-muted-foreground lowercase mt-1.5 opacity-60">{L.labels.viewAndManageRecords.toLowerCase()}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {selection.selectedCount > 0 && (
                        <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={handleBulkDelete} 
                            isLoading={bulkDeleting}
                            className="h-10 px-6 rounded-xl lowercase font-bold shadow-lg shadow-rose-500/10"
                        >
                            <Icons.trash className="size-4 mr-2" /> {C.actions.delete} ({selection.selectedCount})
                        </Button>
                    )}
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => window.open(`${api.databaseSchema.list}/${DatabaseTable.id}/export?format=csv`, '_blank')}
                        className="h-10 px-4 rounded-xl text-xs font-bold lowercase hover:bg-muted"
                    >
                        <Icons.download className="size-4 mr-2 opacity-40" /> {C.actions.export}
                    </Button>
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setIsImportOpen(true)}
                        className="h-10 px-4 rounded-xl text-xs font-bold lowercase hover:bg-muted"
                    >
                        <Icons.upload className="size-4 mr-2 opacity-40" /> {C.actions.import}
                    </Button>
                    <div className="w-px h-6 bg-border/40 mx-1 hidden sm:block" />
                    <Button 
                        size="icon-sm" 
                        variant="ghost" 
                        onClick={fetchData} 
                        isLoading={loading}
                        className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                    >
                        <Icons.refresh className={cn("size-4", loading && 'animate-spin')} />
                    </Button>
                </div>
            </header>

            {/* Desktop Table View */}
            <div className="hidden md:block w-full overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/30 border-b border-border/5">
                            <th className="pl-8 py-5 w-12">
                                <SelectionCheckbox
                                    checked={rows.length > 0 && selection.selectedCount === rows.length}
                                    onChange={() => selection.toggleAll(rows)}
                                />
                            </th>
                            <th className="px-6 py-5 w-20 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{C.table.id}</th>
                            {columns.slice(0, 5).map(col => (
                                <th
                                    key={col.name}
                                    className="px-6 py-5 cursor-pointer group"
                                    onClick={() => handleSort(col.name)}
                                >
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 group-hover:text-primary/60 transition-colors">
                                        {col.name}
                                        {sorting.sortColumn === col.name && (
                                            <span className="text-primary animate-in fade-in zoom-in-75 duration-300">
                                                {sorting.sortDirection === 'ASC' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {columns.length > 5 && <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/20">...</th>}
                            <th className="pr-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{C.table.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/5">
                        {loading && rows.length === 0 ? (
                            <tr>
                                <td colSpan={100} className="py-24 text-center">
                                    <Icons.loading className="size-8 animate-spin mx-auto opacity-20" />
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={100} className="py-24 text-center">
                                     <div className="flex flex-col items-center gap-3 opacity-30">
                                        <Icons.database className="size-12" />
                                        <p className="text-sm font-medium lowercase">{C.table.noData}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, i) => {
                                const isSelected = selection.isSelected(row.id as number);
                                return (
                                    <tr 
                                        key={String(row.id || i)} 
                                        className={cn(
                                            "group transition-all duration-300 hover:bg-muted/10",
                                            isSelected ? 'bg-primary/5' : ''
                                        )}
                                    >
                                        <td className="pl-8 py-4">
                                            <SelectionCheckbox
                                                checked={isSelected}
                                                onChange={() => selection.toggle(row.id as number)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-mono text-[11px] text-muted-foreground/50">{String(row.id)}</td>
                                        {columns.slice(0, 5).map(col => (
                                            <td key={col.name} className="px-6 py-4 max-w-[240px] truncate text-xs font-medium text-foreground/80 lowercase">
                                                {typeof row[col.name] === 'object'
                                                    ? <span className="opacity-40 font-mono text-[10px]">{JSON.stringify(row[col.name])}</span>
                                                    : String(row[col.name] || '-')
                                                }
                                            </td>
                                        ))}
                                        {columns.length > 5 && <td className="px-6 py-4 text-muted-foreground/20 text-xs">...</td>}
                                        <td className="pr-8 py-4 text-right">
                                            <Button
                                                size="icon-sm"
                                                variant="ghost"
                                                className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/10 hover:text-rose-600"
                                                onClick={() => setConfirmDelete(row)}
                                            >
                                                <Icons.trash className="size-3.5" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View Placeholder (Simplified for brevity but styled similarly) */}
            <div className="md:hidden p-6 space-y-4">
                 {rows.map((row, i) => (
                    <div key={i} className="p-4 bg-muted/20 rounded-2xl space-y-3 ring-1 ring-border/5">
                        <div className="flex items-center justify-between">
                             <SelectionCheckbox
                                checked={selection.isSelected(row.id as number)}
                                onChange={() => selection.toggle(row.id as number)}
                            />
                            <Badge variant="outline" className="text-[10px] font-mono border-none bg-muted px-2 py-0.5">#{row.id}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             {columns.slice(0, 4).map(col => (
                                 <div key={col.name} className="space-y-0.5">
                                     <label className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/40">{col.name}</label>
                                     <p className="text-xs font-medium lowercase truncate">{String(row[col.name] || '-')}</p>
                                 </div>
                             ))}
                        </div>
                    </div>
                 ))}
                 {rows.length === 0 && !loading && (
                      <div className="py-12 text-center text-muted-foreground/40 lowercase text-xs italic">{C.table.noData}</div>
                 )}
            </div>

            {/* Table Footer / Pagination */}
            <footer className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-border/5 bg-muted/10">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 shrink-0">Rows per page</label>
                        <div className="w-20">
                            <Select
                                value={String(pagination.limit)}
                                onChange={(e) => pagination.setLimit(Number(e.target.value))}
                                size="sm"
                                fullWidth
                                className="h-8 text-[10px] font-bold"
                                options={PAGE_SIZES.map(size => ({ label: String(size), value: String(size) }))}
                            />
                        </div>
                    </div>
                    <div className="h-4 w-px bg-border/20 hidden sm:block" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hidden sm:block">
                         {Math.min((pagination.page - 1) * pagination.limit + 1, total)}-{Math.min(pagination.page * pagination.limit, total)} <span className="opacity-30 mx-1">of</span> {total} {C.pagination.items}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        disabled={pagination.page === 1}
                        onClick={() => pagination.setPage(pagination.page - 1)}
                        className="h-9 px-4 rounded-xl lowercase font-bold text-xs"
                    >
                        <Icons.chevronLeft className="size-4 mr-2" /> {C.pagination.previous}
                    </Button>
                    
                    <div className="flex items-center bg-muted/40 rounded-xl px-3 h-9 ring-1 ring-border/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mr-2">{C.pagination.page}</span>
                        <input
                            type="number"
                            min={1}
                            max={totalPages}
                            value={pagination.page}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val >= 1 && val <= totalPages) pagination.setPage(val);
                            }}
                            className="w-8 h-6 bg-transparent text-center text-[11px] font-black text-primary border-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">/ {totalPages}</span>
                    </div>

                    <Button
                        size="sm"
                        variant="ghost"
                        disabled={pagination.page === totalPages}
                        onClick={() => pagination.setPage(pagination.page + 1)}
                        className="h-9 px-4 rounded-xl lowercase font-bold text-xs"
                    >
                        {C.pagination.next} <Icons.chevronRight className="size-4 ml-2" />
                    </Button>
                </div>
            </footer>

            <ConfirmDialog
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleDelete}
                title="delete record?"
                message={L.messages.confirm.deleteRow.toLowerCase()}
                confirmText={C.actions.delete.toLowerCase()}
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

const SelectionCheckbox = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button
        onClick={onChange}
        className={cn(
            "size-5 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
            checked 
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-muted/40 border-transparent hover:border-primary/20'
        )}
    >
        {checked && <Icons.check className="size-3 stroke-4" />}
    </button>
);
