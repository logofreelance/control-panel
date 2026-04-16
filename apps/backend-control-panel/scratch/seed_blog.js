/**
 * scratch/seed_blog.js
 * Manual seeder using fetch
 */
const SEED_URL = 'http://localhost:3001/api/database-schema/d3d2077a-f74e-4a74-9e6d-6f3f3eeacb3e/data';
const TARGET_ID = '2dca61d1-bb91-4867-8d8f-616471fd1d42';

const dummyPosts = [
    { title: 'Memulai Belajar Web Development', content: 'Panduan lengkap belajar HTML, CSS, dan JS untuk pemula.', slug: 'belajar-web', status: 'published' },
    { title: 'Trend UI/UX 2025', content: 'Eksplorasi desain Flat Luxury dan Glassmorphism di era modern.', slug: 'trend-uiux-2025', status: 'draft' },
    { title: 'Optimasi Backend dengan Next.js', content: 'Tips meningkatkan performa API menggunakan Server Actions.', slug: 'optimasi-backend', status: 'published' },
    { title: 'Kecerdasan Buatan di Tahun 2025', content: 'Bagaimana AI mengubah cara kita menulis kode setiap hari.', slug: 'ai-2025', status: 'published' },
    { title: 'Tips Menjaga Keamanan Database', content: 'Pentingnya enkripsi dan manajemen akses pada database target.', slug: 'keamanan-db', status: 'archived' }
];

async function seed() {
    console.log('Starting seed...');
    for (const post of dummyPosts) {
        try {
            const res = await fetch(SEED_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-target-id': TARGET_ID
                },
                body: JSON.stringify(post)
            });
            const json = await res.json();
            console.log(`Inserted: ${post.title} - Status: ${res.status}`, json);
        } catch (e) {
            console.error(`Failed to insert ${post.title}:`, e.message);
        }
    }
    console.log('Seed finished!');
}

seed();
