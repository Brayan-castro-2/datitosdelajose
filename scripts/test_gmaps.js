const https = require('https');

function searchGoogleMaps(query) {
  return new Promise((resolve) => {
    // URL de búsqueda de Google Maps
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-CL,es;q=0.9,en;q=0.8'
      }
    };

    https.get(url, options, (res) => {
      let html = '';
      res.on('data', chunk => html += chunk);
      res.on('end', () => {
        // En el HTML de Google Maps o redirects, las coordenadas vienen en formato:
        // /@lat,lng,zoom o [null,null,lat,lng]
        const matchAt = html.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        const matchWindow = html.match(/window\.APP_INITIALIZATION_STATE=\[\[\[\d+,\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
        const matchData = html.match(/\[null,null,(-?\d+\.\d+),(-?\d+\.\d+)\]/);

        if (matchAt) {
          resolve({ lat: parseFloat(matchAt[1]), lng: parseFloat(matchAt[2]), type: '@match' });
        } else if (matchData) {
          resolve({ lat: parseFloat(matchData[1]), lng: parseFloat(matchData[2]), type: 'dataMatch' });
        } else if (matchWindow) {
          resolve({ lat: parseFloat(matchWindow[1]), lng: parseFloat(matchWindow[2]), type: 'windowMatch' });
        } else {
          resolve({ found: false, len: html.length, sample: html.slice(0, 300) });
        }
      });
    }).on('error', err => resolve({ error: err.message }));
  });
}

async function test() {
  const r = await searchGoogleMaps('Camping Suyai Ensenada');
  console.log('Camping Suyai Ensenada result:', r);
}

test();
