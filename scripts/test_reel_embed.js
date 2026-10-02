const https = require('https');
const url = 'https://www.instagram.com/reel/DBq3D-Uu6V4/embed/';

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)' } }, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Contains video?', d.includes('<video') || d.includes('video_url'));
    console.log('Contains mp4?', d.includes('.mp4'));
    const matches = d.match(/https:\/\/[^"']+\.mp4[^"']*/g);
    if (matches) {
      console.log('Found ' + matches.length + ' mp4 URLs!');
      console.log('Sample:', matches[0].substring(0, 120));
    } else {
      console.log('No direct mp4 found in embed HTML');
    }
  });
});
