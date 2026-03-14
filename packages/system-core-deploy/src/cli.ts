#!/usr/bin/env node

import { Command } from 'commander';
import { DeployCore } from './index.js';
import chalk from 'chalk';

const program = new Command();

program
    .name('modulardeploy')
    .description('Centralized Deployment Tool for ModularEngine')
    .version('1.0.0')
    .requiredOption('-t, --target <target>', 'Deployment target (cloudflare, vercel)')
    .option('-d, --dir <directory>', 'Working directory', '.')
    .action(async (options) => {
        try {
            const core = new DeployCore(options.dir);
            await core.deploy(options.target);
        } catch (error: any) {
            console.error(chalk.red('\nDeployment failed:'));
            console.error(error.message || error);
            process.exit(1);
        }
    });

program.parse();
