
import { apiClient } from './src/lib/api-client';

async function test() {
    try {
        const nodeId = '1'; // Replace with an actual nodeId if possible, but let's try 1
        const res = await apiClient.get('/api/database-schema', {
            headers: { 'x-target-id': nodeId }
        });
        console.log('Schemas:', JSON.stringify(res, null, 2));
    } catch (e) {
        console.error('Error:', e);
    }
}
// test();
