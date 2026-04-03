/**
 * database-schema/registry/relation-types.ts
 * 
 * Relation type definitions for relation builder
 */

export interface RelationType {
    value: string;
    label: string;
    icon: string;
    desc: string;
}

export const RELATION_TYPES: RelationType[] = [
    { value: 'belongs_to', label: 'Belongs To', icon: '←', desc: 'This table belongs to another' },
    { value: 'has_one', label: 'Has One', icon: '→', desc: 'Has one record in another table' },
    { value: 'has_many', label: 'Has Many', icon: '→→', desc: 'Has many records in another table' },
    { value: 'many_to_many', label: 'Many to Many', icon: '↔', desc: 'Many-to-many via pivot table' },
];

export type RelationTypeValue = typeof RELATION_TYPES[number]['value'];
