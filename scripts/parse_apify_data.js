const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('dataset_instagram-scraper_2026-09-17_20-51-56-540.json', 'utf8'));

const categories = {
  'sorteos': { tags: ['sorteo', 'concurso', 'participa', 'gana', 'premio', 'descuento'], dest: 'promos', badge: '🎁 Sorteo' },
  'productos': { tags: ['tienda', 'emprendimiento', 'producto', 'ropa', 'comprar', 'boutique', 'decoración'], dest: 'promos', badge: '🛍️ Emprendimiento' },
  'comida': { tags: ['restaurante', 'café', 'comer', 'almuerzo', 'desayuno', 'cena', 'pizza', 'sushi', 'cafetería', 'comida'], dest: 'mapa', badge: '🍔 Comida' },
  'alojamiento': { tags: ['cabaña', 'hotel', 'hospedaje', 'alojamiento', 'dormir', 'tinaja', 'cabañas', 'hostal'], dest: 'mapa', badge: '🏨 Alojamiento' },
  'turismo': { tags: ['tour', 'viaje', 'paseo', 'lago', 'volcán', 'parque', 'sur de chile', 'panorama', 'naturaleza'], dest: 'mapa', badge: '🌲 Turismo' },
  'belleza': { tags: ['peluquería', 'pelo', 'manicure', 'uñas', 'belleza', 'estética', 'masaje', 'spa'], dest: 'mapa', badge: '💅 Belleza' }
};

// Palabras clave negativas para descartar posts que son noticias/emergencias aunque tengan palabras de lugares
const excludeKeywords = ['tornado', 'emergencia', 'accidente', 'susto', 'luto', 'noticia', 'tragedia', 'incendio', 'robo', 'clima'];

let places = [];
let promos = [];

rawData.forEach(post => {
  const caption = (post.caption || '').toLowerCase();
  
  // Si contiene alguna palabra negativa, descartarlo de inmediato
  if (excludeKeywords.some(kw => caption.includes(kw))) {
    return;
  }
  
  let assignedCategory = null;
  let destination = null;
  let badge = null;
  
  for (const [catName, config] of Object.entries(categories)) {
    if (config.tags.some(kw => caption.includes(kw))) {
      assignedCategory = catName;
      destination = config.dest;
      badge = config.badge;
      break; 
    }
  }

  if (!assignedCategory) return;

  let title = (post.caption || '').split('\n')[0].substring(0, 60);
  if (!title || title.trim() === '') title = "Recomendación de Jose";

  const cleanPost = {
    id: post.id || Math.random().toString(36).substr(2, 9),
    name: title,
    shortDesc: 'Recomendación extraída de Instagram.',
    personalTip: (post.caption || '').substring(0, 150) + '...',
    fullCaption: post.caption,
    address: 'Ubicación por confirmar',
    category: assignedCategory,
    categoryBadge: badge,
    image: post.displayUrl,
    rating: (Math.random() * (5.0 - 4.5) + 4.5).toFixed(1),
    reviewsCount: post.likesCount || 0,
    coordinates: { lat: -41.3194 + (Math.random() - 0.5) * 0.02, lng: -72.9830 + (Math.random() - 0.5) * 0.02 }, // Default coordinates (Puerto Varas)
    videoUrl: post.videoUrl || null,
    shortCode: post.shortCode || null,
    type: post.type || (post.videoUrl ? 'Video' : 'Image'),
    images: (post.images && post.images.length > 0) ? post.images : (post.displayUrl ? [post.displayUrl] : []),
    airbnbUrl: null,
    url: post.url,
    date: post.timestamp
  };

  if (destination === 'promos') {
    promos.push(cleanPost);
  } else {
    places.push(cleanPost);
  }
});

places.sort((a, b) => b.reviewsCount - a.reviewsCount);
const top50Places = places.slice(0, 50);

promos.sort((a, b) => new Date(b.date) - new Date(a.date));
const top50Promos = promos.slice(0, 50);

fs.writeFileSync('js/places-data.js', `const PLACES_DATA = ${JSON.stringify(top50Places, null, 2)};`);
fs.writeFileSync('js/promos-data.js', `const PLACES_DATA = ${JSON.stringify(top50Promos, null, 2)};`);

console.log(`✅ Fixed schema: ${top50Places.length} al mapa, ${top50Promos.length} a promos.`);
