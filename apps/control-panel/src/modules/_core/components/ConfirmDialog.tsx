'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@cp/ui';
import { Icons, type LucideIcon } from '@cp/config/client';

type ConfirmDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    loading?: boolean;
};

export const ConfirmDialog = ({
    isOpen, onClose, onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    loading = false
}: ConfirmDialogProps) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const variantStyles: Record<string, { Icon: LucideIcon; bg: string; hoverBg: string; iconBg: string; iconColor: string }> = {
        danger: { Icon: Icons.trash, bg: 'bg-red-500', hoverBg: 'hover:bg-red-600', iconBg: 'bg-red-100', iconColor: 'text-red-500' },
        warning: { Icon: Icons.warning, bg: 'bg-amber-500', hoverBg: 'hover:bg-amber-600', iconBg: 'bg-amber-100', iconColor: 'text-amber-500' },
        info: { Icon: Icons.info, bg: 'bg-blue-500', hoverBg: 'hover:bg-blue-600', iconBg: 'bg-blue-100', iconColor: 'text-blue-500' }
    };

    const style = variantStyles[variant];
    const IconComponent = style.Icon;

    return createPortal(
        <div className="fixed inset-0 !z-[9999] flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative !z-[10000]">
                <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-2xl ${style.iconBg} flex items-center justify-center mb-4`}>
                        <IconComponent className={`w-8 h-8 ${style.iconColor}`} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">{message}</p>
                    <div className="flex gap-3 w-full">
                        <Button
                            type="button"
                            variant="slate"
                            className="flex-1"
                            onClick={onClose}
                            disabled={loading}
                        >
                            {cancelText}
                        </Button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className={`flex-1 px-6 py-3 rounded-2xl text-white font-bold transition-all ${style.bg} ${style.hoverBg} disabled:opacity-50 flex items-center justify-center gap-2`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                            ) : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

