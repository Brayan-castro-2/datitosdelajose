const https = require('https');

function checkMediaEndpoint(shortCode) {
  const url = `https://www.instagram.com/p/${shortCode}/media/?size=l`;
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    console.log('shortCode:', shortCode, 'statusCode:', res.statusCode, 'location:', res.headers.location);
  });
}

checkMediaEndpoint('DdPtGFQg88W');
checkMediaEndpoint('DVPWP04j4aq');
