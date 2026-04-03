'use client';

/**
 * UsersPagination - Pagination controls for users list
 * Refactored to match Dashboard design standards (Flat UI)
 */

import { Icons, MODULE_LABELS } from '@/lib/config/client';

const L = MODULE_LABELS.users;

interface UsersPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    onPageChange: (page: number) => void;
}

export const UsersPagination = ({
    currentPage,
    totalPages,
    totalItems,
    limit,
    onPageChange
}: UsersPaginationProps) => {
    const start = (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, totalItems);

    // Generate page numbers to show
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl p-4 shadow-sm shadow-slate-200/50">
            {/* Info */}
            <p className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-700">{start}-{end}</span> {L.labels.of} <span className="font-semibold text-slate-700">{totalItems}</span>
            </p>

            {/* Pagination controls */}
            <div className="flex items-center gap-1.5">
                {/* Previous */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <Icons.chevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((page, idx) => (
                    <button
                        key={idx}
                        onClick={() => typeof page === 'number' && onPageChange(page)}
                        disabled={page === '...'}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${page === currentPage
                            ? 'bg-slate-900 text-white'
                            : page === '...'
                                ? 'cursor-default text-slate-400'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        {page}
                    </button>
                ))}

                {/* Next */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <Icons.chevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
