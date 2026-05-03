
import { connect } from '@tidbcloud/serverless';

const databaseUrl = 'mysql://4JnU6pSVxwRM5LU.root:nde9tTv5hnlcYT6n@gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/test';
const httpUrl = databaseUrl.replace('mysql://', 'https://').replace(':4000', '');
const db = connect({ url: httpUrl });

async function check() {
    try {
        console.log('Checking target_systems table...');
        try {
            const res = await db.execute('DESCRIBE target_systems');
            console.log('Table structure:', JSON.stringify(res, null, 2));
        } catch (e) {
            console.log('Table target_systems might not exist.');
        }

        const rows = await db.execute('SELECT * FROM target_systems');
        console.log('Current systems:', JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
}

check();
