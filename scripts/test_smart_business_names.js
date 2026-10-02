const fs = require('fs');
const https = require('https');

const rawData = JSON.parse(fs.readFileSync('dataset_instagram-scraper_2026-09-17_20-51-56-540.json', 'utf8'));

// Cargar o inicializar caché persistente
let geocache = {};
if (fs.existsSync('geocache.json')) {
  try {
    geocache = JSON.parse(fs.readFileSync('geocache.json', 'utf8'));
  } catch(e) {}
}

// Función para transformar el handle de Instagram en nombre legible de negocio separado por palabras
function cleanHandleToBusinessName(handle) {
  if (!handle) return '';
  let term = handle.replace(/^@/, '').replace(/\.(?:cl|com|org|net)$/i, '');
  
  // Reemplazar puntos, guiones bajos por espacios
  term = term.replace(/[._-]+/g, ' ');

  // Separar prefijos y palabras pegadas conocidas
  const wordsToSplit = [
    'camping', 'cabañas', 'cabanas', 'refugio', 'hotel', 'hostal', 'hospedaje', 
    'restaurante', 'restaurant', 'cafeteria', 'café', 'cafe', 'pasteleria', 'pizzeria', 
    'sushi', 'bar', 'cerveceria', 'bistro', 'sangucheria', 'hamburgueseria', 'tienda', 
    'boutique', 'spa', 'termas', 'turismo', 'patagonia', 'ensenada', 'puertovaras', 
    'puertomontt', 'frutillar', 'llanquihue', 'chiloe', 'concept', 'moda', 'mundo',
    'chucao', 'anulen', 'pumahue', 'celeste', 'bahia', 'toqui', 'suyai', 'mayapehue', 'rio'
  ];

  // Separación inteligente
  let result = term;
  for (const w of wordsToSplit) {
    const regex = new RegExp(`(${w})`, 'gi');
    result = result.replace(regex, ' $1 ');
  }

  // Limpiar espacios múltiples y capitalizar
  return result
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// Detectar Comuna o Zona
function detectZone(caption) {
  const cap = (caption || '').toLowerCase();
  if (cap.includes('ensenada')) return 'Ensenada, Puerto Varas';
  if (cap.includes('puerto montt')) return 'Puerto Montt';
  if (cap.includes('frutillar')) return 'Frutillar';
  if (cap.includes('puerto octay')) return 'Puerto Octay';
  if (cap.includes('llanquihue')) return 'Llanquihue';
  if (cap.includes('chonchi')) return 'Chonchi, Chiloé';
  if (cap.includes('castro')) return 'Castro, Chiloé';
  if (cap.includes('ancud')) return 'Ancud, Chiloé';
  if (cap.includes('chiloé') || cap.includes('chiloe')) return 'Chiloé';
  if (cap.includes('fresia')) return 'Fresia';
  if (cap.includes('calbuco')) return 'Calbuco';
  if (cap.includes('hualaihué') || cap.includes('hualaihue') || cap.includes('hornopirén')) return 'Hualaihué';
  if (cap.includes('osorno')) return 'Osorno';
  return 'Puerto Varas';
}

function geocodeSearch(query) {
  return new Promise((resolve) => {
    if (geocache[query] !== undefined) {
      return resolve(geocache[query]);
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=cl`;
    https.get(url, { headers: { 'User-Agent': 'DatitosApp/1.0 (contacto@datitosdelajose.cl)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json && json.length > 0) {
            const r = {
              lat: parseFloat(json[0].lat),
              lng: parseFloat(json[0].lon),
              address: json[0].display_name
            };
            geocache[query] = r;
            fs.writeFileSync('geocache.json', JSON.stringify(geocache, null, 2), 'utf8');
            resolve(r);
          } else {
            geocache[query] = null;
            fs.writeFileSync('geocache.json', JSON.stringify(geocache, null, 2), 'utf8');
            resolve(null);
          }
        } catch(e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

function extractMentions(caption) {
  const mentions = (caption || '').match(/@([a-zA-Z0-9._]+)/g) || [];
  return mentions
    .map(m => m.replace('@', '').replace(/[.,;:!?]+$/, '').trim())
    .filter(m => m.toLowerCase() !== 'datitosdelajose' && m.length > 1);
}

async function testBatch() {
  console.log('=== TEST DE BÚSQUEDA CON NOMBRES DE LOCALES SEPARADOS ===\n');

  const testHandles = [
    { handle: 'refugio.mayapehue', caption: 'Chiloé Chonchi' },
    { handle: 'campingsuyaiensenada', caption: 'Ensenada lago Llanquihue' },
    { handle: 'hospedajeycabanastoqui', caption: 'Km 42 Ensenada Puerto Varas' },
    { handle: 'casa_pumahue', caption: 'Ensenada' },
    { handle: 'bahia_celeste', caption: 'Km 21 camino a Ensenada Puerto Varas' },
    { handle: 'cantosdelchucao', caption: 'Colonia Tres Puentes Puerto Varas' },
    { handle: 'hotelgermania_puertovaras', caption: 'San Ignacio 1286 Puerto Varas' },
    { handle: 'hotelibispuertomontt', caption: 'Diego Portales 1001 Puerto Montt' },
    { handle: 'mundomodaconcept', caption: 'Mall Paseo del Mar Puerto Montt' }
  ];

  for (const item of testHandles) {
    const bizName = cleanHandleToBusinessName(item.handle);
    const zone = detectZone(item.caption);
    const query = `${bizName}, ${zone}, Chile`;
    console.log(`Instagram: @${item.handle} -> Nombre Limpio: "${bizName}" en [${zone}]`);
    console.log(`Query mapa: "${query}"`);
    
    const res = await geocodeSearch(query);
    if (res) {
      console.log(`  ✅ COORDENADAS: [${res.lat}, ${res.lng}] | ${res.address.substring(0, 55)}...\n`);
    } else {
      console.log(`  ➖ Probando con query ampliada...`);
      const fallbackQuery = `${bizName}, Chile`;
      const res2 = await geocodeSearch(fallbackQuery);
      if (res2) {
        console.log(`  ✅ COORDENADAS (ampliada): [${res2.lat}, ${res2.lng}] | ${res2.address.substring(0, 55)}...\n`);
      } else {
        console.log(`  ❌ Requiere dirección de calle o verificación manual\n`);
      }
    }

    await new Promise(r => setTimeout(r, 1100));
  }
}

testBatch();
