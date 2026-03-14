
import { AppDeployConfig } from '@modular/contracts';

/**
 * Deployment Configuration for Backend Orange
 * Values here are generic and neutral.
 */
export const config: AppDeployConfig = {
    name: 'backend-orange-v1',
    entry: 'src/main.ts',
    compatibility_date: '2024-04-01',
    env: {
        source: '@modular/core-env',
        required_keys: [
            'DATABASE_URL',
            'JWT_SECRET',
            'CORS_ORIGIN',
            'ORANGE_PORT'
        ]
    },
    resources: {
        memory: '128mb'
    }
};
