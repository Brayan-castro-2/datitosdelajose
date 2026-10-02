const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('dataset_instagram-scraper_2026-09-17_20-51-56-540.json', 'utf8'));

// Keywords for broad categories
const categories = {
  'Sorteos / Promociones': ['sorteo', 'concurso', 'participa', 'gana', 'premio', 'descuento', 'regalo'],
  'Comida / Restaurantes / Cafés': ['restaurante', 'café', 'comer', 'almuerzo', 'desayuno', 'cena', 'pizza', 'sushi', 'cafetería', 'comida'],
  'Alojamiento / Cabañas / Hoteles': ['cabaña', 'hotel', 'hospedaje', 'alojamiento', 'dormir', 'tinaja', 'cabañas', 'hostal'],
  'Turismo / Viajes / Panoramas': ['tour', 'viaje', 'paseo', 'lago', 'volcán', 'parque', 'sur de chile', 'panorama', 'naturaleza'],
  'Belleza / Estética / Peluquería': ['peluquería', 'pelo', 'manicure', 'uñas', 'belleza', 'estética', 'masaje', 'spa'],
  'Productos / Compras / Emprendimientos': ['tienda', 'emprendimiento', 'producto', 'ropa', 'comprar', 'boutique', 'decoración']
};

const stats = {
  'Sorteos / Promociones': 0,
  'Comida / Restaurantes / Cafés': 0,
  'Alojamiento / Cabañas / Hoteles': 0,
  'Turismo / Viajes / Panoramas': 0,
  'Belleza / Estética / Peluquería': 0,
  'Productos / Compras / Emprendimientos': 0,
  'Otros / Vida personal': 0
};

rawData.forEach(post => {
  const caption = (post.caption || '').toLowerCase();
  
  let categorized = false;
  
  for (const [catName, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => caption.includes(kw))) {
      stats[catName]++;
      categorized = true;
      break; // count only once per post, prioritizing first matched category
    }
  }
  
  if (!categorized) {
    stats['Otros / Vida personal']++;
  }
});

console.log("=== ANÁLISIS DE LAS 1557 PUBLICACIONES ===");
for (const [cat, count] of Object.entries(stats)) {
  const percentage = ((count / rawData.length) * 100).toFixed(1);
  console.log(`${cat}: ${count} posts (${percentage}%)`);
}
