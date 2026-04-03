/**
 * database-schema/registry/filter-operators.ts
 * 
 * Filter operator definitions for resource filters
 */

export interface FilterOperator {
    value: string;
    label: string;
    requiresValue?: boolean;
}

export const FILTER_OPERATORS: FilterOperator[] = [
    { value: 'eq', label: 'Equals (=)', requiresValue: true },
    { value: 'neq', label: 'Not Equal (!=)', requiresValue: true },
    { value: 'gt', label: 'Greater (>)', requiresValue: true },
    { value: 'gte', label: 'Greater/Eq (>=)', requiresValue: true },
    { value: 'lt', label: 'Less (<)', requiresValue: true },
    { value: 'lte', label: 'Less/Eq (<=)', requiresValue: true },
    { value: 'like', label: 'Contains (LIKE)', requiresValue: true },
    { value: 'in', label: 'In List (IN)', requiresValue: true },
    { value: 'null', label: 'Is Null', requiresValue: false },
    { value: 'notNull', label: 'Is Not Null', requiresValue: false },
];

export type FilterOperatorValue = typeof FILTER_OPERATORS[number]['value'];
