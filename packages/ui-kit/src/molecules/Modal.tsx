'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 !z-[9999] flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="bg-white rounded-xl shadow-xl ring-1 ring-slate-900/5 w-full max-w-lg relative !z-[10000] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 flex-shrink-0">
                    <h3 className="font-semibold text-lg text-slate-800">{title}</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <span className="text-lg leading-none">&times;</span>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};
