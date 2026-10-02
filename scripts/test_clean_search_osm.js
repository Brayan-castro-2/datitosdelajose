const https = require('https');

function searchOsm(query) {
  return new Promise((resolve) => {
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
  const tests = [
    'Hotel Germania, Puerto Varas, Chile',
    'Hotel Ibis, Puerto Montt, Chile',
    'Mall Paseo del Mar, Puerto Montt, Chile',
    'Bahía Celeste, Puerto Varas, Chile',
    'Camping Suyai, Ensenada, Chile',
    'Cabañas Anulen, Puerto Varas, Chile',
    '4 Reinas, Puerto Varas, Chile'
  ];

  for (const q of tests) {
    const res = await searchOsm(q);
    if (res) {
      console.log(`✅ "${q}" -> [${res.lat}, ${res.lng}] (${res.name.substring(0, 45)}...)`);
    } else {
      console.log(`❌ "${q}" -> No encontrado`);
    }
    await new Promise(r => setTimeout(r, 1100));
  }
}

test();
