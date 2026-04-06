'use client';

/**
 * AppUserPagination - Refactored to Analytics Style (V2 Clean Typography)
 * 
 * STICKING TO RULES:
 * - No tracking-*
 * - No text size < text-xs
 * - No text color opacity (text-foreground/80)
 * - Standard Button usage only
 * 
 * UPDATE: Removed forced 'lowercase' transformation from status text 
 * to avoid 'overdoing' lowercase while keeping a premium minimalist feel.
 */

import { Button } from '@/components/ui';
import { Icons } from '../config/icons';
import { APP_USER_LABELS } from '../constants/ui-labels';
import { cn } from '@/lib/utils';
import type { AppUserPaginationState as PaginationType } from '../types/app-user.types';

interface AppUserPaginationProps {
    pagination: PaginationType;
    limit: number;
    onPageChange: (page: number) => void;
}

export const AppUserPagination = ({
    pagination,
    limit,
    onPageChange
}: AppUserPaginationProps) => {
    if (!pagination) return null;
    
    const { page: currentPage, total: totalItems } = pagination;
    const totalPages = Math.ceil(totalItems / limit);
    
    const start = (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, totalItems);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 py-6 px-1 border-t border-border mt-4">
            <div className="flex items-center gap-3">
                 <div className="size-2 rounded-full bg-chart-2 animate-pulse" />
                 <p className="text-xs font-normal text-muted-foreground">
                    {APP_USER_LABELS.pagination.showing(start, end, totalItems)}
                </p>
            </div>

            <div className="flex items-center gap-1 bg-muted/20 p-1.5 rounded-xl border border-border">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <Icons.chevronLeft className="size-4" />
                </Button>

                <div className="flex items-center gap-1 px-1">
                    {getPageNumbers().map((page, idx) => (
                        <button
                            key={idx}
                            onClick={() => typeof page === 'number' && onPageChange(page)}
                            disabled={page === '...'}
                            className={cn(
                                "h-9 min-w-[36px] px-2 rounded-lg flex items-center justify-center text-xs font-semibold transition-all",
                                page === currentPage
                                    ? 'bg-foreground text-background shadow-none'
                                    : page === '...'
                                        ? 'cursor-default text-muted-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-background'
                            )}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <Icons.chevronRight className="size-4" />
                </Button>
            </div>
        </div>
    );
};
