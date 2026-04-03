'use client';

// ToastContainer - Modern toast notifications with swipe-to-dismiss
// Position: Top center, slides in from top
// Swipe: Up, Left, Right to dismiss
// Persists across page reloads using sessionStorage

import { useState, useRef, useEffect } from 'react';
import { ToastIcons, Icons } from '@/lib/config/client';
import { useToast } from '../composables/useToast';

interface ToastItemProps {
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    onRemove: (id: string) => void;
    index: number;
}

const ToastItem = ({ id, message, type, onRemove, index }: ToastItemProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isClosing, setIsClosing] = useState(false);
    const startPos = useRef({ x: 0, y: 0 });
    const threshold = 80;

    const typeConfig = {
        success: {
            bg: 'bg-white',
            border: 'border-[var(--primary)]',
            iconBg: 'bg-[color-mix(in_srgb,var(--primary)_15%,white)]',
            iconColor: 'text-[var(--primary)]',
        },
        error: {
            bg: 'bg-white',
            border: 'border-red-200',
            iconBg: 'bg-red-50',
            iconColor: 'text-red-600',
        },
        warning: {
            bg: 'bg-white',
            border: 'border-amber-200',
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600',
        },
        info: {
            bg: 'bg-white',
            border: 'border-[var(--primary)]',
            iconBg: 'bg-[color-mix(in_srgb,var(--primary)_15%,white)]',
            iconColor: 'text-[var(--primary)]',
        },
    };

    const config = typeConfig[type];
    const TypeIcon = ToastIcons[type];

    const handleStart = (clientX: number, clientY: number) => {
        setIsDragging(true);
        startPos.current = { x: clientX, y: clientY };
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (!isDragging) return;
        const deltaX = clientX - startPos.current.x;
        const deltaY = clientY - startPos.current.y;
        setOffset({
            x: deltaX,
            y: Math.min(0, deltaY),
        });
    };

    const handleEnd = () => {
        setIsDragging(false);
        const shouldDismiss =
            Math.abs(offset.x) > threshold || offset.y < -threshold;

        if (shouldDismiss) {
            setIsClosing(true);
            setTimeout(() => onRemove(id), 200);
        } else {
            setOffset({ x: 0, y: 0 });
        }
    };

    const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientX, e.clientY);
    const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => handleEnd();
    const onMouseLeave = () => {
        if (isDragging) handleEnd();
    };

    const onTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
    };
    const onTouchMove = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
    };
    const onTouchEnd = () => handleEnd();

    const opacity = isClosing ? 0 : 1 - Math.min(Math.abs(offset.x) / 150, Math.abs(offset.y) / 100);

    return (
        <div
            className={`
                ${config.bg} ${config.border}
                px-4 py-3 rounded-xl shadow-lg shadow-slate-200/50 border
                flex items-center gap-3 cursor-grab active:cursor-grabbing select-none
                transition-all duration-200 ease-out
                ${isClosing ? 'scale-95 opacity-0' : 'animate-in slide-in-from-top-4 fade-in'}
            `}
            style={{
                transform: `translate(${offset.x}px, ${offset.y}px)`,
                opacity,
                animationDelay: `${index * 50}ms`,
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div className={`w-8 h-8 rounded-lg ${config.iconBg} flex items-center justify-center shrink-0`}>
                <TypeIcon className={`w-4 h-4 ${config.iconColor}`} />
            </div>
            <span className="text-sm font-medium text-slate-700 flex-1">{message}</span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsClosing(true);
                    setTimeout(() => onRemove(id), 200);
                }}
                className="w-6 h-6 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            >
                <Icons.close className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

export const ToastContainer = () => {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[250] space-y-2 w-full max-w-sm px-4">
            {toasts.map((toast, idx) => (
                <ToastItem
                    key={toast.id}
                    id={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onRemove={removeToast}
                    index={idx}
                />
            ))}
        </div>
    );
};
