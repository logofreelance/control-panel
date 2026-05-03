
async function testPut() {
    const sessionId = "2472kwafkx3l34h6kavzqd7y47ykg45p3iy22x4v";
    const url = 'http://localhost:3001/api/settings';
    
    console.log(`Testing PUT to ${url}...`);
    try {
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `auth_session=${sessionId}`
            },
            body: JSON.stringify({
                siteName: "Backend Engine Test",
                siteTitle: "Master Control Panel",
                metaDescription: "Professional Management Interface",
                primaryColor: "#ff0000",
                themePreset: "default",
                faviconUrl: "https://nextjs.org/favicon.ico"
            })
        });
        
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Fetch Error:', err);
    }
}

testPut();
