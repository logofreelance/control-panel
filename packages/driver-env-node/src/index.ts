
import { IEnvDriver } from '@modular/contracts';

/**
 * Node ENV Driver
 * Membaca dari process.env standar Node.js
 */
export class NodeEnvDriver implements IEnvDriver {
    readonly name = 'node-env';
    readonly priority = 10; // Low priority (fallback)

    get(key: string, context?: any): string | undefined {
        return process.env[key];
    }

    has(key: string, context?: any): boolean {
        return process.env[key] !== undefined;
    }
}

