const https = require('https');

function geocodePhoton(query) {
  return new Promise((resolve) => {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`;
    https.get(url, { headers: { 'User-Agent': 'DatitosApp/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json && json.features && json.features.length > 0) {
            const f = json.features[0];
            resolve({
              lat: f.geometry.coordinates[1],
              lng: f.geometry.coordinates[0],
              name: f.properties.name,
              city: f.properties.city || f.properties.county
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
  console.log('Probando Photon...');
  const tests = [
    'San Ignacio 1286, Puerto Varas',
    'Diego Portales 1001, Puerto Montt',
    'Mall Paseo del Mar, Puerto Montt',
    'Ensenada, Puerto Varas'
  ];

  for (const q of tests) {
    const t0 = Date.now();
    const r = await geocodePhoton(q);
    console.log(`[${Date.now()-t0}ms] "${q}" ->`, r);
  }
}

test();
