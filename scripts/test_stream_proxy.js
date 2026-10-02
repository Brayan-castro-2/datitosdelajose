const https = require('https');

function getDirectVideoUrl(code) {
  return new Promise((resolve, reject) => {
    https.get(`https://www.instagram.com/p/${code}/embed/`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const unescaped = data.replace(/\\u0026/g, '&').replace(/\\/g, '');
        const m = unescaped.match(/(https:\/\/[^"'\s]+\.mp4\?[^"'\s]+)/);
        if (m) {
          resolve(m[1]);
        } else {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

getDirectVideoUrl('DdPtGFQg88W').then(url => {
  console.log('Got video url:', url ? url.substring(0, 80) + '...' : null);
}).catch(console.error);
