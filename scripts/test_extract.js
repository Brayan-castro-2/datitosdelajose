const fs = require('fs');

const data = JSON.parse(fs.readFileSync('dataset_instagram-scraper_2026-09-17_20-51-56-540.json', 'utf8'));

const discardKeywords = [
  'tornado', 'emergencia', 'accidente', 'susto', 'luto', 'noticia', 'tragedia', 'incendio', 'robo', 'clima', 'alerta',
  'dibujos de mis hijos', 'hace pocos años (según yo', 'que no gane la rutina', '¿a nosotras nos quieren enseñar?', 
  'teleserie chilena', '¿qué teleserie', 'recién entrabas de mi mano al colegio', 'a estas alturas, si quiero hacer algo lo hago',
  'un poco de humor', 'meme', 'humor', 'chiste', 'reflexión', 'crianza', 'maternidad', 'ser mamá', 'mi hijo', 'mis hijos',
  'esposo', 'marido', 'vida de mamá', 'rutina diaria', 'cosas que me pasan', 'storytime', 'pov:', 'detrás de cámara'
];

const validVideos = data.filter(p => {
  if (!p.videoUrl) return false;
  const cap = (p.caption || '').toLowerCase();
  return !discardKeywords.some(kw => cap.includes(kw));
});

function extractSocials(caption) {
  if (!caption) return { instagram: null, allInstagrams: [], whatsapp: null, waDisplay: null };

  const mentions = caption.match(/@([a-zA-Z0-9._]+)/g) || [];
  const bizMentions = mentions
    .map(m => m.replace('@', '').replace(/[.,;:!?]+$/, '').trim())
    .filter(m => m.toLowerCase() !== 'datitosdelajose' && m.length > 1);

  const instagram = bizMentions.length > 0 ? bizMentions[0] : null;

  let whatsapp = null;
  let waDisplay = null;

  const waRegex = /(?:whatsapp|wsp|ws|fono|teléfono|contacto|reservas|al)?[\s.:]*(\+?56\s?9\s?\d{4}\s?\d{3,4}|\+?56\s?9\s?\d{7,8}|\b9\s?\d{4}\s?\d{4}\b|\b9\d{8}\b)/i;
  const waMatch = caption.match(waRegex);

  if (waMatch) {
    const raw = waMatch[1].replace(/\D/g, '');
    if (raw.startsWith('569') && (raw.length === 11 || raw.length === 10)) {
      whatsapp = raw;
      waDisplay = `+${raw}`;
    } else if (raw.startsWith('9') && raw.length === 9) {
      whatsapp = '56' + raw;
      waDisplay = `+56 ${raw}`;
    } else if (raw.length === 8) {
      whatsapp = '569' + raw;
      waDisplay = `+56 9 ${raw}`;
    } else if (raw.length === 7) {
      whatsapp = '569' + raw;
      waDisplay = `+56 9 ${raw}`;
    }
  }

  return { instagram, allInstagrams: bizMentions, whatsapp, waDisplay };
}

const airbnbVideos = validVideos.filter(v => {
  const cap = (v.caption || '').toLowerCase();
  return ['airbnb', 'cabaña', 'cabañas', 'hospedaje', 'glamping', 'domo', 'domos', 'lodge', 'hotel', 'tinaja', 'tinajas', 'arriendo por día'].some(kw => cap.includes(kw))
    && !['fonda', 'crucero', 'festival'].some(kw => cap.includes(kw));
});

console.log(`Total Airbnb videos: ${airbnbVideos.length}`);
airbnbVideos.slice(0, 5).forEach((v, idx) => {
  const soc = extractSocials(v.caption);
  console.log(`\nItem [${idx + 1}] Shortcode: ${v.shortCode}`);
  console.log(`Title: ${(v.caption || '').split('\n')[0]}`);
  console.log(`Instagram: ${soc.instagram ? `@${soc.instagram} (https://www.instagram.com/${soc.instagram}/)` : 'Ninguno'}`);
  console.log(`WhatsApp: ${soc.whatsapp ? `${soc.waDisplay} (https://wa.me/${soc.whatsapp})` : 'Ninguno'}`);
});
