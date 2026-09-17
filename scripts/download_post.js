const https = require('https');
const fs = require('fs');

const url = 'https://www.instagram.com/p/DabbHtFj7tS/';

const req = https.get(url, {
  headers: {
    'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  }
}, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const imgMatch = data.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]*)"/i);
    const descMatch = data.match(/<meta\s+(?:property|name)="description"\s+content="([^"]*)"/i) ||
                      data.match(/<meta\s+(?:property|name)="og:description"\s+content="([^"]*)"/i);
    const titleMatch = data.match(/<meta\s+(?:property|name)="og:title"\s+content="([^"]*)"/i);

    console.log('Image URL:', imgMatch ? imgMatch[1] : 'None');
    console.log('Title:', titleMatch ? titleMatch[1] : 'None');
    console.log('Desc:', descMatch ? descMatch[1] : 'None');

    if (imgMatch && imgMatch[1]) {
      const imgUrl = imgMatch[1].replace(/&amp;/g, '&');
      const file = fs.createWriteStream('thumbs/maria_jose_post.jpg');
      https.get(imgUrl, imgRes => {
        imgRes.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log('Successfully saved to thumbs/maria_jose_post.jpg');
        });
      });
    }
  });
});
