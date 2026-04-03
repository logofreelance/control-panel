/**
 * @repo/contracts - IEnvDriver
 * 
 * Interface untuk ENV Driver (adapter/colokan)
 * Driver menyesuaikan format dari berbagai sumber ENV ke format standar.
 * 
 * Contoh implementasi:
 * - CloudflareDriver: membaca dari c.env
 * - NodeDriver: membaca dari process.env
 * - GithubDriver: membaca dari GitHub Secrets API
 */

export interface IEnvDriver {
    /** Nama driver untuk logging/debug */
    readonly name: string;

    /** Priority (semakin kecil = semakin diprioritaskan) */
    readonly priority: number;

    /** Get value by key */
    get(key: string, context?: any): string | undefined;

    /** Check if key exists */
    has(key: string, context?: any): boolean;
}
