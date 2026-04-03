'use client';

/**
 * UsersTable - Table/cards component for displaying users
 * Refactored to match Dashboard design standards (Flat UI, Mobile-First)
 */

import { Icons, MODULE_LABELS } from '@/lib/config/client';
import type { User } from '../types';

const L = MODULE_LABELS.users;

interface UsersTableProps {
    users: User[];
    loading?: boolean;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
}

// Dynamic role styling based on roleLevel from backend (or fallback to name-based)
const getRoleStyle = (user: User) => {
    const level = user.roleLevel;
    // If we have level info from backend, use it
    if (level !== null && level !== undefined) {
        if (level >= 90) return 'bg-red-50 text-red-600';
        if (level >= 70) return 'bg-amber-50 text-amber-600';
        if (level >= 50) return 'bg-blue-50 text-blue-600';
        if (level >= 30) return 'bg-purple-50 text-purple-600';
        return 'bg-slate-50 text-slate-600';
    }
    // Fallback to name-based styling
    const lowerRole = user.role?.toLowerCase() || '';
    if (lowerRole.includes('super')) return 'bg-red-50 text-red-600';
    if (lowerRole.includes('admin')) return 'bg-amber-50 text-amber-600';
    if (lowerRole.includes('designer')) return 'bg-blue-50 text-blue-600';
    if (lowerRole.includes('affiliate') || lowerRole.includes('affiliator')) return 'bg-purple-50 text-purple-600';
    return 'bg-slate-50 text-slate-600';
};

// Format role for display - prefer display_name from backend
const formatRoleName = (user: User) => {
    if (user.roleDisplayName) return user.roleDisplayName;
    if (!user.role) return 'User';
    return user.role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const UsersTable = ({ users, loading, onEdit, onDelete }: UsersTableProps) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl p-5 shadow-sm shadow-slate-200/50">
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl animate-pulse">
                            <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                            <div className="flex-1">
                                <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                                <div className="h-3 w-48 bg-slate-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!users.length) {
        return (
            <div className="bg-white rounded-xl p-12 shadow-sm shadow-slate-200/50 text-center">
                <Icons.user className="w-10 h-10 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-600 font-medium">{L.messages.empty}</p>
                <p className="text-sm text-slate-400 mt-1">{L.messages.noResults}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm shadow-slate-200/50 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="py-3 px-5 text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider">{L.labels.user}</th>
                            <th className="py-3 px-5 text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider">{L.columns.email}</th>
                            <th className="py-3 px-5 text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider">{L.labels.role}</th>
                            <th className="py-3 px-5 text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider">{L.labels.status}</th>
                            <th className="py-3 px-5 text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider">{L.columns.lastLogin}</th>
                            <th className="py-3 px-5 w-20"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {users.map((user) => (
                            <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="py-3 px-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold text-sm shrink-0">
                                            {user.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <span className="font-medium text-sm text-slate-800">{user.username}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-5 text-slate-500 text-sm">{user.email}</td>
                                <td className="py-3 px-5">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1 ${getRoleStyle(user)}`}>
                                        {formatRoleName(user)}
                                        {user.roleIsSuper && <Icons.crown className="w-3 h-3" />}
                                    </span>
                                </td>
                                <td className="py-3 px-5">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${user.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        {user.isActive !== false ? L.labels.active : L.labels.inactive}
                                    </span>
                                </td>
                                <td className="py-3 px-5 text-slate-400 text-sm">{formatDate(user.createdAt)}</td>
                                <td className="py-3 px-5">
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onEdit(user)}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                        >
                                            <Icons.pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(user)}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <Icons.trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-slate-50">
                {users.map((user) => (
                    <div key={user.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold shrink-0">
                                    {user.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-sm text-slate-800 truncate">{user.username}</p>
                                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                                <button
                                    onClick={() => onEdit(user)}
                                    className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                    <Icons.pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onDelete(user)}
                                    className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <Icons.trash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-medium inline-flex items-center gap-1 ${getRoleStyle(user)}`}>
                                {formatRoleName(user)}
                                {user.roleIsSuper && <Icons.crown className="w-2.5 h-2.5" />}
                            </span>
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-medium ${user.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {user.isActive !== false ? L.labels.active : L.labels.inactive}
                            </span>
                            <span className="px-2 py-1 rounded-lg text-[10px] font-medium bg-slate-50 text-slate-400">
                                {formatDate(user.createdAt)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
