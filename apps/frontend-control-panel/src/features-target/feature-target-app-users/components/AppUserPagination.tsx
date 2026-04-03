'use client';

import { Card, Button, Text } from '@/components/ui';
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
        <Card >
            <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Text variant="detail">
                    {APP_USER_LABELS.pagination.showing(start, end, totalItems)}
                </Text>

                <div className="flex items-center gap-1.5">
                    <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <Icons.chevronLeft className="size-4" />
                    </Button>

                    {getPageNumbers().map((page, idx) => (
                        <button
                            key={idx}
                            onClick={() => typeof page === 'number' && onPageChange(page)}
                            disabled={page === '...'}
                            className={cn(
                                "size-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors",
                                page === currentPage
                                    ? 'bg-foreground text-background'
                                    : page === '...'
                                        ? 'cursor-default text-muted-foreground'
                                        : 'text-foreground hover:bg-muted'
                            )}
                        >
                            {page}
                        </button>
                    ))}

                    <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <Icons.chevronRight className="size-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
};
