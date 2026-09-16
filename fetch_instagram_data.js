const https = require('https');
const http = require('http');
const fs = require('fs');

const urls = [
  "https://www.instagram.com/reel/DVPWP04j4aq/",
  "https://www.instagram.com/p/DUXC2OggLTC/",
  "https://www.instagram.com/reel/DURRUl4j00E/",
  "https://www.instagram.com/p/DRieRJpD8ga/",
  "https://www.instagram.com/reel/DMgjOk3PULT/",
  "https://www.instagram.com/p/DMO2XZqgAv7/",
  "https://www.instagram.com/reel/DI2AjSZPe8b/",
  "https://www.instagram.com/p/DIxasMLAr4W/",
  "https://www.instagram.com/reel/DIg8vHpA9A0/",
  "https://www.instagram.com/reel/DIF0YQjgzZ6/",
  "https://www.instagram.com/reel/DHrIE4RPTD0/",
  "https://www.instagram.com/reel/DHZhDAzPzWl/",
  "https://www.instagram.com/reel/DHT3z_KvxTF/",
  "https://www.instagram.com/reel/DHJdBAcgxXF/",
  "https://www.instagram.com/reel/DBmZzFGyEn1/",
  "https://www.instagram.com/reel/C-wDBXtu6Us/",
  "https://www.instagram.com/reel/C8viWkou1y6/",
  "https://www.instagram.com/reel/C8dC4gFOpV2/",
  "https://www.instagram.com/reel/C67cjTcujYF/",
  "https://www.instagram.com/reel/C5xFK0sOYLn/",
  "https://www.instagram.com/reel/C3oOZL5OXWS/",
  "https://www.instagram.com/reel/C2D-y1_OH3Z/"
];

function fetchMeta(url, redirectCount = 0) {
  return new Promise((resolve) => {
    if (redirectCount > 3) {
      return resolve({ url, error: 'Too many redirects' });
    }
    const parsed = new URL(url);
    const client = parsed.protocol === 'http:' ? http : https;
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 5000
    };

    const req = client.get(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let loc = res.headers.location;
        if (!loc.startsWith('http')) {
          loc = new URL(loc, url).href;
        }
        return resolve(fetchMeta(loc, redirectCount + 1));
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const descMatch = data.match(/<meta\s+(?:name|property)="description"\s+content="([^"]*)"/i) ||
                          data.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i);
        const titleMatch = data.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i);
        const imgMatch = data.match(/<meta\s+property="og:image"\s+content="([^"]*)"/i);

        const shortcodeMatch = url.match(/\/(?:reel|p)\/([^\/?#]+)/);
        const shortcode = shortcodeMatch ? shortcodeMatch[1] : '';

        resolve({
          url,
          shortcode,
          title: titleMatch ? decodeEntities(titleMatch[1]) : '',
          description: descMatch ? decodeEntities(descMatch[1]) : '',
          image: imgMatch ? decodeEntities(imgMatch[1]) : ''
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ url, error: 'Timeout' });
    });

    req.on('error', (err) => {
      resolve({ url, error: err.message });
    });
  });
}

function decodeEntities(encodedString) {
  return encodedString
    .replace(/&#x26;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&#x3c;/g, '<')
    .replace(/&#x3e;/g, '>')
    .replace(/&#x22;/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#064;/g, '@')
    .replace(/&#x([0-9a-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
}

async function run() {
  console.log('Fetching all ' + urls.length + ' urls in parallel batches...');
  const results = [];
  // 5 at a time
  for (let i = 0; i < urls.length; i += 5) {
    const chunk = urls.slice(i, i + 5);
    const chunkResults = await Promise.all(chunk.map(u => fetchMeta(u)));
    results.push(...chunkResults);
    console.log(`Processed ${results.length}/${urls.length}`);
  }
  fs.writeFileSync('instagram_extracted.json', JSON.stringify(results, null, 2), 'utf-8');
  console.log('Done! All saved to instagram_extracted.json');
}

run();
