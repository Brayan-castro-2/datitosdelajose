const https = require('https');

function testPhoton(query) {
  return new Promise(resolve => {
    // bbox: minLon, minLat, maxLon, maxLat (Los Lagos & Southern Chile)
    const url = 'https://photon.komoot.io/api/?q=' + encodeURIComponent(query) + '&bbox=-75.0,-44.5,-71.0,-40.0&limit=1';
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json && json.features && json.features.length > 0) {
            const f = json.features[0];
            resolve({
              query,
              lat: f.geometry.coordinates[1],
              lng: f.geometry.coordinates[0],
              name: f.properties.name,
              city: f.properties.city || f.properties.county || f.properties.state
            });
          } else {
            resolve({ query, lat: null, lng: null });
          }
        } catch(e) { resolve({ query, error: e.message }); }
      });
    }).on('error', e => resolve({ query, error: e.message }));
  });
}

async function run() {
  const tests = [
    'Camping Suyai Ensenada',
    'Refugio Mayapehue Chonchi',
    'Cabañas Toqui Ensenada',
    'Refugio Rio Blanco',
    'Mundo Moda Puerto Montt',
    'Domos Anulen Los Riscos',
    'Casa Pumahue Ensenada',
    'Bahia Celeste Puerto Varas',
    'Cantos del Chucao Puerto Varas',
    'Hotel Germania Puerto Varas',
    'Hotel Ibis Puerto Montt',
    'Playa Ensenada',
    'Camping Don Chucao Rollizo',
    'Las 4 Reinas Puerto Varas',
    'Café Danés Puerto Varas',
    'Cervecería Chester Puerto Varas'
  ];
  for (const t of tests) {
    const res = await testPhoton(t);
    console.log(JSON.stringify(res));
  }
}
run();
