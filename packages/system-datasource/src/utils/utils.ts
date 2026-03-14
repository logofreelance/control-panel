
import { STRING_PATTERNS } from '../config/constants';

export function singularize(word: string): string {
    if (word.endsWith(STRING_PATTERNS.SUFFIX_IES)) return word.slice(0, -3) + STRING_PATTERNS.SUFFIX_Y;
    if (word.endsWith(STRING_PATTERNS.SUFFIX_ES)) return word.slice(0, -2);
    if (word.endsWith(STRING_PATTERNS.SUFFIX_S) && !word.endsWith(STRING_PATTERNS.SUFFIX_SS)) return word.slice(0, -1);
    return word;
}

export function generateFKName(targetTable: string): string {
    return `${STRING_PATTERNS.FK_PREFIX}${targetTable}_${Date.now().toString().slice(-4)}`;
}

export function generatePivotName(table1: string, table2: string): string {
    const tables = [table1, table2].sort();
    return `${tables[0]}_${tables[1]}`;
}
