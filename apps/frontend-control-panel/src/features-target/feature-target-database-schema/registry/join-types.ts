/**
 * database-schema/registry/join-types.ts
 * 
 * Join type definitions for resource relations
 */

export interface JoinType {
    value: string;
    label: string;
}

export const JOIN_TYPES: JoinType[] = [
    { value: 'LEFT', label: 'LEFT JOIN' },
    { value: 'INNER', label: 'INNER JOIN' },
];

export type JoinTypeValue = typeof JOIN_TYPES[number]['value'];
