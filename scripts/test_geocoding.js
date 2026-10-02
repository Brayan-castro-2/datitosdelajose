const https = require('https');
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('dataset_instagram-scraper_2026-09-17_20-51-56-540.json', 'utf8'));

// Geocodificador gratuito usando Nominatim de OpenStreetMap
function geocodeNominatim(query) {
  return new Promise((resolve) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=cl`;
    const options = {
      headers: {
        'User-Agent': 'DatitosDeLaJoseApp/1.0 (contacto@datitosdelajose.cl)'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json && json.length > 0) {
            resolve({
              lat: parseFloat(json[0].lat),
              lng: parseFloat(json[0].lon),
              displayName: json[0].display_name
            });
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

// Probar con 3 direcciones reales de captions de Jose
async function test() {
  console.log('Probando geocodificación automática...');
  const tests = [
    'San Ignacio 1286, Puerto Varas, Chile',
    'Diego Portales 1001, Puerto Montt, Chile',
    'Ramón Freire 1102, Puerto Varas, Chile',
    'Mall Paseo del Mar, Puerto Montt, Chile'
  ];

  for (const q of tests) {
    const res = await geocodeNominatim(q);
    console.log(`Búsqueda: "${q}" ->`, res ? `Encontrado: [${res.lat}, ${res.lng}] (${res.displayName.substring(0, 50)}...)` : 'No encontrado');
    // Esperar 1 segundo por cortesía con OSM
    await new Promise(r => setTimeout(r, 1100));
  }
}

test();
