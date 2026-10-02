const https = require('https');
https.get('https://www.instagram.com/p/DdPtGFQg88W/embed/', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const unescaped = data.replace(/\\u0026/g, '&').replace(/\\/g, '');
    const m = unescaped.match(/(https:\/\/[^"'\s]+\.mp4\?[^"'\s]+)/);
    if (m) {
      console.log('Found full mp4 url:', m[1]);
      https.get(m[1], (vRes) => {
        console.log('Video fetch status:', vRes.statusCode, 'content-type:', vRes.headers['content-type'], 'content-length:', vRes.headers['content-length']);
      });
    } else {
      console.log('No full match found');
    }
  });
});
