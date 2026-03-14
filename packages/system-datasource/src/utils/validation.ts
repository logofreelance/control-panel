import { VALIDATION_TYPES, COLUMN_TYPES } from '../config/types';
import { CHARS, SECURITY_LIMITS, COLUMN_TYPE_KEYS } from '../config/constants';
import { LABELS } from '../config/labels';
import {
    ColumnDefinition,
    ValidationRule,
    RESERVED_PREFIXES,
    USER_TABLE_PREFIX,
    isReservedWord,
} from '../types';

const MSG = LABELS;

const VALIDATION_FORMATS: Record<string, RegExp> = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    url: /^https?:\/\/.+/,
    phone: /^[+]?[\d\s()-]+$/,
    slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
};

export function sanitizeTableName(name: string): { valid: boolean; sanitized: string; error?: string } {
    const clean = name.toLowerCase().replace(/[^a-z0-9_]/g, CHARS.EMPTY);

    if (clean.length === 0) return { valid: false, sanitized: CHARS.EMPTY, error: MSG.VALIDATION.TABLE_NAME_REQUIRED };
    if (clean.length > SECURITY_LIMITS.MAX_IDENTIFIER_LENGTH) return { valid: false, sanitized: CHARS.EMPTY, error: MSG.VALIDATION.INVALID_TABLE_NAME };

    for (const prefix of RESERVED_PREFIXES) {
        if (clean.startsWith(prefix)) return { valid: false, sanitized: CHARS.EMPTY, error: MSG.VALIDATION.INVALID_TABLE_NAME };
    }

    const prefixed = clean.startsWith(USER_TABLE_PREFIX) ? clean : `${USER_TABLE_PREFIX}${clean}`;
    return { valid: true, sanitized: prefixed };
}

export function validateColumnName(name: string): { valid: boolean; error?: string } {
    if (!name || name.length === 0) return { valid: false, error: MSG.VALIDATION.COLUMN_NAME_REQUIRED };
    if (name.length > SECURITY_LIMITS.MAX_IDENTIFIER_LENGTH) return { valid: false, error: MSG.VALIDATION.INVALID_COLUMN_NAME };
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) return { valid: false, error: MSG.VALIDATION.INVALID_COLUMN_NAME };
    if (isReservedWord(name)) return { valid: false, error: MSG.VALIDATION.INVALID_COLUMN_NAME }; // Simplified
    return { valid: true };
}

export function validateColumnType(type: string): { valid: boolean; error?: string } {
    if (!(type in COLUMN_TYPES)) return { valid: false, error: MSG.VALIDATION.COLUMN_TYPE_REQUIRED };
    return { valid: true };
}

export function validateColumnDefinition(column: ColumnDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const nameResult = validateColumnName(column.name);
    if (!nameResult.valid) errors.push(nameResult.error!);

    const typeResult = validateColumnType(column.type);
    if (!typeResult.valid) errors.push(typeResult.error!);

    // The instruction snippet seems to be replacing the typeInfo block with new logic.
    // Assuming 'col' in the instruction refers to 'column'.
    if (column.type === COLUMN_TYPE_KEYS.ENUM || column.type === COLUMN_TYPE_KEYS.STATUS) {
        if (!column.values || column.values.length === 0) {
            errors.push(MSG.VALIDATION.COLUMN_VALUES_REQUIRED);
        }
    }

    if (column.type === COLUMN_TYPE_KEYS.RELATION) {
        if (!column.target) {
            errors.push(MSG.VALIDATION.COLUMN_TARGET_REQUIRED);
        }
    }
    return { valid: errors.length === 0, errors };
}

export function validateSchema(columns: ColumnDefinition[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const columnNames = new Set<string>();
    let hasPrimaryKey = false;

    if (!columns || columns.length === 0) {
        errors.push(MSG.VALIDATION.MIN_ONE_COLUMN);
        return { valid: false, errors };
    }

    for (const column of columns) {
        if (columnNames.has(column.name.toLowerCase())) {
            errors.push(MSG.VALIDATION.DUPLICATE_COLUMN_NAMES);
        }
        columnNames.add(column.name.toLowerCase());

        const colResult = validateColumnDefinition(column);
        if (!colResult.valid) errors.push(...colResult.errors.map(e => `Column "${column.name}": ${e}`));

        const typeInfo = COLUMN_TYPES[column.type as keyof typeof COLUMN_TYPES];
        if (typeInfo?.isPrimaryKey) {
            if (hasPrimaryKey) errors.push(MSG.VALIDATION.INVALID_SCHEMA); // Simplified generic error
            hasPrimaryKey = true;
        }
    }
    return { valid: errors.length === 0, errors };
}

export function validateValue(value: unknown, rules: ValidationRule[]): { valid: boolean; error?: string } {
    for (const rule of rules) {
        switch (rule.type) {
            case VALIDATION_TYPES.REQUIRED:
                if (value === null || value === undefined || value === CHARS.EMPTY) return { valid: false, error: rule.message || MSG.VALIDATION.FIELDS_REQUIRED }; // Check this
                break;
            case VALIDATION_TYPES.MIN:
                // Simplified generic keys for min/max/length
                if (typeof value === 'number' && value < (rule.value as number)) return { valid: false, error: rule.message || MSG.VALIDATION.INVALID_SCHEMA };
                break;
            case VALIDATION_TYPES.MAX:
                if (typeof value === 'number' && value > (rule.value as number)) return { valid: false, error: rule.message || MSG.VALIDATION.INVALID_SCHEMA };
                break;
            case VALIDATION_TYPES.MIN_LENGTH:
                if (typeof value === 'string' && value.length < (rule.value as number)) return { valid: false, error: rule.message || MSG.VALIDATION.INVALID_SCHEMA };
                break;
            case VALIDATION_TYPES.MAX_LENGTH:
                if (typeof value === 'string' && value.length > (rule.value as number)) return { valid: false, error: rule.message || MSG.VALIDATION.INVALID_SCHEMA };
                break;
            case VALIDATION_TYPES.PATTERN:
                if (typeof value === 'string' && !new RegExp(rule.value as string).test(value)) return { valid: false, error: rule.message || MSG.VALIDATION.INVALID_SCHEMA };
                break;
            case VALIDATION_TYPES.FORMAT: {
                const formatRegex = VALIDATION_FORMATS[rule.value as string];
                if (formatRegex && typeof value === 'string' && !formatRegex.test(value)) return { valid: false, error: rule.message || MSG.VALIDATION.INVALID_SCHEMA };
                break;
            }
            case VALIDATION_TYPES.IN:
                if (Array.isArray(rule.value) && !rule.value.includes(value)) return { valid: false, error: rule.message || MSG.VALIDATION.INVALID_SCHEMA };
                break;
        }
    }
    return { valid: true };
}

export function validateRow(data: Record<string, unknown>, columns: ColumnDefinition[], validationRules?: Record<string, ValidationRule[]>): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    for (const column of columns) {
        const value = data[column.name];
        const rules = validationRules?.[column.name] || [];

        if (column.required) rules.unshift({ type: VALIDATION_TYPES.REQUIRED });

        const typeInfo = COLUMN_TYPES[column.type as keyof typeof COLUMN_TYPES];
        if (typeInfo?.validation) {
            if (typeInfo.validation.maxLength) rules.push({ type: VALIDATION_TYPES.MAX_LENGTH, value: typeInfo.validation.maxLength });
            if (typeInfo.validation.format) rules.push({ type: VALIDATION_TYPES.FORMAT, value: typeInfo.validation.format });
            if (typeInfo.validation.pattern) rules.push({ type: VALIDATION_TYPES.PATTERN, value: typeInfo.validation.pattern });
        }

        const result = validateValue(value, rules);
        if (!result.valid) errors[column.name] = result.error!;
    }
    return { valid: Object.keys(errors).length === 0, errors };
}

export function generateValidationRules(column: ColumnDefinition): ValidationRule[] {
    const rules: ValidationRule[] = [];
    if (column.required) rules.push({ type: VALIDATION_TYPES.REQUIRED });

    const typeInfo = COLUMN_TYPES[column.type as keyof typeof COLUMN_TYPES];
    if (typeInfo?.validation) {
        if (typeInfo.validation.maxLength) rules.push({ type: VALIDATION_TYPES.MAX_LENGTH, value: column.length || typeInfo.validation.maxLength });
        if (typeInfo.validation.min !== undefined) rules.push({ type: VALIDATION_TYPES.MIN, value: typeInfo.validation.min });
        if (typeInfo.validation.max !== undefined) rules.push({ type: VALIDATION_TYPES.MAX, value: typeInfo.validation.max });
        if (typeInfo.validation.format) rules.push({ type: VALIDATION_TYPES.FORMAT, value: typeInfo.validation.format });
        if (typeInfo.validation.pattern) rules.push({ type: VALIDATION_TYPES.PATTERN, value: typeInfo.validation.pattern });
    }
    if (column.values && column.values.length > 0) rules.push({ type: VALIDATION_TYPES.IN, value: column.values });

    return rules;
}
