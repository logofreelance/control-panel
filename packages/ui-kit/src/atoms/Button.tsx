'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost' | 'success' | 'danger' | 'warning' | 'slate';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
}

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading,
    className = '',
    ...props
}: ButtonProps) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-[var(--primary)] text-white hover:opacity-90",
        outline: "border border-slate-200 bg-white text-slate-600 hover:border-[var(--primary)] hover:text-[var(--primary)]",
        ghost: "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent",
        success: "bg-green-500 text-white hover:bg-green-600",
        danger: "bg-red-500 text-white hover:bg-red-600",
        warning: "bg-yellow-500 text-white hover:bg-yellow-600",
        slate: "bg-slate-500 text-white hover:bg-slate-600"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs rounded-md",
        md: "px-4 py-2 text-sm rounded-lg",
        lg: "px-6 py-3 text-sm rounded-lg",
        xl: "px-8 py-4 text-base rounded-xl"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full mr-2"></div>
            ) : null}
            {children}
        </button>
    );
};
