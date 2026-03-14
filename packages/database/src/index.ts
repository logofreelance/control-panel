import { drizzle } from 'drizzle-orm/tidb-serverless';
import { connect } from '@tidbcloud/serverless';
import * as schema from './schema';

export * from './schema';
export * from './repositories';
export * from 'drizzle-orm';

export const createDb = (url: string) => {
    // TiDB Cloud Serverless HTTP driver - compatible with Cloudflare Workers
    const client = connect({ url });
    return drizzle({ client, schema });
};

export type DbType = ReturnType<typeof createDb>;
