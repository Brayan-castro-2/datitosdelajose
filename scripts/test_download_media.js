const https = require('https');
const fs = require('fs');
const path = require('path');

function downloadMedia(shortCode) {
  return new Promise((resolve) => {
    const url = `https://www.instagram.com/p/${shortCode}/media/?size=l`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode === 302 && res.headers.location) {
        const dest = path.join(__dirname, '..', 'thumbs', `test_${shortCode}.jpg`);
        const file = fs.createWriteStream(dest);
        https.get(res.headers.location, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (imgRes) => {
          if (imgRes.statusCode === 200) {
            imgRes.pipe(file);
            file.on('finish', () => {
              file.close();
              const stat = fs.statSync(dest);
              console.log(`Success! Saved test_${shortCode}.jpg, size: ${stat.size} bytes`);
              resolve(true);
            });
          } else {
            console.log(`Image res status: ${imgRes.statusCode}`);
            file.close();
            if (fs.existsSync(dest)) fs.unlinkSync(dest);
            resolve(false);
          }
        }).on('error', (e) => {
          console.error('Error fetching image:', e.message);
          resolve(false);
        });
      } else {
        console.log(`Initial res status: ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', (e) => {
      console.error('Initial error:', e.message);
      resolve(false);
    });
  });
}

downloadMedia('DdPtGFQg88W');
