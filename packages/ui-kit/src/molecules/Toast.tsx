'use client';

import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose, duration = 3000 }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(onClose, 300); // Wait for fade-out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColors = {
        success: 'bg-white border-green-100 text-green-700',
        error: 'bg-white border-red-100 text-red-700',
        info: 'bg-white border-blue-100 text-blue-700',
    };

    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
    };

    return (
        <div className={`
            fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 
            rounded-[2rem] border shadow-2xl transition-all duration-300 transform
            ${isExiting ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
            ${bgColors[type]}
            animate-in slide-in-from-bottom-4
        `}>
            <span className="text-sm">{icons[type]}</span>
            <p className="text-xs font-black tracking-tight">{message}</p>
            <button
                onClick={() => { setIsExiting(true); setTimeout(onClose, 300); }}
                className="ml-4 opacity-30 hover:opacity-100 transition-opacity"
            >
                ✕
            </button>
        </div>
    );
};
