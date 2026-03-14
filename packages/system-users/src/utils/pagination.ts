export const parsePagination = (query: Record<string, string>) => {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || '10', 10)));
    const offset = (page - 1) * limit;
    return { page, limit, offset };
};

export const buildPaginationMeta = (total: number, page: number, limit: number) => {
    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
    };
};
