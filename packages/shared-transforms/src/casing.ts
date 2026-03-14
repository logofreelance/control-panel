/**
 * @repo/shared-transforms
 * 
 * Utilities for converting between different data formats.
 * Primarily used for API response/request transformation between
 * backend (snake_case) and frontend (camelCase) conventions.
 */

/**
 * Convert a string from snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert a string from camelCase to snake_case
 */
export function camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Deep convert all keys in an object from snake_case to camelCase
 */
export function toCamelCase<T = any>(obj: any): T {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => toCamelCase(item)) as T;
    }

    if (typeof obj === 'object' && obj.constructor === Object) {
        const result: Record<string, any> = {};
        for (const key of Object.keys(obj)) {
            const camelKey = snakeToCamel(key);
            result[camelKey] = toCamelCase(obj[key]);
        }
        return result as T;
    }

    return obj;
}

/**
 * Deep convert all keys in an object from camelCase to snake_case
 */
export function toSnakeCase<T = any>(obj: any): T {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => toSnakeCase(item)) as T;
    }

    if (typeof obj === 'object' && obj.constructor === Object) {
        const result: Record<string, any> = {};
        for (const key of Object.keys(obj)) {
            const snakeKey = camelToSnake(key);
            result[snakeKey] = toSnakeCase(obj[key]);
        }
        return result as T;
    }

    return obj;
}

/**
 * Create a custom transformer with specific field mappings
 * Useful when you need to rename fields or apply custom transformations
 */
export function createTransformer<T = any>(
    fieldMap: Record<string, string | ((value: any) => any)>
) {
    return function transform(obj: any): T {
        if (!obj || typeof obj !== 'object') return obj;

        const result: Record<string, any> = {};

        for (const [key, value] of Object.entries(obj)) {
            const mapping = fieldMap[key];

            if (typeof mapping === 'function') {
                // Custom transform function
                const transformed = mapping(value);
                if (transformed !== undefined) {
                    Object.assign(result, transformed);
                }
            } else if (typeof mapping === 'string') {
                // Simple rename
                result[mapping] = value;
            } else {
                // No mapping, keep original (convert to camelCase by default)
                result[snakeToCamel(key)] = value;
            }
        }

        return result as T;
    };
}

/**
 * Compose multiple transformers together
 */
export function composeTransformers<T = any>(
    ...transformers: Array<(obj: any) => any>
): (obj: any) => T {
    return (obj: any) => {
        return transformers.reduce((acc, transform) => transform(acc), obj) as T;
    };
}

