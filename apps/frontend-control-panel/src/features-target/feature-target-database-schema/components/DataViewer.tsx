'use client';

import { useState, useEffect, useMemo } from 'react';

import {
  Button,
  Badge,
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Checkbox,
  NativeSelect,
} from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { PageTitle } from '@/components/ui/page-title';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/modules/_core';
import { useDataViewer } from '../composables';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { API } from '../api/endpoints';
const L = MODULE_LABELS.databaseSchema;
import type { DatabaseTable } from '../types';
import { ImportDataModal } from './ImportDataModal';
import { RowEditorModal } from './RowEditorModal';

const PAGE_SIZES = [10, 20, 50, 100];
const C = {
    actions: { delete: 'delete', export: 'export', import: 'import' },
    table: { id: 'id', actions: 'actions', noData: 'no records found' },
    pagination: { limit: 'limit', items: 'items', previous: 'prev', next: 'next', page: 'page' },
    status: { noData: 'no records found' }
};

interface DataViewerProps {
  DatabaseTable: DatabaseTable;
}

export const DataViewer = ({ DatabaseTable }: DataViewerProps) => {
  const {
    rows,
    columns: physicalColumns,
    loading,
    total,
    pagination,
    sorting,
    selection,
    fetchData,
    deleteRow,
    deleteSelected,
    exportData,
    insertRow,
    updateRow,
  } = useDataViewer(DatabaseTable?.id);

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editData, setEditData] = useState<Record<string, any> | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ✅ SAFELY RESOLVE COLUMNS: Merge physical truth with metadata order
  const displayColumns = useMemo(() => {
    // 1. Get metadata order
    let metadataColumns: any[] = [];
    try {
      const jsonStr = DatabaseTable?.schemaJson;
      if (jsonStr) {
        const parsed = JSON.parse(jsonStr);
        metadataColumns = parsed.columns || [];
      }
    } catch (e) {
      console.error('Failed to parse schemaJson', e);
    }

    // 2. If no physical columns loaded yet, show metadata as skeleton/fallback
    if (!physicalColumns || physicalColumns.length === 0) return metadataColumns;

    // 3. Merge: Respect metadata order, but ensure physical existence
    const orderedCols: any[] = [];
    
    // Create a case-insensitive map of physical columns
    const physicalMap = new Map();
    physicalColumns.forEach((c: any) => {
      const name = (c.name || c.Field || "").toLowerCase();
      if (name) physicalMap.set(name, c);
    });

    // First, add columns that exist in both (respect metadata order)
    for (const metaCol of metadataColumns) {
      const nameKey = (metaCol.name || "").toLowerCase();
      if (!nameKey) continue;

      const physicalMatch = physicalMap.get(nameKey);
      if (physicalMatch) {
        orderedCols.push({
          ...physicalMatch,
          displayName: metaCol.displayName || metaCol.name || physicalMatch.name,
        });
        physicalMap.delete(nameKey);
      }
    }

    // Then, add any remaining physical columns (appended at end)
    // This ensures new columns added directly to DB still show up
    for (const physCol of physicalMap.values()) {
      orderedCols.push(physCol);
    }

    return orderedCols;
  }, [physicalColumns, DatabaseTable?.schemaJson]);

  const totalPages = Math.ceil(total / (pagination?.limit || 10)) || 1;

  // ✅ HARD-LOCK: Only fetch when primitives change
  useEffect(() => {
    if (DatabaseTable?.id) {
      fetchData();
    }
  }, [
    DatabaseTable?.id,
    pagination?.page,
    pagination?.limit,
    sorting?.sortColumn,
    sorting?.sortDirection,
    // Removed fetchData and other unstable objects
  ]);

  const handleBulkDelete = async () => {
    if (!selection || selection.selectedCount === 0) return;
    setBulkDeleting(true);
    await deleteSelected();
    setBulkDeleting(false);
  };

  const handleSingleDelete = async () => {
    if (!deleteId) return;
    await deleteRow(deleteId);
    setDeleteId(null);
  };

  const handleSaveRow = async (data: Record<string, any>) => {
    if (editData?.id) {
      return await updateRow(Number(editData.id), data);
    } else {
      return await insertRow(data);
    }
  };

  const openAddModal = () => {
    setEditData(null);
    setIsEditorOpen(true);
  };

  const openEditModal = (row: any) => {
    setEditData(row);
    setIsEditorOpen(true);
  };

  // Export logic moved to useDataViewer

  if (!DatabaseTable) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="w-full max-w-full min-w-0 overflow-hidden border-none shadow-sm bg-card/60 backdrop-blur-sm rounded-[32px]">
        {/* Header Section */}
        <header className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/10">
          <div className="flex items-center gap-4">
            <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center transition-transform hover:rotate-6">
              {Icons.stats ? <Icons.stats className="size-5" /> : <div className="size-5" />}
            </div>
            <div>
              <TextHeading
                size="h6"
                className="text-base font-medium lowercase leading-none text-foreground"
              >
                {L?.labels?.tableData || 'table data'}
              </TextHeading>
              <p className="text-base text-muted-foreground lowercase mt-2 font-normal opacity-60">
                {(L?.labels?.viewAndManageRecords || 'view and manage records').toLowerCase()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {selection?.selectedCount > 0 && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
                isLoading={bulkDeleting}
              >
                <Icons.trash className="mr-2" /> {C?.actions?.delete || 'delete'} (
                {selection.selectedCount})
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={exportData}
            >
              <Icons.download className="mr-2" /> {C?.actions?.export || 'export'}
            </Button>

            <Button size="sm" variant="ghost" onClick={() => setIsImportOpen(true)}>
              <Icons.upload className="mr-2" /> {C?.actions?.import || 'import'}
            </Button>

            <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

            <Button size="sm" variant="default" onClick={openAddModal}>
              <Icons.plus className="mr-2" /> add record
            </Button>

            <Button size="icon-sm" variant="ghost" onClick={fetchData} isLoading={loading}>
              <Icons.refresh className={cn(loading && 'animate-spin text-primary')} />
            </Button>
          </div>
        </header>

        {/* Main Table Content */}
        <div className="relative w-full max-w-full overflow-x-auto custom-scrollbar min-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/5 border-b border-border/10">
                <TableHead className="w-12 pl-6">
                  <Checkbox
                    checked={
                      (rows || []).length > 0 && selection?.selectedCount === (rows || []).length
                    }
                    onCheckedChange={() => selection?.toggleAll(rows || [])}
                  />
                </TableHead>
                {displayColumns?.map((col: any) => (
                  <TableHead
                    key={col.name}
                    className="cursor-pointer group whitespace-nowrap"
                    onClick={() => sorting?.handleSort?.(col.name)}
                  >
                    <div className="flex items-center gap-2 text-sm font-normal lowercase text-muted-foreground/60 group-hover:text-primary transition-colors">
                      {col.displayName || col.name}
                      {sorting?.sortColumn === col.name && (
                        <span className="text-primary animate-in fade-in slide-in-from-bottom-1">
                          {sorting.sortDirection === 'ASC' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-right pr-6 text-sm font-normal lowercase text-muted-foreground/60">
                  {C?.table?.actions || 'actions'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (rows || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={100} className="h-64 text-center">
                    <div className="sticky left-0 w-full flex flex-col items-center gap-3 opacity-20">
                      <Icons.loading className="size-10 animate-spin text-primary" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (rows || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={100} className="h-64 text-center">
                    <div className="sticky left-0 w-full flex flex-col items-center gap-4">
                      <div className="size-16 rounded-[24px] bg-muted flex items-center justify-center text-muted-foreground">
                        <Icons.database className="size-8" />
                      </div>
                      <p className="text-base font-normal lowercase text-muted-foreground">
                        {C?.table?.noData || C?.status?.noData || 'no records found'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rows?.map((row, i) => {
                  if (!row) return null;
                  const isSelected = selection?.isSelected?.((row as any).id);
                  return (
                    <TableRow
                      key={String(row.id || i)}
                      className={cn(
                        'group transition-colors border-b border-border/5',
                        isSelected ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/5',
                      )}
                    >
                      <TableCell className="pl-6">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => selection?.toggle?.((row as any).id)}
                        />
                      </TableCell>
                      {displayColumns?.map((col: any) => {
                        // ✅ CASE-INSENSITIVE FALLBACK: Try exact, then camelCase, then snake_case
                        const colName = col.name;
                        let val = row[colName];
                        
                        if (val === undefined) {
                           // Fallback to searching keys (e.g. if DB has created_at but row has createdAt)
                           const rowKeys = Object.keys(row);
                           const matchingKey = rowKeys.find(k => k.toLowerCase() === colName.toLowerCase());
                           if (matchingKey) val = row[matchingKey];
                        }

                        return (
                          <TableCell
                            key={`${row.id || i}-${colName}`}
                            className="max-w-[140px] truncate text-sm font-normal text-foreground lowercase py-5"
                          >
                            {val === null || val === undefined ? (
                               <span className="opacity-20">-</span>
                            ) : val instanceof Date ? (
                               val.toLocaleString()
                            ) : typeof val === 'object' ? (
                              <Badge
                                variant="outline"
                                className="text-xs font-mono lowercase opacity-50 px-2 py-0.5"
                              >
                                json
                              </Badge>
                            ) : (
                              // Detect if string looks like a date and format it
                              typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{3}Z$/.test(val) 
                                ? new Date(val).toLocaleString()
                                : String(val)
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-10 rounded-xl hover:bg-muted text-muted-foreground"
                            onClick={() => openEditModal(row)}
                          >
                            <Icons.edit className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-10 rounded-xl hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                            onClick={() => setDeleteId(row.id as number)}
                          >
                            <Icons.trash className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer / Pagination */}
        <footer className="p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-border/10 order-last">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-normal lowercase text-muted-foreground/60 shrink-0">
                {C?.pagination?.limit || 'limit'}
              </label>
              <NativeSelect
                value={String(pagination?.limit || 10)}
                onChange={(e) => pagination?.setLimit?.(Number(e.target.value))}
                className="h-10 w-24 text-sm font-normal bg-transparent border-border rounded-xl"
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="w-px h-6 bg-border hidden sm:block" />
            <p className="text-sm font-normal lowercase text-muted-foreground/60 hidden sm:block">
              {total > 0 ? (pagination?.page - 1) * pagination?.limit + 1 : 0}-
              {Math.min(pagination?.page * pagination?.limit, total)}
              <span className="text-border mx-2">/</span> {total} {C?.pagination?.items || 'items'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              disabled={pagination?.page === 1 || loading}
              onClick={() => pagination?.setPage?.(pagination.page - 1)}
            >
              <Icons.chevronLeft /> {C?.pagination?.previous || 'prev'}
            </Button>

            <div className="flex items-center bg-muted/40 backdrop-blur-sm rounded-xl px-4 h-10 border border-border">
              <span className="text-sm font-normal lowercase text-muted-foreground/60 mr-3">
                {C?.pagination?.page || 'page'}
              </span>
              <span className="text-lg font-normal text-primary">{pagination?.page}</span>
              <span className="text-sm font-normal lowercase text-muted-foreground/60 ml-2">
                / {totalPages}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              disabled={pagination?.page === totalPages || loading}
              onClick={() => pagination?.setPage?.(pagination.page + 1)}
            >
              {C?.pagination?.next || 'next'} <Icons.chevronRight />
            </Button>
          </div>
        </footer>
      </Card>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleSingleDelete}
        title={(C?.actions?.delete || 'delete') + ' record?'}
        message={(
          L?.messages?.confirm?.deleteRow || 'are you sure you want to delete this record?'
        ).toLowerCase()}
        confirmText={(C?.actions?.delete || 'delete').toLowerCase()}
        variant="danger"
      />

      <ImportDataModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        DatabaseTableId={DatabaseTable?.id}
        onSuccess={fetchData}
      />

      <RowEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        columns={displayColumns}
        rowData={editData}
        onSave={handleSaveRow}
      />
    </div>
  );
};
