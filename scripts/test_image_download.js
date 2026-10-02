const https = require('https');
const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('dataset_instagram-scraper_2026-09-17_20-51-56-540.json', 'utf8'));

// Test first 5 posts
const testPosts = raw.slice(0, 5);

async function testFetch(url) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://www.instagram.com/'
      }
    };
    https.get(options, (res) => {
      resolve({ statusCode: res.statusCode, length: res.headers['content-length'] });
    }).on('error', (err) => {
      resolve({ error: err.message });
    });
  });
}

(async () => {
  for (const p of testPosts) {
    console.log('Testing shortCode:', p.shortCode);
    const res = await testFetch(p.displayUrl);
    console.log('  displayUrl result:', res);
  }
})();
