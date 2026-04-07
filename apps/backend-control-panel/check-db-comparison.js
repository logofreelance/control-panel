const { connect } = require('@tidbcloud/serverless');

async function run() {
    try {
        console.log('Connecting to Internal Database...');
        // Internal DB URL for Control Panel
        const internalDbUrl = 'https://4JnU6pSVxwRM5LU.root:nde9tTv5hnlcYT6n@gateway01.ap-northeast-1.prod.aws.tidbcloud.com/test';
        const internalConn = connect({ url: internalDbUrl });
        
        // 1. Ambil data dari tabel target_systems (Internal DB)
        const targetRes = await internalConn.execute('SELECT id, name, database_url, api_endpoint FROM target_systems LIMIT 1');
        const rows = Array.isArray(targetRes) ? targetRes : (targetRes.rows || []);
        
        if (rows.length === 0) {
            console.log('No Target System found.');
            return;
        }
        
        const target = rows[0];
        console.log('\n=== DATA DARI INTERNAL DB (target_systems) ===');
        console.log('Target Name:       ', target.name);
        console.log('ID:                ', target.id);
        console.log('API_ENDPOINT Column:', target.api_endpoint || '(Masih Kosong atau Belum Sinkron)');
        console.log('----------------------------------------------');
        
        console.log('\nConnecting to Target Database (milik tenant)...');
        // Ubah mysql:// ke https:// untuk HTTP driver
        const targetDbUrlHttp = target.database_url.replace('mysql://', 'https://').replace(':4000/test', '/test');
        const targetConn = connect({ url: targetDbUrlHttp });
        
        // 2. Ambil data dari tabel node_health_metrics (Target DB)
        try {
            const healthRes = await targetConn.execute('SELECT node_id, endpoint_url, last_heartbeat FROM node_health_metrics');
            const healthRows = Array.isArray(healthRes) ? healthRes : (healthRes.rows || []);
            
            console.log('\n=== DATA DARI TARGET DB (node_health_metrics) ===');
            if (healthRows.length === 0) {
                console.log('Tabel kosong. Belum ada Backend System yang melapor.');
            } else {
                healthRows.forEach((r, i) => {
                    console.log(`Node ${i+1}: ${r.endpoint_url} | Last Heartbeat: ${r.last_heartbeat}`);
                });
            }
            console.log('--------------------------------------------------\n');
        } catch (err) {
            console.log('\n[ERROR] Gagal membaca node_health_metrics di Target DB:', err.message);
        }
        
    } catch (e) {
        console.error('Error Umum:', e.message);
    }
}
run();
