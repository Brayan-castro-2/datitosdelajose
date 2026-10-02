const fs = require('fs');
const { cleanHandleToBusinessName, extractSocials } = require('./business_resolver_engine.js');
const rawData = JSON.parse(fs.readFileSync('dataset_instagram-scraper_2026-09-17_20-51-56-540.json', 'utf8'));

const discardKeywords = [
  'tornado', 'emergencia', 'accidente', 'susto', 'luto', 'noticia', 'tragedia', 'incendio', 'robo', 'clima', 'alerta',
  'dibujos de mis hijos', 'hace pocos años (según yo', 'que no gane la rutina', '¿a nosotras nos quieren enseñar?', 
  'teleserie chilena', '¿qué teleserie', 'recién entrabas de mi mano al colegio', 'a estas alturas, si quiero hacer algo lo hago',
  'un poco de humor', 'meme', 'humor', 'chiste', 'reflexión', 'crianza', 'maternidad', 'ser mamá', 'mi hijo', 'mis hijos',
  'esposo', 'marido', 'vida de mamá', 'rutina diaria', 'cosas que me pasan', 'storytime', 'pov:', 'detrás de cámara'
];

const validVideos = rawData.filter(p => {
  if (!p.videoUrl) return false;
  const cap = (p.caption || '').toLowerCase();
  return !discardKeywords.some(kw => cap.includes(kw));
});

const businesses = new Map();
validVideos.forEach(p => {
  const soc = extractSocials(p.caption);
  if (soc.instagram) {
    const handle = soc.instagram.toLowerCase();
    const count = (businesses.get(handle) || 0) + 1;
    businesses.set(handle, count);
  }
});

console.log('Total valid videos:', validVideos.length);
console.log('Total unique businesses (handles):', businesses.size);
const sorted = Array.from(businesses.entries()).sort((a,b) => b[1] - a[1]);
console.log('Top 25 most frequent businesses:');
sorted.slice(0, 25).forEach(([h, count]) => {
  console.log(` - @${h} (${count} videos) -> ${cleanHandleToBusinessName(h)}`);
});
