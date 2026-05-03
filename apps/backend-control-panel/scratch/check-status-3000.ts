
async function checkStatus() {
    const url = 'http://localhost:3000/api/system-status';
    console.log(`Checking status at ${url}...`);
    try {
        const res = await fetch(url);
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Fetch Error:', err);
    }
}

checkStatus();
