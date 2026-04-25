import { connect } from '@tidbcloud/serverless';

const url = "mysql://2aKA11TTHcSG7kF.root:YneVAAeS1k5eSoKO@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test";
const httpUrl = url.replace('mysql://', 'https://').replace(':4000', '');
const db = connect({ url: httpUrl });

async function check() {
  const id = 'a1d9a604-53ef-47f2-a880-c24780908a14';
  try {
    const res = await db.execute(`SELECT * FROM database_tables WHERE id = ?`, [id]);
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error(err);
  }
}

check();
