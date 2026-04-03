/**
 * @repo/frontend-form-utils
 * 
 * Auto-generate URL slug from input value
 */

import { useState, useCallback, useEffect } from 'react';

export interface UseAutoSlugOptions {
    /** Source value to generate slug from */
    source: string;
    /** Whether auto-generation is enabled */
    enabled?: boolean;
    /** Custom slug generator function */
    generator?: (source: string) => string;
}

export interface UseAutoSlugReturn {
    slug: string;
    setSlug: (value: string) => void;
    isManual: boolean;
    setManual: (manual: boolean) => void;
    regenerate: () => void;
}

/**
 * Default slug generator - converts string to URL-friendly format
 */
export function generateSlug(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')  // Remove special chars
        .replace(/\s+/g, '-')       // Replace spaces with hyphens
        .replace(/-+/g, '-')        // Remove consecutive hyphens
        .replace(/^-|-$/g, '');     // Trim hyphens from ends
}

/**
 * Hook for auto-generating slugs from source value
 */
export function useAutoSlug(options: UseAutoSlugOptions): UseAutoSlugReturn {
    const { source, enabled = true, generator = generateSlug } = options;

    const [slug, setSlugState] = useState('');
    const [isManual, setManual] = useState(false);

    // Auto-generate when source changes (and not manual)
    useEffect(() => {
        if (enabled && !isManual && source) {
            setSlugState(generator(source));
        }
    }, [source, enabled, isManual, generator]);

    const setSlug = useCallback((value: string) => {
        setSlugState(value);
        setManual(true); // Mark as manual when user edits
    }, []);

    const regenerate = useCallback(() => {
        setSlugState(generator(source));
        setManual(false);
    }, [source, generator]);

    return {
        slug,
        setSlug,
        isManual,
        setManual,
        regenerate,
    };
}
