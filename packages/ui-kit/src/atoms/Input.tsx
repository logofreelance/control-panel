'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    label?: string;
    icon?: string;
    isTextarea?: boolean;
}

export const Input = ({ label, icon, isTextarea, className = '', ...props }: InputProps) => {
    const Tag = isTextarea ? 'textarea' : 'input';

    return (
        <div className="space-y-1.5 group">
            {label && (
                <label className="block text-sm font-medium text-slate-500 mb-1 px-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors">
                        {icon}
                    </div>
                )}
                <Tag
                    className={`
                        w-full bg-white border border-slate-200 rounded-lg py-2.5 
                        ${icon ? 'pl-10' : 'px-3'} 
                        pr-3 text-sm focus:outline-none focus:ring-2 
                        focus:ring-[var(--primary-glow)] focus:border-[var(--primary)] 
                        transition-all placeholder:text-slate-400
                        ${isTextarea ? 'min-h-[100px] resize-none' : ''}
                        ${className}
                    `}
                    {...(props as any)}
                />
            </div>
        </div>
    );
};
