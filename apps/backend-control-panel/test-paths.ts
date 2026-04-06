
import { config } from 'dotenv';
import * as path from 'path';

console.log('--- ENV PATH TEST ---');
console.log('CWD:', process.cwd());
console.log('__dirname:', __dirname);

const path1 = path.join(__dirname, '../.env');
console.log('Testing Path 1:', path1);
const res1 = config({ path: path1 });
console.log('Res 1 Error:', res1.error?.message || 'None');
console.log('Res 1 Value:', process.env.DATABASE_URL_INTERNAL_CONTROL_PANEL ? 'FOUND' : 'MISSING');

const path2 = path.resolve(process.cwd(), 'control-panel/apps/backend-control-panel/.env');
console.log('Testing Path 2:', path2);
const res2 = config({ path: path2 });
console.log('Res 2 Error:', res2.error?.message || 'None');
console.log('Res 2 Value:', process.env.DATABASE_URL_INTERNAL_CONTROL_PANEL ? 'FOUND' : 'MISSING');

console.log('--- END TEST ---');
