const fs = require('fs');
const data = JSON.parse(fs.readFileSync('dataset_instagram-scraper_2026-09-17_20-51-56-540.json', 'utf8'));

const excludeKeywords = ['tornado', 'emergencia', 'accidente', 'susto', 'luto', 'noticia', 'tragedia', 'incendio', 'robo', 'clima', 'alerta'];

const validVideos = data.filter(p => !!p.videoUrl && !excludeKeywords.some(kw => (p.caption||'').toLowerCase().includes(kw)));

const primaryCategories = {
  'Gastronomía & Cafeterías': {
    tags: ['café', 'cafetería', 'restaurante', 'comer', 'almuerzo', 'desayuno', 'cena', 'pizza', 'sushi', 'comida', 'küchen', 'kuchen', 'torta', 'panadería', 'helado', 'cerveza', 'trago', 'bar', 'hamburguesa', 'brunch', 'empanada'],
    icon: '☕'
  },
  'Cabañas, Hoteles & Tinajas': {
    tags: ['cabaña', 'cabañas', 'hotel', 'hospedaje', 'alojamiento', 'dormir', 'tinaja', 'tinajas', 'hostal', 'glamping', 'lodge', 'termas'],
    icon: '🏡'
  },
  'Turismo, Lagos & Naturaleza': {
    tags: ['tour', 'viaje', 'paseo', 'lago', 'volcán', 'volcan', 'parque', 'sur de chile', 'panorama', 'naturaleza', 'trekking', 'sendero', 'kayak', 'salto', 'cascada', 'ensenada', 'frutillar', 'puerto octay', 'llanquihue', 'chiloé', 'chiloe', 'playa', 'mirador'],
    icon: '🌲'
  },
  'Sorteos & Concursos': {
    tags: ['sorteo', 'concurso', 'participa', 'gana', 'premio'],
    icon: '🎁'
  },
  'Tiendas, Compras & Emprendimientos': {
    tags: ['tienda', 'emprendimiento', 'producto', 'ropa', 'comprar', 'boutique', 'decoración', 'descuento', 'regalo', 'artesanía', 'joyas', 'feria', 'mall', 'bazar'],
    icon: '🛍️'
  },
  'Belleza, Estética & Spa': {
    tags: ['peluquería', 'pelo', 'manicure', 'uñas', 'belleza', 'estética', 'masaje', 'spa', 'facial', 'pestañas', 'cejas', 'yoga', 'skincare'],
    icon: '💅'
  },
  'Panoramas con Niños & Familia': {
    tags: ['hijo', 'niño', 'niña', 'bebé', 'mamá', 'mama', 'familia', 'escolar', 'colegio', 'kids', 'infantil', 'vacaciones de invierno'],
    icon: '👨‍👩‍👧‍👦'
  },
  'Eventos, Fiestas & Cultura': {
    tags: ['evento', 'música', 'teatro', 'cine', 'taller', 'clase', 'concierto', 'fiesta', 'fonda', 'feria costumbrista', 'festival'],
    icon: '🎪'
  }
};

const counts = {};
Object.keys(primaryCategories).forEach(k => counts[k] = 0);
let unclassified = 0;
const unclassifiedSamples = [];

validVideos.forEach(v => {
  const cap = (v.caption || '').toLowerCase();
  let matched = false;
  for (const [catName, config] of Object.entries(primaryCategories)) {
    if (config.tags.some(t => cap.includes(t))) {
      counts[catName]++;
      matched = true;
      break;
    }
  }
  if (!matched) {
    unclassified++;
    if (unclassifiedSamples.length < 8) {
      unclassifiedSamples.push({
        id: v.id,
        title: (v.caption || '').split('\n')[0].substring(0, 80),
        url: v.url
      });
    }
  }
});

console.log(JSON.stringify({
  totalPublicaciones: data.length,
  totalVideos: data.filter(p => !!p.videoUrl).length,
  videosDescartados: data.filter(p => !!p.videoUrl && excludeKeywords.some(kw => (p.caption||'').toLowerCase().includes(kw))).length,
  videosValidosDisponibles: validVideos.length,
  desglosePorCategorias: counts,
  sinClasificar: unclassified,
  muestrasSinClasificar: unclassifiedSamples
}, null, 2));
