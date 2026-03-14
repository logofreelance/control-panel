import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
    ({ className = '', checked, onCheckedChange, label, ...props }, ref) => {

        // Base container styles
        const containerBase = "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

        // Checked state
        const bgClass = checked ? "bg-[var(--primary)]" : "bg-slate-200";

        // Thumb styles
        const thumbBase = "pointer-events-none block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out";
        const thumbTranslate = checked ? "translate-x-5" : "translate-x-0";

        return (
            <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                    <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={(e) => onCheckedChange?.(e.target.checked)}
                        ref={ref}
                        {...props}
                    />
                    <div className={`${containerBase} ${bgClass} ${className}`}>
                        <span
                            className={`${thumbBase} ${thumbTranslate}`}
                        />
                    </div>
                </div>
                {label && (
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                )}
            </label>
        );
    }
);

Switch.displayName = "Switch";
