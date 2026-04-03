'use client';

/**
 * MonitorTablesList - Shows list of database tables with their stats
 * Mobile-first responsive design: Card view on mobile, Table on desktop
 * Groups tables into System and Custom categories
 */

import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import type { TableStat } from '../types';

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
        <div className="bg-white rounded-xl shadow-sm shadow-slate-200/50 p-4 relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isSystem ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800 text-sm">{table.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            {isSystem && (
                                <span className="text-[9px] font-medium bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <Icons.lock className="w-2.5 h-2.5" /> {L.system || 'System'}
                                </span>
                            )}
                            <span className="text-[10px] text-slate-500">{table.rows.toLocaleString()} {L.rows || 'Rows'}</span>
                        </div>
                    </div>
                </div>
                {onDelete && !isSystem && (
                    <button
                        onClick={() => onDelete(table.name)}
                        disabled={dropping}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <Icons.delete className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-50">
                <div className="text-center">
                    <p className="text-[10px] uppercase text-slate-400 font-medium mb-1">{L.data || 'Data'}</p>
                    <p className="text-xs font-semibold text-slate-700">{table.sizeMb} {L.mb || 'MB'}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] uppercase text-slate-400 font-medium mb-1">{L.index || 'Index'}</p>
                    <p className="text-xs font-semibold text-blue-600">{table.indexSizeMb} {L.mb || 'MB'}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] uppercase text-slate-400 font-medium mb-1">{L.overhead || 'Overhead'}</p>
                    <p className="text-xs font-semibold text-amber-600">{table.overheadMb} {L.mb || 'MB'}</p>
                </div>
            </div>
        </div>
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
        <div className="bg-white rounded-xl shadow-sm shadow-slate-200/50 overflow-hidden">
            {/* Section Header */}
            <div className={`px-5 py-3 border-b border-slate-100 flex items-center gap-2 ${isSystem ? 'bg-amber-50/50' : 'bg-slate-50/50'}`}>
                {isSystem ? (
                    <Icons.lock className="w-4 h-4 text-amber-600" />
                ) : (
                    <Icons.table className="w-4 h-4 text-teal-600" />
                )}
                <h4 className={`text-sm font-semibold ${isSystem ? 'text-amber-700' : 'text-slate-700'}`}>{title}</h4>
                <span className="text-xs text-slate-400 ml-auto">{tables.length}</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/30 border-b border-slate-100">
                        <tr>
                            <th className="py-2.5 px-5 text-[10px] font-medium text-slate-500 uppercase tracking-wider w-1/3">Table Name</th>
                            <th className="py-2.5 px-5 text-[10px] font-medium text-slate-500 uppercase tracking-wider">{L.totalRows || 'Rows'}</th>
                            <th className="py-2.5 px-5 text-[10px] font-medium text-slate-500 uppercase tracking-wider">{L.data || 'Data'}</th>
                            <th className="py-2.5 px-5 text-[10px] font-medium text-slate-500 uppercase tracking-wider">{L.index || 'Index'}</th>
                            <th className="py-2.5 px-5 text-[10px] font-medium text-slate-500 uppercase tracking-wider">{L.overhead || 'Overhead'}</th>
                            {!isSystem && <th className="py-2.5 px-5 w-12"></th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {tables.map((table) => {
                            const Icon = getTableIcon(table.name);
                            return (
                                <tr key={table.name} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="py-3 px-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isSystem ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-500'}`}>
                                                <Icon className="w-3 h-3" />
                                            </div>
                                            <p className="font-medium text-sm text-slate-700 truncate">{table.name}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-5 text-sm font-mono text-slate-600">
                                        {table.rows.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-5 text-sm font-medium text-slate-700">
                                        {table.sizeMb} {L.mb || 'MB'}
                                    </td>
                                    <td className="py-3 px-5 text-sm text-blue-600">
                                        {table.indexSizeMb} {L.mb || 'MB'}
                                    </td>
                                    <td className="py-3 px-5 text-sm text-amber-600">
                                        {table.overheadMb} {L.mb || 'MB'}
                                    </td>
                                    {!isSystem && (
                                        <td className="py-3 px-5 text-right">
                                            <button
                                                onClick={() => onDeleteClick(table.name)}
                                                disabled={dropping}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Icons.trash className="w-3.5 h-3.5" />
                                            </button>
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

    if (loading) return null; // Parent handles loading skeleton

    if (!tables.length) {
        return (
            <div className="bg-white rounded-xl shadow-sm shadow-slate-200/50 p-8 text-center">
                <Icons.database className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500 font-medium text-sm">{L.noTablesFound || 'No tables found'}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-800">{L.databaseTables || 'Database Tables'}</h3>
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg font-medium">
                        {systemTables.length} system
                    </span>
                    <span className="text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded-lg font-medium">
                        {userTables.length} custom
                    </span>
                </div>
            </div>

            {/* Mobile View - Cards grouped */}
            <div className="sm:hidden space-y-6">
                {/* User Tables First */}
                {userTables.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <Icons.table className="w-4 h-4 text-teal-600" />
                            <h4 className="text-sm font-semibold text-slate-700">{L.userTables || 'User Tables'}</h4>
                            <span className="text-xs text-slate-400">({userTables.length})</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
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
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <Icons.lock className="w-4 h-4 text-amber-600" />
                            <h4 className="text-sm font-semibold text-amber-700">{L.systemTables || 'System Tables'}</h4>
                            <span className="text-xs text-slate-400">({systemTables.length})</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
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
                <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => !deleting && setConfirmDelete(null)} />
                    <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 rounded-full bg-red-100 mx-auto flex items-center justify-center mb-4">
                                <Icons.alertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">{MSG.confirmDelete || 'Confirm Deletion'}</h3>
                            <p className="text-sm text-slate-500">
                                Are you sure you want to delete <span className="font-mono font-medium text-slate-900">{confirmDelete}</span>? {MSG.deleteWarning || 'This action cannot be undone.'}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="ghost"
                                className="flex-1"
                                onClick={() => setConfirmDelete(null)}
                                disabled={deleting}
                            >
                                {BTN.cancel || 'Cancel'}
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={handleConfirmDelete}
                                isLoading={deleting}
                            >
                                {BTN.delete || 'Delete'}
                            </Button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
