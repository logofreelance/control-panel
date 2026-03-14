'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface NavItemProps {
    Icon?: LucideIcon;
    icon?: string; // Fallback for emoji strings
    label: string;
    active?: boolean;
    onClick: () => void;
}

export const NavItem = ({ Icon, icon, label, active = false, onClick }: NavItemProps) => (
    <div
        onClick={onClick}
        className={`
            flex items-center gap-3 px-3 py-3 rounded-2xl cursor-pointer transition-all 
            ${active
                ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary-glow)] font-bold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }
        `}
    >
        {Icon ? (
            <Icon className="w-5 h-5" />
        ) : (
            <span className="text-lg">{icon}</span>
        )}
        <span className="flex-1 text-sm">{label}</span>
    </div>
);
