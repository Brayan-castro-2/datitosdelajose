const fs = require('fs');
const https = require('https');
const path = require('path');
const xlsx = require('xlsx');

// 1. Leer los 100 del Excel
const wb = xlsx.readFile('Top 100 Locales Filtrados y Recientes - Datitos de la Jose (Fase 1).xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet);

console.log(`Cargados ${rows.length} registros del Excel.`);

const thumbsDir = path.join(__dirname, '..', 'thumbs');
if (!fs.existsSync(thumbsDir)) {
  fs.mkdirSync(thumbsDir, { recursive: true });
}

function extractShortcode(link) {
  if (!link) return null;
  const m = link.match(/\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

function downloadMedia(shortCode) {
  return new Promise((resolve) => {
    const dest = path.join(thumbsDir, `thumb_${shortCode}.jpg`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 2000) {
      return resolve({ success: true, cached: true });
    }

    const url = `https://www.instagram.com/p/${shortCode}/media/?size=l`;
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }, (res) => {
      if (res.statusCode === 302 && res.headers.location) {
        const file = fs.createWriteStream(dest);
        https.get(res.headers.location, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (imgRes) => {
          if (imgRes.statusCode === 200) {
            imgRes.pipe(file);
            file.on('finish', () => {
              file.close();
              const size = fs.existsSync(dest) ? fs.statSync(dest).size : 0;
              if (size > 1000) {
                resolve({ success: true, size });
              } else {
                if (fs.existsSync(dest)) fs.unlinkSync(dest);
                resolve({ success: false, reason: 'Empty file' });
              }
            });
          } else {
            file.close();
            if (fs.existsSync(dest)) fs.unlinkSync(dest);
            resolve({ success: false, reason: `Img status ${imgRes.statusCode}` });
          }
        }).on('error', (e) => {
          file.close();
          if (fs.existsSync(dest)) fs.unlinkSync(dest);
          resolve({ success: false, reason: e.message });
        });
      } else {
        resolve({ success: false, reason: `Media status ${res.statusCode}` });
      }
    });

    req.on('error', (e) => {
      resolve({ success: false, reason: e.message });
    });

    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ success: false, reason: 'Timeout' });
    });
  });
}

async function run() {
  let okCount = 0;
  let failCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const code = extractShortcode(row.link_reel);
    if (!code) {
      console.log(`[${i+1}/${rows.length}] ${row.nombre}: No shortcode`);
      failCount++;
      continue;
    }

    const res = await downloadMedia(code);
    if (res.success) {
      okCount++;
      if (res.cached) {
        console.log(`[${i+1}/${rows.length}] ${row.nombre} (${code}): Ya existía en cache.`);
      } else {
        console.log(`[${i+1}/${rows.length}] ${row.nombre} (${code}): Descargada OK (${Math.round(res.size/1024)} KB)`);
      }
    } else {
      failCount++;
      console.log(`[${i+1}/${rows.length}] ${row.nombre} (${code}): Falló - ${res.reason}`);
    }

    // Pequeño delay de 250ms para no saturar
    await new Promise(r => setTimeout(r, 250));
  }

  console.log(`\nDescarga terminada: ${okCount} exitosas, ${failCount} fallidas.`);
}

run();
