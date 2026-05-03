
import { connect } from '@tidbcloud/serverless';

const databaseUrl = 'mysql://4JnU6pSVxwRM5LU.root:nde9tTv5hnlcYT6n@gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/test';
const httpUrl = databaseUrl.replace('mysql://', 'https://').replace(':4000', '');
const db = connect({ url: httpUrl });

async function check() {
    try {
        console.log('Checking panel_settings table...');
        const res = await db.execute('DESCRIBE panel_settings');
        console.log('Table structure:', JSON.stringify(res, null, 2));

        const rows = await db.execute('SELECT * FROM panel_settings');
        console.log('Current settings:', JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
}

check();
