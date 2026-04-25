import { connect } from '@tidbcloud/serverless';
import { randomUUID } from 'node:crypto';

const url = "mysql://2aKA11TTHcSG7kF.root:YneVAAeS1k5eSoKO@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test";
const httpUrl = url.replace('mysql://', 'https://').replace(':4000', '');
const db = connect({ url: httpUrl });

async function testMetadata() {
  const id = randomUUID();
  const data = {
    id,
    name: 'Test Name',
    tableName: 'test_table_meta',
    description: 'Test Description',
    categoryId: null,
    schemaJson: JSON.stringify({ columns: [] })
  };

  try {
    console.log('Testing metadata insertion...');
    await db.execute(
      `INSERT INTO database_tables (id, name, table_name, description, category_id, schema_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.id, data.name, data.tableName, data.description, data.categoryId, data.schemaJson]
    );
    console.log('Success!');
    
    // Cleanup
    await db.execute('DELETE FROM database_tables WHERE id = ?', [id]);
    console.log('Cleanup success!');
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testMetadata();
