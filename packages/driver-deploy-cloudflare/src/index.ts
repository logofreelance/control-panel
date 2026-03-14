
import { IDeployDriver, AppDeployConfig } from '@modular/contracts';
import { NodeEnvDriver } from '@modular/driver-env-node';
import fs from 'fs';
import path from 'path';
import { execa } from 'execa';

/**
 * Cloudflare Deployment Driver
 * Generates wrangler.toml and executes deployment
 */
export default class CloudflareDeployDriver implements IDeployDriver {
    readonly name = 'cloudflare';

    async generateConfig(config: AppDeployConfig): Promise<string> {
        // 1. Resolve Environment Variables
        // Read from local process.env (assuming we are running deploy from a defined env)
        const envVars: Record<string, string> = {};

        // Use NodeEnvDriver directly here to read current shell envs
        const nodeDriver = new NodeEnvDriver();

        if (config.env && config.env.required_keys) {
            for (const key of config.env.required_keys) {
                const val = nodeDriver.get(key);
                if (!val) {
                    console.warn(`Warning: Required ENV key '${key}' not found in current environment.`);
                } else {
                    envVars[key] = val;
                }
            }
        }

        // 2. Build wrangler.toml content
        // This is a basic generator. In real app, we might want more options in AppDeployConfig.
        const tomlContent = `
name = "${config.name}"
main = "${config.entry}"
compatibility_date = "${config.compatibility_date || '2024-01-01'}"

[vars]
${Object.entries(envVars).map(([k, v]) => `${k} = "${v}"`).join('\n')}

# Default Observability
[observability]
enabled = true
`;
        return tomlContent.trim();
    }

    async deploy(config: AppDeployConfig): Promise<void> {
        console.log(`[DRIVER-CLOUDFLARE] Generating wrangler.toml...`);
        const toml = await this.generateConfig(config);

        const tempTomlPath = path.resolve(process.cwd(), 'wrangler.gen.toml');
        fs.writeFileSync(tempTomlPath, toml);

        try {
            console.log(`[DRIVER-CLOUDFLARE] Executing wrangler deploy...`);
            // Run wrangler deploy using the generated config
            await execa('wrangler', ['deploy', '-c', 'wrangler.gen.toml', '--dry-run'], {
                stdio: 'inherit',
                preferLocal: true // Use local node_modules/.bin/wrangler
            });
            // Note: Added --dry-run for safety in this demo implementation

            console.log(`[DRIVER-CLOUDFLARE] Deploy command finished.`);
        } finally {
            // Cleanup
            if (fs.existsSync(tempTomlPath)) {
                fs.unlinkSync(tempTomlPath);
                console.log(`[DRIVER-CLOUDFLARE] Cleaned up temp config.`);
            }
        }
    }
}
