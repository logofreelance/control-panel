/**
 * data-sources/registry/aggregate-functions.ts
 * 
 * Aggregate function definitions for resource aggregates
 */

export interface AggregateFunction {
    value: string;
    label: string;
}

export const AGGREGATE_FUNCTIONS: AggregateFunction[] = [
    { value: 'COUNT', label: 'COUNT' },
    { value: 'SUM', label: 'SUM' },
    { value: 'AVG', label: 'AVG' },
    { value: 'MIN', label: 'MIN' },
    { value: 'MAX', label: 'MAX' },
];

export type AggregateFunctionValue = typeof AGGREGATE_FUNCTIONS[number]['value'];
