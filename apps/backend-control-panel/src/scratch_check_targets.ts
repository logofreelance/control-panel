import { connect } from '@tidbcloud/serverless';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const url = process.env.DATABASE_URL_INTERNAL_CONTROL_PANEL;
if (!url) {
  console.error('DATABASE_URL_INTERNAL_CONTROL_PANEL is missing');
  process.exit(1);
}

const httpUrl = url.replace('mysql://', 'https://').replace(':4000', '');
const db = connect({ url: httpUrl });

async function check() {
  try {
    const res = await db.execute('SELECT id, name, database_url FROM target_systems');
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
  }
}

check();
