'use client';

import React from 'react';

interface HeaderProps {
    onMenuToggle: () => void;
    userInitials: string;
    onProfileClick: () => void;
    siteName?: string;
}

export const Header = ({ onMenuToggle, userInitials, onProfileClick, siteName }: HeaderProps) => (
    <header className="flex items-center justify-between gap-4 mb-6 lg:mb-8">
        {/* Mobile Sidebar Toggle */}
        <div className="flex lg:hidden items-center gap-3">
            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white font-bold transition-all shadow-sm shadow-blue-500/20">
                {siteName ? siteName[0].toUpperCase() : 'M'}
            </div>
            <button
                onClick={onMenuToggle}
                className="w-10 h-10 flex items-center justify-center bg-white text-[var(--primary)] rounded-xl shadow-sm shadow-slate-200/50"
            >
                ☰
            </button>
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center relative shadow-sm shadow-slate-200/50 hover:bg-slate-50 transition-colors">
                🔔<span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[var(--accent)] rounded-full shadow-[0_0_5px_var(--accent)]"></span>
            </button>
            <div
                className="w-10 h-10 bg-[var(--primary)] rounded-full cursor-pointer hover:bg-[var(--primary)]/90 transition-all shadow-sm shadow-blue-500/20 flex items-center justify-center font-bold text-white text-xs"
                onClick={onProfileClick}
            >
                {userInitials}
            </div>
        </div>
    </header>
);
