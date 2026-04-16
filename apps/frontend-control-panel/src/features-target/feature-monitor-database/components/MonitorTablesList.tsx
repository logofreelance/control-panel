'use client';

/**
 * MonitorTablesList - Shows list of database tables with their stats
 * Mobile-first responsive design: Card view on mobile, Table on desktop
 * Groups tables into System and Custom categories
 */

import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import type { TableStat } from '../types';
import { cn } from '@/lib/utils';

const L = MODULE_LABELS.monitorDatabase?.labels || {};
const MSG = MODULE_LABELS.monitorDatabase?.messages || {};
const BTN = MODULE_LABELS.monitorDatabase?.buttons || {};

// Tables that cannot be deleted (system tables)
const PROTECTED_TABLES = [
    'admin_users',
    'users',
    'permissions',
    'user_permissions',
    'roles',
    'api_keys',
    'site_settings',
    'data_sources',
    'data_source_resources',
    'data_source_migrations',
    'route_logs',
    'node_health_metrics',
    'route_prefixes',
];

interface MonitorTablesListProps {
    tables: TableStat[];
    loading?: boolean;
    dropping?: boolean;
    onDelete?: (tableName: string) => Promise<boolean>;
}

const isProtected = (tableName: string): boolean => {
    return PROTECTED_TABLES.includes(tableName.toLowerCase());
};

const getTableIcon = (tableName: string) => {
    const name = tableName.toLowerCase();
    if (name.includes('user')) return Icons.user;
    if (name.includes('setting')) return Icons.settings;
    if (name.includes('api')) return Icons.key;
    if (name.includes('log')) return Icons.fileText;
    if (name.includes('permission') || name.includes('role')) return Icons.shield;
    if (name.includes('data_source')) return Icons.database;
    return Icons.table;
};

// Mobile Card Component
const TableCard = ({ table, onDelete, dropping, isSystem }: { table: TableStat; onDelete: (name: string) => void; dropping?: boolean; isSystem: boolean }) => {
    const Icon = getTableIcon(table.name);

    return (
        <Card>
            <CardContent className="relative">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "size-10 rounded-xl flex items-center justify-center",
                            isSystem ? "bg-muted text-primary" : "bg-muted text-muted-foreground"
                        )}>
                            <Icon className="size-5" />
                        </div>
                        <div>
                            <h4 className="font-normal text-foreground text-base lowercase">{table.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                {isSystem && (
                                    <span className="text-base font-normal text-primary flex items-center gap-1">
                                        <Icons.lock className="size-3" /> {L.system || 'system'}
                                    </span>
                                )}
                                <span className="text-base text-muted-foreground font-normal lowercase">{table.rows.toLocaleString()} {L.rows || 'rows'}</span>
                            </div>
                        </div>
                    </div>
                    {onDelete && !isSystem && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(table.name)}
                            disabled={dropping}
                            className="size-8 text-muted-foreground hover:text-destructive transition-colors"
                        >
                            <Icons.trash className="size-4" />
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-2 py-4 border-t border-border mt-2">
                    <div className="text-center">
                        <p className="text-base text-muted-foreground font-normal mb-1 lowercase">{L.data || 'data'}</p>
                        <p className="text-base font-normal text-foreground lowercase">{table.sizeMb} {L.mb || 'mb'}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-base text-muted-foreground font-normal mb-1 lowercase">{L.index || 'index'}</p>
                        <p className="text-base font-normal text-primary lowercase">{table.indexSizeMb} {L.mb || 'mb'}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-base text-muted-foreground font-normal mb-1 lowercase">{L.overhead || 'overhead'}</p>
                        <p className="text-base font-normal text-primary lowercase">{table.overheadMb} {L.mb || 'mb'}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Table Section Component (Desktop)
const TableSection = ({
    title,
    tables,
    isSystem,
    dropping,
    onDeleteClick
}: {
    title: string;
    tables: TableStat[];
    isSystem: boolean;
    dropping?: boolean;
    onDeleteClick: (name: string) => void;
}) => {
    if (!tables.length) return null;

    return (
        <div className="overflow-hidden">
            {/* Section Header */}
            <div className={cn(
                "px-2 py-4 border-b border-border flex items-center gap-3",
                isSystem ? "bg-muted" : "bg-transparent"
            )}>
                {isSystem ? (
                    <Icons.lock className="size-5 text-primary" />
                ) : (
                    <Icons.table className="size-5 text-primary" />
                )}
                <h4 className={cn("text-base font-normal lowercase", isSystem ? "text-primary" : "text-foreground")}>{title}</h4>
                <span className="text-base text-muted-foreground ml-auto lowercase">{tables.length} tables</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-muted border-b border-border">
                        <tr>
                            <th className="py-4 px-6 text-base font-normal text-muted-foreground lowercase w-1/3">table name</th>
                            <th className="py-4 px-6 text-base font-normal text-muted-foreground lowercase text-center">rows</th>
                            <th className="py-4 px-6 text-base font-normal text-muted-foreground lowercase text-right">data</th>
                            <th className="py-4 px-6 text-base font-normal text-muted-foreground lowercase text-right">index</th>
                            <th className="py-4 px-6 text-base font-normal text-muted-foreground lowercase text-right">overhead</th>
                            {!isSystem && <th className="py-4 px-6 w-12"></th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border border-b border-border">
                        {tables.map((table) => {
                            const Icon = getTableIcon(table.name);
                            return (
                                <tr key={table.name} className="hover:bg-muted transition-all group">
                                    <td className="py-3 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "size-10 rounded-xl flex items-center justify-center shrink-0",
                                                isSystem ? "bg-background text-primary" : "bg-muted text-muted-foreground"
                                            )}>
                                                <Icon className="size-5" />
                                            </div>
                                            <p className="font-normal text-base text-foreground truncate lowercase">{table.name}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-6 text-base font-normal text-foreground text-center tabular-nums">
                                        {table.rows.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-6 text-base font-normal text-foreground text-right lowercase">
                                        {table.sizeMb} {L.mb || 'mb'}
                                    </td>
                                    <td className="py-3 px-6 text-base text-primary font-normal text-right lowercase">
                                        {table.indexSizeMb} {L.mb || 'mb'}
                                    </td>
                                    <td className="py-3 px-6 text-base text-primary font-normal text-right lowercase">
                                        {table.overheadMb} {L.mb || 'mb'}
                                    </td>
                                    {!isSystem && (
                                        <td className="py-3 px-6 text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDeleteClick(table.name)}
                                                disabled={dropping}
                                                className="size-8 rounded-xl text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Icons.trash className="size-4" />
                                            </Button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const MonitorTablesList = ({ tables, loading, dropping, onDelete }: MonitorTablesListProps) => {
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Split tables into system and user tables
    const { systemTables, userTables } = useMemo(() => {
        const system: TableStat[] = [];
        const user: TableStat[] = [];

        tables.forEach(table => {
            if (isProtected(table.name)) {
                system.push(table);
            } else {
                user.push(table);
            }
        });

        return { systemTables: system, userTables: user };
    }, [tables]);

    const handleDeleteClick = (tableName: string) => {
        if (isProtected(tableName)) return;
        setConfirmDelete(tableName);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete || !onDelete) return;
        setDeleting(true);
        await onDelete(confirmDelete);
        setDeleting(false);
        setConfirmDelete(null);
    };


    if (!tables.length) {
        return (
            <Card>
                <CardContent className="text-center">
                    <Icons.database className="size-10 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-foreground font-normal text-base lowercase">{L.noTablesFound || 'no database tables found'}</p>
                    <p className="text-base text-muted-foreground mt-2 lowercase">try refreshing the database state</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6 mt-4">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-foreground lowercase tracking-normal">{L.databaseTables || 'database tables'}</h3>
                    <div className="size-1.5 rounded-full bg-primary animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-normal text-base lowercase rounded-full">
                        {systemTables.length} system
                    </Badge>
                    <Badge variant="secondary" className="font-normal text-base lowercase rounded-full">
                        {userTables.length} custom
                    </Badge>
                </div>
            </div>

            <div className="sm:hidden space-y-8">
                {/* User Tables First */}
                {userTables.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <Icons.table className="w-5 h-5 text-primary" />
                            <h4 className="text-lg font-medium text-foreground">{L.userTables || 'User Tables'}</h4>
                            <span className="text-base text-muted-foreground">({userTables.length})</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {userTables.map((table) => (
                                <TableCard
                                    key={table.name}
                                    table={table}
                                    onDelete={handleDeleteClick}
                                    dropping={dropping}
                                    isSystem={false}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* System Tables */}
                {systemTables.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <Icons.lock className="w-5 h-5 text-primary" />
                            <h4 className="text-lg font-medium text-foreground">{L.systemTables || 'System Tables'}</h4>
                            <span className="text-base text-muted-foreground">({systemTables.length})</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {systemTables.map((table) => (
                                <TableCard
                                    key={table.name}
                                    table={table}
                                    onDelete={handleDeleteClick}
                                    dropping={dropping}
                                    isSystem={true}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop View - Grouped Tables */}
            <div className="hidden sm:block space-y-4">
                {/* User Tables First */}
                <TableSection
                    title={L.userTables || 'User Tables'}
                    tables={userTables}
                    isSystem={false}
                    dropping={dropping}
                    onDeleteClick={handleDeleteClick}
                />

                {/* System Tables */}
                <TableSection
                    title={L.systemTables || 'System Tables'}
                    tables={systemTables}
                    isSystem={true}
                    dropping={dropping}
                    onDeleteClick={handleDeleteClick}
                />
            </div>

            {/* Confirmation Modal */}
            {confirmDelete && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => !deleting && setConfirmDelete(null)} />
                    <Card className="relative w-full max-w-sm animate-in zoom-in-95 duration-200">
                        <CardContent className="px-8">
                            <div className="text-center mb-8">
                                <div className="size-14 rounded-2xl bg-muted mx-auto flex items-center justify-center mb-6">
                                    <Icons.alertTriangle className="size-7 text-destructive" />
                                </div>
                                <h3 className="text-2xl font-semibold text-foreground mb-3 lowercase">{MSG.confirmDelete || 'confirm deletion'}</h3>
                                <p className="text-base font-normal text-muted-foreground lowercase">
                                    are you sure you want to delete <span className="font-semibold text-destructive">{confirmDelete}</span>? {MSG.deleteWarning || 'this action cannot be undone.'}
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    className="flex-1 lowercase"
                                    onClick={() => setConfirmDelete(null)}
                                    disabled={deleting}
                                >
                                    {BTN.cancel || 'cancel'}
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1 lowercase"
                                    onClick={handleConfirmDelete}
                                    disabled={deleting}
                                >
                                    {BTN.delete || 'delete'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>,
                document.body
            )}
        </div>
    );
};
