'use client';

import React from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { X } from 'lucide-react';

interface MenuItem {
    id: string;
    label: string;
    Icon?: LucideIcon;
    icon?: string; // Fallback for emoji strings
    href?: string; // Direct link support
    parentId?: string; // For submenu items
}

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    siteName: string;
    menuItems: Array<MenuItem>;
}

/**
 * NavItemLink - Using Next.js Link for instant navigation with prefetching
 */
const NavItemLink = ({
    item,
    active,
    onClose
}: {
    item: MenuItem;
    active: boolean;
    onClose: () => void;
}) => {
    const href = item.href || `/${item.id === 'dashboard' ? '' : item.id}`;

    return (

        <Link
            href={href}
            onClick={onClose}
            prefetch={true}
            className={`
                    flex items-center gap-3 px-3 py-2 rounded-r-lg text-sm transition-all duration-200 group font-normal border-l-[3px]
                    ${active
                    ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/5'
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
                `}
        >
            {item.Icon ? (
                <item.Icon className={`w-4 h-4 ${active ? 'text-[var(--primary)]' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`} />
            ) : (
                <span className="text-lg">{item.icon}</span>
            )}
            <span className="truncate">{item.label}</span>
        </Link>
    );
};

/**
 * SubNavItemLink - Submenu items with Link
 */
const SubNavItemLink = ({
    item,
    active,
    onClose
}: {
    item: MenuItem;
    active: boolean;
    onClose: () => void;
}) => {
    const href = item.href || `/${item.id}`;

    return (
        <Link
            href={href}
            onClick={onClose}
            prefetch={true}
            className={`
                    w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all font-normal
                    ${active
                    ? 'text-[var(--primary)] bg-[var(--primary)]/5'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }
                `}
        >
            {item.Icon ? (
                <item.Icon className="w-4 h-4" />
            ) : (
                <span className="text-xs">{item.icon}</span>
            )}
            <span className="text-xs">{item.label}</span>
        </Link>
    );
};

export const Sidebar = ({
    isOpen,
    onClose,
    activeTab,
    siteName,
    menuItems
}: SidebarProps) => {
    // Separate main items and sub items
    const mainItems = menuItems.filter(item => !item.parentId);
    const getSubItems = (parentId: string) => menuItems.filter(item => item.parentId === parentId);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar Container */}
            <div className={`
                    fixed lg:sticky top-0 left-0 h-screen w-64 bg-white z-[70] transition-transform duration-500 flex flex-col
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                {/* Header - Fixed */}
                <div className="flex items-center justify-between p-4">
                    <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-7 h-7 bg-[var(--primary)] shrink-0 rounded-md flex items-center justify-center text-white font-bold shadow-sm shadow-blue-500/30">
                            {siteName ? siteName[0].toUpperCase() : 'M'}
                        </div>
                        <span className="text-base font-semibold tracking-tight text-slate-800">
                            {siteName || 'Modular'}
                        </span>
                    </Link>
                    <button onClick={onClose} className="lg:hidden w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Menu Area - scrollbar hidden */}
                <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-4"> {/* sidebar-scroll-area */}
                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] font-medium text-slate-400 mb-2 px-3 uppercase tracking-wider">Engine Panel</p>
                            <nav className="space-y-1">
                                {mainItems.map((item) => {
                                    const subItems = getSubItems(item.id);
                                    const hasSubItems = subItems.length > 0;
                                    const isParentActive = activeTab === item.id || subItems.some(sub => activeTab === sub.id);

                                    return (
                                        <div key={item.id}>
                                            <NavItemLink
                                                item={item}
                                                active={activeTab === item.id}
                                                onClose={onClose}
                                            />
                                            {/* Submenu Items */}
                                            {hasSubItems && (
                                                <div className={`ml-4 pl-3 border-l-2 mt-1 mb-2 space-y-1 transition-all ${isParentActive ? 'border-[var(--primary)]/30' : 'border-slate-100'}`}>
                                                    {subItems.map(sub => (
                                                        <SubNavItemLink
                                                            key={sub.id}
                                                            item={sub}
                                                            active={activeTab === sub.id}
                                                            onClose={onClose}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Footer - Fixed */}
                <div className="p-6 pt-0">
                    <div className="bg-slate-50/50 rounded-xl p-4">
                        <p className="text-[10px] font-medium text-slate-400 mb-1 text-center">System Status</p>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse shadow-[0_0_8px_var(--primary)]"></div>
                            <span className="text-[10px] font-semibold text-slate-600">v1.1.0 Atomic</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
