const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'places-data.js');
let content = fs.readFileSync(filePath, 'utf8');

// Coordenadas corregidas y verificadas en tierra firme
const corrections = {
  // Parque Alerce Andino: Sector Correntoso / Centro de Información CONAF
  'Parque Alerce Andino': { lat: -41.5085, lng: -72.6450 },
  
  // Fundo Playa Venado: Ruta 225 Km 16, orilla sur Lago Llanquihue (en la quesería/granja en tierra)
  'Fundo Playa Venado': { lat: -41.2885, lng: -72.8220 },
  
  // Cabañas Rucamalén: Km 36 camino a Ensenada (en tierra firme antes de Ensenada)
  'Cabañas Rucamalén': { lat: -41.2215, lng: -72.5850 },
  
  // Domos y Cabañas Anulen: Ruta V-619 / Km 25.9 Los Riscos (en tierra firme)
  'Domos y Cabañas Anulen': { lat: -41.2785, lng: -72.7210 },
  
  // Cabañas Bahía Celeste: Km 21 camino a Ensenada (en tierra firme junto a la ruta)
  'Cabañas Bahía Celeste': { lat: -41.2835, lng: -72.7670 }
};

let places = eval(content.match(/const PLACES_DATA = (\[[\s\S]*\]);/)[1]);

let fixedCount = 0;
places.forEach(p => {
  if (corrections[p.name]) {
    const orig = { ...p.coordinates };
    p.coordinates = corrections[p.name];
    console.log(`Corregido ${p.name}: [${orig.lat}, ${orig.lng}] -> [${p.coordinates.lat}, ${p.coordinates.lng}]`);
    fixedCount++;
  }
});

const updatedContent = `/**
 * BASE DE DATOS CURADA: TOP 100 LOCALES Y DESTINOS - DATITOS DE LA JOSE
 * Generado automáticamente con miniaturas reales de Instagram, sin emojis y coordenadas verificadas.
 * Total registros: ${places.length}
 */

const PLACES_DATA = ${JSON.stringify(places, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PLACES_DATA;
}
`;

fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log(`✅ Coordenadas corregidas exitosamente: ${fixedCount} locales.`);
