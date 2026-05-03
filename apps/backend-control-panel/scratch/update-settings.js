
async function updateSettings() {
    const res = await fetch('http://localhost:3001/api/settings', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': 'auth_session=le3wrgxcjaw67cf4smeln5y54hhc72oqkurfpkap'
        },
        body: JSON.stringify({
            siteName: "Backend Engine",
            siteTitle: "Master Control Panel",
            metaDescription: "Professional Management Interface",
            primaryColor: "oklch(0.556 0.22 27.325)",
            themePreset: "simetri",
            faviconUrl: "https://nextjs.org/favicon.ico"
        })
    });
    console.log(await res.json());
}
updateSettings().catch(console.error);
