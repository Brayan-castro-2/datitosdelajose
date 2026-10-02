const fs = require('fs');

const data = JSON.parse(fs.readFileSync('dataset_instagram-scraper_2026-09-17_20-51-56-540.json', 'utf8'));
const excludeKeywords = ['tornado', 'emergencia', 'accidente', 'susto', 'luto', 'noticia', 'tragedia', 'incendio', 'robo', 'clima', 'alerta'];

// Filtrar solo los videos válidos
const validVideos = data.filter(p => !!p.videoUrl && !excludeKeywords.some(kw => (p.caption||'').toLowerCase().includes(kw)));

// 1. EVENTOS TEMPORALES / SIN UBICACIÓN FIJA
const eventTags = [
  'fonda', 'crucero', 'festival', 'concierto', 'show', 'desfile', 'feria costumbrista', 
  'programación', 'preventa entradas', 'toliv', 'passline', '18 de septiembre', 
  'fiestas patrias', 'celebración', 'carnaval', 'navigación', 'aura fashion'
];

// 2. RECOMENDACIONES EXCLUSIVAS AIRBNB / HOSPEDAJE
const airbnbTags = [
  'airbnb', 'cabaña', 'cabañas', 'hospedaje', 'glamping', 'domo', 'domos', 'lodge', 
  'hotel boutique', 'arriendo por día', 'tinaja caliente privada'
];

// 3. PRODUCTOS EN VENTA / MARCAS COMERCIALES (NO LOCAL FÍSICO)
const productTags = [
  'supermercado', 'líder', 'lider', 'todo a mil', 'caja vienen', 'gr. c/u', 'suplementos', 
  'envasado', 'congelado', 'puntos de venta', 'si quieres ser punto de venta', 'envíos a todo chile', 
  'compra online', 'tienda online', 'código de descuento', 'despacho'
];

// 4. LOCALES FÍSICOS DE COMIDA (Restaurantes, Cafés, Pastelerías con mesas y dirección)
const foodPlaceTags = [
  'café', 'cafetería', 'restaurante', 'pizzería', 'pizza', 'sushi', 'bar', 'cervecería', 
  'bistró', 'pastelería', 'trattoria', 'sanguchería', 'hamburguesería', 'brunch', 'heladería', 
  'chocolatería', 'kuchen', 'küchen', 'comida casera'
];

// 5. ATRACTIVOS TURÍSTICOS Y NATURALEZA
const tourismTags = [
  'parque nacional', 'volcán', 'volcan', 'salto del petrohué', 'saltos', 'cascada', 
  'sendero', 'mirador', 'playa', 'lago llanquihue', 'ensenada', 'frutillar', 'puerto octay', 
  'paseo en lancha', 'trekking', 'kayak', 'termas'
];

// 6. SORTEOS Y CONCURSOS ACTIVOS
const promoTags = ['sorteo', 'concurso', 'participa', 'gana', 'premio'];

// 7. CONTENIDO PERSONAL / HUMOR / REFLEXIÓN (Mamá Santi)
const personalTags = ['humor', 'meme', 'reflexión', 'hijos', 'maternidad', 'rutina', 'dibujos de mis hijos', 'hace pocos años'];

function classify(post) {
  const cap = (post.caption || '').toLowerCase();

  // A. ¿Es sorteo?
  if (promoTags.some(t => cap.includes(t))) {
    return { category: 'sorteo', label: '🎁 Sorteos & Concursos', inMap: false, inRoute: false, hasAirbnb: false };
  }

  // B. ¿Es evento temporal / sin ubicación clásica?
  if (eventTags.some(t => cap.includes(t))) {
    return { category: 'evento', label: '🎪 Eventos & Panoramas Temporales', inMap: false, inRoute: false, hasAirbnb: false };
  }

  // C. ¿Es recomendación EXCLUSIVA de Airbnb / Hospedaje?
  if (airbnbTags.some(t => cap.includes(t)) && !eventTags.some(t => cap.includes(t))) {
    return { category: 'airbnb', label: '🏡 Recomendaciones Airbnb & Cabañas', inMap: true, inRoute: true, hasAirbnb: true };
  }

  // D. ¿Es producto comercial envasado / supermercado (NO local de comida)?
  if (productTags.some(t => cap.includes(t))) {
    return { category: 'producto', label: '🛍️ Productos & Emprendimientos', inMap: false, inRoute: false, hasAirbnb: false };
  }

  // E. ¿Es local FÍSICO de comida? (Tiene mesas, atención o dirección de local)
  if (foodPlaceTags.some(t => cap.includes(t))) {
    return { category: 'comida_local', label: '🍔 Locales Físicos de Comida', inMap: true, inRoute: true, hasAirbnb: false };
  }

  // F. ¿Es atractivo turístico o naturaleza?
  if (tourismTags.some(t => cap.includes(t))) {
    return { category: 'turismo', label: '🌲 Atractivos Turísticos & Rutas', inMap: true, inRoute: true, hasAirbnb: false };
  }

  // G. Personal / Reflexión
  if (personalTags.some(t => cap.includes(t))) {
    return { category: 'personal', label: '🎙️ Vida Cotidiana / Mamá Santi', inMap: false, inRoute: false, hasAirbnb: false };
  }

  return { category: 'otros', label: '📍 Otros Rincones & Tiendas Locales', inMap: true, inRoute: true, hasAirbnb: false };
}

const groups = {};
const samples = {};

validVideos.forEach(v => {
  const res = classify(v);
  groups[res.category] = (groups[res.category] || 0) + 1;
  if (!samples[res.category]) samples[res.category] = [];
  if (samples[res.category].length < 3) {
    samples[res.category].push({
      title: (v.caption || '').split('\n')[0].substring(0, 75),
      url: v.url
    });
  }
});

console.log('--- CLASIFICACIÓN SEGÚN CRITERIOS EXACTOS DEL USUARIO ---');
console.log('Total videos válidos evaluados:', validVideos.length);
console.log(JSON.stringify({ conteos: groups, muestras: samples }, null, 2));
