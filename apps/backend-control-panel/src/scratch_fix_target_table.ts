import { connect } from '@tidbcloud/serverless';

const url = "mysql://2aKA11TTHcSG7kF.root:YneVAAeS1k5eSoKO@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test";
const httpUrl = url.replace('mysql://', 'https://').replace(':4000', '');
const db = connect({ url: httpUrl });

async function fix() {
  try {
    console.log('Adding description column to database_categories...');
    await db.execute("ALTER TABLE database_categories ADD COLUMN description TEXT AFTER name");
    console.log('Success!');
    const res = await db.execute("DESCRIBE database_categories");
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Error adding column:', err);
  }
}

fix();
