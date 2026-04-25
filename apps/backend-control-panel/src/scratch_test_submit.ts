import { connect } from '@tidbcloud/serverless';

const url = "mysql://2aKA11TTHcSG7kF.root:YneVAAeS1k5eSoKO@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test";
const httpUrl = url.replace('mysql://', 'https://').replace(':4000', '');
const db = connect({ url: httpUrl });

async function testSubmit() {
  const tableName = 'test_table_' + Date.now();
  const schema = {
    columns: [
      { name: 'title', type: 'string', required: true },
      { name: 'content', type: 'text' },
      { name: 'status', type: 'enum', allowedValues: 'draft, published' }
    ],
    timestamps: true,
    softDelete: true
  };

  try {
    console.log('Testing physical table creation for:', tableName);
    
    // Logic from model.ts
    let columnsSql = ['`id` INT AUTO_INCREMENT PRIMARY KEY'];
    for (const col of schema.columns) {
      // Simplification of mapTypeToSql
      let sqlType = col.type === 'string' ? 'VARCHAR(255)' : col.type === 'text' ? 'TEXT' : 'VARCHAR(50)';
      if (col.type === 'enum') sqlType = "ENUM('draft', 'published')";
      
      const nullable = col.required ? 'NOT NULL' : 'NULL';
      columnsSql.push(`\`${col.name}\` ${sqlType} ${nullable}`);
    }
    columnsSql.push('`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    columnsSql.push('`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    columnsSql.push('`deleted_at` TIMESTAMP NULL DEFAULT NULL');

    const sql = `CREATE TABLE \`${tableName}\` (\n  ${columnsSql.join(',\n  ')}\n)`;
    console.log('Executing SQL:\n', sql);
    await db.execute(sql);
    console.log('Success!');
    
    // Cleanup
    await db.execute(`DROP TABLE \`${tableName}\``);
    console.log('Cleanup success!');
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testSubmit();
