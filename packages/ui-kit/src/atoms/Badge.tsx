'use client';

import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'success' | 'danger' | 'warning' | 'slate';
    className?: string;
}

export const Badge = ({ children, variant = 'primary', className = '' }: BadgeProps) => {
    const variants = {
        primary: "bg-[var(--primary-glow)] text-[var(--primary)] border-[var(--primary)]/10",
        success: "bg-green-50 text-green-700 border-green-100",
        danger: "bg-red-50 text-red-600 border-red-100",
        warning: "bg-amber-50 text-amber-700 border-amber-100",
        slate: "bg-slate-50 text-slate-500 border-slate-100"
    };

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
