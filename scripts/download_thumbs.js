const fs = require('fs');
const https = require('https');
const path = require('path');

const data = JSON.parse(fs.readFileSync('instagram_extracted.json', 'utf-8'));
const thumbsDir = path.join(__dirname, 'thumbs');

if (!fs.existsSync(thumbsDir)) {
  fs.mkdirSync(thumbsDir);
}

function downloadImage(url, dest) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith('http')) {
      return resolve(false);
    }
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        resolve(false);
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      resolve(false);
    });
  });
}

async function run() {
  console.log('Downloading thumbnails...');
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const dest = path.join(thumbsDir, `thumb_${item.shortcode}.jpg`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log(`[${i+1}/${data.length}] Already exists: thumb_${item.shortcode}.jpg`);
      continue;
    }
    const success = await downloadImage(item.image, dest);
    console.log(`[${i+1}/${data.length}] Downloaded thumb_${item.shortcode}.jpg: ${success ? 'OK' : 'FAILED'}`);
    await new Promise(r => setTimeout(r, 200));
  }
  console.log('Thumbnail download completed!');
}

run();
