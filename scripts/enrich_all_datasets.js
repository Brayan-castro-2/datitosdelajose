const fs = require('fs');
const {
  rawData,
  userGroundTruth,
  smartSplitBusiness,
  detectZone,
  extractExplicitStreetAddress,
  extractSocials,
  classifySmart,
  geocache
} = require('./business_resolver_engine.js');

const discardKeywords = [
  'tornado', 'emergencia', 'accidente', 'susto', 'luto', 'noticia', 'tragedia', 'incendio', 'robo', 'clima', 'alerta',
  'dibujos de mis hijos', 'hace pocos años (según yo', 'que no gane la rutina', '¿a nosotras nos quieren enseñar?', 
  'teleserie chilena', '¿qué teleserie', 'recién entrabas de mi mano al colegio', 'a estas alturas, si quiero hacer algo lo hago',
  'un poco de humor', 'meme', 'humor', 'chiste', 'reflexión', 'crianza', 'maternidad', 'ser mamá', 'mi hijo', 'mis hijos',
  'esposo', 'marido', 'vida de mamá', 'rutina diaria', 'cosas que me pasan', 'storytime', 'pov:', 'detrás de cámara'
];

let places = [];
let promos = [];

rawData.forEach(post => {
  if (!post.videoUrl) return;
  const cap = (post.caption || '').toLowerCase();
  
  if (discardKeywords.some(kw => cap.includes(kw))) {
    return;
  }

  const classification = classifySmart(post);
  const socials = extractSocials(post.caption);
  const title = (post.caption || '').split('\n')[0].replace(/[#*`_]/g, '').trim().substring(0, 75) || 'Recomendación de Jose';
  const bizName = classification.bizName || (socials.instagram ? smartSplitBusiness(socials.instagram) : 'Local Recomendado');
  const zone = classification.zone || detectZone(post.caption);

  let lat = classification.lat || null;
  let lng = classification.lng || null;
  let finalAddress = classification.realAddress || null;
  let verified = classification.verified || false;

  const cacheKey = `${bizName}, ${zone}, Chile`;
  if (!lat && geocache[cacheKey]) {
    lat = geocache[cacheKey].lat;
    lng = geocache[cacheKey].lng;
    finalAddress = geocache[cacheKey].address;
  }

  // Fallback de coordenadas en la zona si no tiene exactas pero aplica para mapa
  if (!lat && classification.inMap.includes('Sí')) {
    lat = -41.3194 + (Math.random() - 0.5) * 0.04;
    lng = -72.9830 + (Math.random() - 0.5) * 0.04;
    finalAddress = finalAddress || `Sector ${zone}`;
  }

  const isAirbnb = classification.hasAirbnb;
  const airbnbUrl = isAirbnb ? (post.airbnbUrl || 'https://www.airbnb.cl/s/Puerto-Varas--Chile') : null;
  const gmapsQuery = encodeURIComponent(`${bizName}, ${zone}, Chile`);
  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${gmapsQuery}`;

  // Badges y Categorías para la UI
  let uiCategory = 'turismo';
  let badge = '🌲 Turismo & Naturaleza';
  if (classification.categoryName.includes('Airbnb')) {
    uiCategory = 'alojamiento';
    badge = '🏡 Recomendación Airbnb';
  } else if (classification.categoryName.includes('Cabañas') || classification.categoryName.includes('Hospedaje') || classification.categoryName.includes('Camping') || classification.categoryName.includes('Domos') || classification.categoryName.includes('Yurta')) {
    uiCategory = 'alojamiento';
    badge = classification.categoryName.includes('Camping') ? '⛺️ Camping Directo' : '🏡 Cabañas & Domos';
  } else if (classification.categoryName.includes('Comida') || classification.categoryName.includes('Desayuno') || classification.categoryName.includes('Restaurante')) {
    uiCategory = 'comida';
    badge = '🍔 Comida & Cafés';
  } else if (classification.categoryName.includes('Sorteo') || classification.categoryName.includes('Concurso')) {
    uiCategory = 'sorteos';
    badge = '🎁 Sorteo Activo';
  } else if (classification.categoryName.includes('Tienda')) {
    uiCategory = 'productos';
    badge = '🛍️ Tienda & Emprendimiento';
  } else if (classification.categoryName.includes('Evento')) {
    uiCategory = 'eventos';
    badge = '🎪 Evento Temporal';
  }

  const item = {
    id: post.id || post.shortCode,
    shortcode: post.shortCode,
    name: title,
    bizName: bizName,
    zone: zone,
    shortDesc: `Recomendación auténtica en ${zone}.`,
    personalTip: (post.caption || '').substring(0, 160) + '...',
    fullCaption: post.caption || '',
    address: finalAddress || `Sector ${zone}`,
    lat: lat,
    lng: lng,
    rating: 5.0,
    category: uiCategory,
    categoryName: classification.categoryName,
    badgeText: badge,
    imageUrl: post.displayUrl || (post.images && post.images[0]) || 'thumbs/' + post.shortCode + '.jpg',
    videoUrl: post.videoUrl,
    hasAirbnb: isAirbnb,
    airbnbUrl: airbnbUrl,
    instagramUrl: post.url || `https://www.instagram.com/p/${post.shortCode}/`,
    gmapsUrl: gmapsUrl,
    businessInstagram: socials.instagram,
    businessInstagramUrl: socials.instagramUrl,
    allInstagrams: socials.allInstagrams,
    whatsapp: socials.whatsapp,
    waDisplay: socials.waDisplay,
    whatsappUrl: socials.whatsappUrl,
    verified: verified,
    likesCount: post.likesCount || 0,
    commentsCount: post.commentsCount || 0
  };

  if (uiCategory === 'sorteos' || (uiCategory === 'productos' && classification.inMap.includes('No'))) {
    promos.push(item);
  } else {
    places.push(item);
  }
});

console.log(`Enriquecidos: ${places.length} lugares para el mapa y ${promos.length} promociones/sorteos.`);

// Guardar en js/places-data.js
const placesContent = `// Catálogo enriquecido con coordenadas de Maps y filtro estricto de Airbnb\nconst initialPlaces = ${JSON.stringify(places, null, 2)};\n`;
fs.writeFileSync('js/places-data.js', placesContent, 'utf8');

// Guardar en js/promos-data.js
const promosContent = `// Catálogo de Sorteos, Tiendas y Promociones\nconst initialPromos = ${JSON.stringify(promos, null, 2)};\n`;
fs.writeFileSync('js/promos-data.js', promosContent, 'utf8');

console.log('✅ Archivos js/places-data.js y js/promos-data.js actualizados con éxito.');
