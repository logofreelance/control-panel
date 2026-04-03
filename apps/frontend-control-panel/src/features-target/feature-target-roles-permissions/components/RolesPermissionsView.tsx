'use client';

/**
 * RolesPermissionsView - Unified management for roles and permissions
 * Features: Tabbed interface, responsive layout, glassmorphic design
 */

import { useState } from 'react';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { RolesTab } from './RolesTab';
import { PermissionsTab } from './PermissionsTab';

const L = MODULE_LABELS.rolesPermissions;

/* ── Decorative Background (Consistent with Dashboard) ──────────────── */
const DecorativeBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-slate-50/50">
        <div className="absolute top-[-5%] right-[5%] w-[40vw] h-[40vw] rounded-full bg-blue-300 opacity-[0.06] blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-5%] left-[0%] w-[35vw] h-[35vw] rounded-full bg-amber-300 opacity-[0.05] blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
);

export const RolesPermissionsView = () => {
    const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');

    return (
        <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
            <DecorativeBackground />

            {/* Header Section */}
            <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 pt-4">
                <div className="space-y-1.5">
                    <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 leading-tight">
                        {L.title}
                    </h1>
                    <p className="text-slate-500 text-sm font-medium max-w-2xl opacity-80">
                        {L.subtitle}
                    </p>
                </div>
            </section>

            {/* Tab Navigation (Glassmorphic) */}
            <div className="flex p-1.5 bg-white/60 backdrop-blur-xl rounded-full w-full max-w-md mb-10 shadow-sm overflow-hidden">
                <button
                    onClick={() => setActiveTab('roles')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'roles'
                        ? 'bg-slate-900 text-white shadow-md translate-y-0'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-white/40'
                        }`}
                >
                    <Icons.shield className="w-4 h-4" />
                    {L.tabs.roles}
                </button>
                <button
                    onClick={() => setActiveTab('permissions')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'permissions'
                        ? 'bg-slate-900 text-white shadow-md translate-y-0'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-white/40'
                        }`}
                >
                    <Icons.unlock className="w-4 h-4" />
                    {L.tabs.permissions}
                </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'roles' ? <RolesTab /> : <PermissionsTab />}
            </div>
        </div>
    );
};
