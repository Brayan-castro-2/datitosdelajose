const fs = require('fs');

const content = fs.readFileSync('js/places-data.js', 'utf8');
const places = eval(content.match(/const PLACES_DATA = (\[[\s\S]*\]);/)[1]);

console.log(`Auditoría de coordenadas para ${places.length} locales:`);

// Bounding box del Lago Llanquihue aproximado:
// Lat entre -41.05 y -41.33
// Lng entre -73.00 y -72.65
// Pero ciudades en la orilla: Puerto Varas (-41.319, -72.985), Frutillar (-41.127, -73.048), Llanquihue (-41.258, -73.008), Puerto Octay (-40.973, -72.887), Ensenada (-41.206, -72.537).

const suspicious = [];

places.forEach(p => {
  const { lat, lng } = p.coordinates;
  // Verificar si lat o lng son inválidos
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    suspicious.push({ name: p.name, reason: 'Coordenadas NaN o vacías', lat, lng });
    return;
  }
  // Verificar si está muy al oeste en el mar pacífico abierto (ej: lng < -74.5)
  if (lng < -74.5) {
    suspicious.push({ name: p.name, reason: 'Muy al oeste (en el mar abierto)', lat, lng });
  }
  // Verificar si está en el centro geométrico profundo del lago Llanquihue
  // Centro lago: aprox lat -41.15 a -41.25, lng -72.95 a -72.75
  if (lat > -41.28 && lat < -41.12 && lng > -72.92 && lng < -72.72) {
    suspicious.push({ name: p.name, reason: 'Posiblemente dentro del agua del Lago Llanquihue', lat, lng, zone: p.zone, address: p.address });
  }
  // Verificar si está en medio del seno de Reloncaví
  if (lat > -41.75 && lat < -41.50 && lng > -72.95 && lng < -72.60) {
    suspicious.push({ name: p.name, reason: 'Posiblemente en el mar / Seno de Reloncaví', lat, lng, zone: p.zone, address: p.address });
  }
});

console.log(`Lugares sospechosos encontrados: ${suspicious.length}`);
suspicious.forEach(s => {
  console.log(`- ${s.name} (${s.lat}, ${s.lng}): ${s.reason}`);
  if (s.address) console.log(`  Dirección: ${s.address}`);
});
