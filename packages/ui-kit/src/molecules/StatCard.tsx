'use client';

import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    suffix?: string;
    dark?: boolean;
}

export const StatCard = ({ title, value, suffix = "", dark = false }: StatCardProps) => (
    <div className={`p-6 rounded-lg ${dark ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200'} flex-1 min-w-[200px] shadow-sm hover:shadow transition-all group cursor-default relative overflow-hidden`}>
        {dark && (
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] blur-[60px] opacity-20 -mr-10 -mt-10"></div>
        )}
        <div className="flex justify-between items-start mb-4 relative z-10">
            <p className={`text-sm font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
            <div className={`w-8 h-8 rounded-full border transition-colors ${dark ? 'border-slate-800' : 'border-slate-100 group-hover:bg-slate-50'} flex items-center justify-center text-xs`}>↗</div>
        </div>
        <div className="flex items-baseline gap-2 relative z-10">
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <span className={`text-xs font-medium ${dark ? 'text-[var(--primary)]' : 'text-[var(--primary)]'}`}>{suffix}</span>
        </div>
    </div>
);
