
import { connect } from '@tidbcloud/serverless';

const databaseUrl = 'mysql://4JnU6pSVxwRM5LU.root:nde9tTv5hnlcYT6n@gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/test';
const httpUrl = databaseUrl.replace('mysql://', 'https://').replace(':4000', '');
const db = connect({ url: httpUrl });

async function check() {
    try {
        console.log('Checking admin_sessions...');
        const res = await db.execute('SELECT * FROM admin_sessions LIMIT 1');
        console.log('Session:', JSON.stringify(res, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
}

check();
