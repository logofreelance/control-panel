

import path from 'path';
import fs from 'fs';
import { AppDeployConfig, IDeployDriver } from './types';
import chalk from 'chalk';

// Akan di-expand saat kita buat driver package
const DRIVERS: Record<string, string> = {
    'cloudflare': '@cp/driver-deploy-cf',
    'vercel': '@cp/driver-deploy-vercel',
};

export class DeployCore {
    private config: AppDeployConfig | null = null;
    private driver: IDeployDriver | null = null;

    constructor(private cwd: string = process.cwd()) { }

    /**
     * Load deploy.config.ts dari app directory
     */
    async loadConfig(): Promise<void> {
        const configPath = path.join(this.cwd, 'deploy.config.ts');

        if (!fs.existsSync(configPath)) {
            throw new Error(`Config file not found: ${configPath}`);
        }

        console.log(chalk.blue(`Loading config from ${configPath}...`));

        try {
            // Dynamic import config file
            // Note: In real ts-node env this works, in compiled helper might need updates
            const loaded = await import(configPath);
            this.config = loaded.config || loaded.default;

            if (!this.config) {
                throw new Error('Config file must export "config" or default object');
            }

            console.log(chalk.green(`Config loaded: ${this.config?.name}`));
        } catch (error) {
            console.error(chalk.red('Failed to load config:'), error);
            throw error;
        }
    }

    /**
     * Load driver berdasarkan target
     */
    async loadDriver(target: string): Promise<void> {
        const packageName = DRIVERS[target];
        if (!packageName) {
            throw new Error(`Unknown target: ${target}. Available: ${Object.keys(DRIVERS).join(', ')}`);
        }

        try {
            console.log(chalk.blue(`Loading driver ${packageName}...`));
            const driverModule = await import(packageName);
            const DriverClass = driverModule.default || driverModule.Driver;

            if (!DriverClass) {
                throw new Error(`Driver package ${packageName} does not export default class`);
            }

            this.driver = new DriverClass();
            console.log(chalk.green(`Driver loaded: ${this.driver?.name}`));
        } catch (error) {
            console.error(chalk.red(`Failed to load driver ${target}:`), error);
            throw error;
        }
    }

    /**
     * Run deployment
     */
    async deploy(target: string): Promise<void> {
        await this.loadConfig();
        await this.loadDriver(target);

        if (!this.config || !this.driver) {
            throw new Error('Initialization failed');
        }

        console.log(chalk.yellow(`\nStarting deployment for ${this.config.name} to ${target}...`));

        // 1. Validate ENV
        // TODO: Integrate with system-core-env to validate keys

        // 2. Generate Platform Config
        await this.driver.generateConfig(this.config);
        console.log(chalk.gray('Generated platform config'));

        // 3. Execute Deploy
        await this.driver.deploy(this.config);

        console.log(chalk.greenBright(`\n✅ Deployment successful!`));
    }
}
