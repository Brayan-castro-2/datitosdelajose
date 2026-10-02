const https = require('https');

function cleanHandleToSearchTerm(handle) {
  if (!handle) return '';
  // Quitar @ y extensiones como .cl, .com
  let term = handle.replace('@', '').replace(/\.(?:cl|com|org|net)$/i, '');
  
  // Reemplazar puntos, guiones bajos y guiones por espacios
  term = term.replace(/[._-]+/g, ' ');

  // Separar camelCase o palabras comunes pegadas si aplica
  // Ej: mundomodaconcept -> mundo moda concept
  // campingsuyaiensenada -> camping suyai ensenada
  const commonPrefixes = ['camping', 'cabañas', 'cabanas', 'refugio', 'hotel', 'hostal', 'hospedaje', 'restaurante', 'restaurant', 'cafe', 'cafeteria', 'domos', 'domo', 'pizzeria', 'pasteleria', 'heladeria'];
  for (const p of commonPrefixes) {
    if (term.toLowerCase().startsWith(p) && term.length > p.length && term[p.length] !== ' ') {
      term = p + ' ' + term.substring(p.length);
      break;
    }
  }

  return term.trim();
}

function geocodeSearch(query) {
  return new Promise((resolve) => {
    // Buscar con Nominatim
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=cl`;
    https.get(url, { headers: { 'User-Agent': 'DatitosSearch/1.0 (contacto@datitos.cl)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json && json.length > 0) {
            resolve({
              lat: parseFloat(json[0].lat),
              lng: parseFloat(json[0].lon),
              name: json[0].display_name
            });
          } else {
            resolve(null);
          }
        } catch(e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function test() {
  const handles = [
    { handle: 'campingsuyaiensenada', zone: 'Ensenada' },
    { handle: 'casa_pumahue', zone: 'Ensenada' },
    { handle: 'bahia_celeste', zone: 'Puerto Varas' },
    { handle: 'hotelgermania_puertovaras', zone: 'Puerto Varas' },
    { handle: 'hotelibispuertomontt', zone: 'Puerto Montt' },
    { handle: 'mundomodaconcept', zone: 'Puerto Montt' },
    { handle: 'cantosdelchucao', zone: 'Puerto Varas' }
  ];

  for (const item of handles) {
    const cleanName = cleanHandleToSearchTerm(item.handle);
    const query = `${cleanName}, ${item.zone}, Chile`;
    console.log(`Buscando: "${query}"...`);
    const res = await geocodeSearch(query);
    if (res) {
      console.log(`  ✅ Encontrado: [${res.lat}, ${res.lng}] -> ${res.name.substring(0, 60)}...`);
    } else {
      console.log(`  ❌ No encontrado directamente`);
    }
    await new Promise(r => setTimeout(r, 1100));
  }
}

test();
