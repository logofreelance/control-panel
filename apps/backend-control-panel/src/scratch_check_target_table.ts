import { connect } from '@tidbcloud/serverless';

const url = "mysql://2aKA11TTHcSG7kF.root:YneVAAeS1k5eSoKO@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test";
const httpUrl = url.replace('mysql://', 'https://').replace(':4000', '');
const db = connect({ url: httpUrl });

async function check() {
  try {
    console.log('Checking database_categories...');
    const res = await db.execute("DESCRIBE database_categories");
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Error describing database_categories:', err);
  }
}

check();
