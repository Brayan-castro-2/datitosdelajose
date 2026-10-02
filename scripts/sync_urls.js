const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'places-data.js');
let code = fs.readFileSync(filePath, 'utf8');

const fn = new Function(code + '\nreturn PLACES_DATA;');
const places = fn();

places.forEach(p => {
  const encName = encodeURIComponent(p.name);
  p.uberUrl = 'https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=' + p.coordinates.lat + '&dropoff[longitude]=' + p.coordinates.lng + '&dropoff[nickname]=' + encName;
  p.gmapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p.name + ', ' + p.address + ', Chile');
});

fs.writeFileSync(filePath, '/**\n * BASE DE DATOS LOCALES TOP 100 - DATITOS DE LA JOSE\n */\nconst PLACES_DATA = ' + JSON.stringify(places, null, 2) + ';\n', 'utf8');
console.log('Successfully synced all URLs for ' + places.length + ' places');
