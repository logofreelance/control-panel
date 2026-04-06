
import { loadEnvironmentConfig } from './src/env';

try {
    const env = loadEnvironmentConfig({});
    console.log('INTERNAL DB URL:', env.DATABASE_URL_INTERNAL_CONTROL_PANEL ? 'PRESENT' : 'MISSING');
} catch (err: any) {
    console.error('FAILED TO LOAD ENV:', err.message);
}

console.log('ALL PROCESS ENV KEYS:', Object.keys(process.env).filter(k => k.includes('DATABASE_URL')));
