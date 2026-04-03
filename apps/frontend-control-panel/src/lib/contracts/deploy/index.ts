
/**
 * Interface untuk Deployment Driver
 * (Adapter untuk Cloudflare, Vercel, Docker, dll)
 */
export interface IDeployDriver {
    readonly name: string;

    /**
     * Generate platform specific config (wrangler.toml, vercel.json, Dockerfile)
     */
    generateConfig(appConfig: AppDeployConfig): Promise<string>;

    /**
     * Execute deployment
     */
    deploy(appConfig: AppDeployConfig): Promise<void>;
}

/**
 * Generic Application Deployment Configuration
 * Config ini NETRAL, tidak terikat platform tertentu.
 */
export interface AppDeployConfig {
    /** Nama aplikasi (misal: backend-orange) */
    name: string;

    /** Entry point (misal: src/index.ts) */
    entry: string;

    /** Environment Variables Config */
    env: {
        /**
         * Source ENV dari system-core-env
         * Driver akan membaca ini untuk inject ke platform target
         */
        source: '@repo/system-core-env';

        /** 
         * Keys yang WAJIB ada saat deploy
         * Driver akan error jika key ini tidak ditemukan di ENV source
         */
        required_keys: string[];
    };

    /** Resource limits (generic) */
    resources?: {
        memory?: string; // '128mb', '512mb'
        cpu?: string;    // '0.5', '1'
    };

    /** Compatibility dates (penting untuk Cloudflare) */
    compatibility_date?: string;
}
