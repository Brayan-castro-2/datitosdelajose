const fs = require('fs');
const { REELS_DATA } = require('../js/reels-data.js');
const ds = JSON.parse(fs.readFileSync('dataset_instagram-scraper_2026-09-17_20-51-56-540.json', 'utf8'));

let matched = 0;
REELS_DATA.forEach(r => {
  const found = ds.find(d => d.shortCode === r.shortcode || (d.url && d.url.includes(r.shortcode)));
  if (found && found.videoUrl) {
    r.videoUrl = found.videoUrl;
    matched++;
  } else {
    r.videoUrl = null;
  }
});

const output = `// reels-data.js - Catálogo Oficial de Reels de María José / @datitosdelajose
// Creadora: María José Ibáñez (@datitosdelajose) · Puerto Varas, Región de Los Lagos
// Datos y recomendaciones 100% comprobadas en terreno con enlaces a Airbnb, WhatsApp y geolocalización.

const REELS_DATA = ${JSON.stringify(REELS_DATA, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { REELS_DATA };
}
`;

fs.writeFileSync('js/reels-data.js', output, 'utf8');
console.log(`✅ Successfully enriched ${matched} of ${REELS_DATA.length} reels with videoUrl`);
