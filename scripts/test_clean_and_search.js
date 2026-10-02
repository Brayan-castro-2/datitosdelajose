const knownLocations = [
  'puertovaras', 'puertomontt', 'ensenada', 'frutillar', 'llanquihue', 
  'puertooctay', 'chonchi', 'castro', 'ancud', 'chiloe', 'chiloé', 
  'chile', 'sur', 'rollizo', 'hualaihue', 'loslagos', 'pv', 'pm'
];

const vocabulary = [
  // Categorías y tipos de lugar
  'hospedaje', 'cabañas', 'cabaña', 'cabanas', 'cabana', 'camping', 'refugio', 'domos', 'domo', 
  'hotel', 'hostal', 'lodge', 'tinajas', 'tinaja', 'termas', 'glamping',
  'restaurante', 'restaurant', 'cafeteria', 'café', 'cafe', 'pasteleria', 'pizzeria', 'pizza', 
  'sushi', 'bar', 'cerveceria', 'bistro', 'sangucheria', 'hamburgueseria', 'heladeria', 'helados',
  'tiendas', 'tienda', 'boutique', 'taller', 'casa', 'galeria', 'mercadito', 'mercado',
  // Conectores y artículos
  'del', 'de', 'la', 'las', 'el', 'los', 'y',
  // Palabras específicas de nombres locales
  'cosecha', 'mar', 'festival', 'lluvia', 'secreto', 'japones', 'mundo', 'moda', 'concept',
  'cantos', 'chucao', 'anulen', 'pumahue', 'celeste', 'bahia', 'toqui', 'suyai', 'mayapehue',
  'germania', 'ibis', 'reinas', 'reina', 'blanco', 'rio', 'verde', 'origen', 'don', 'dona', 'ines',
  'duck', 'house', 'menaje', 'festin', 'producciones', 'rustico', 'creaciones', 'delantales', 'maderas'
];

// Ordenar por longitud descendente para que palabras más largas coincidan primero (ej: 'cabañas' antes de 'cabaña')
vocabulary.sort((a,b) => b.length - a.length);

function smartSplitBusiness(handle) {
  if (!handle) return '';
  let term = handle.replace(/^@/, '').replace(/\.(?:cl|com|org|net)$/i, '').toLowerCase();
  term = term.replace(/[._-]+/g, ' ');
  term = term.replace(/(\d+)/g, ' $1 '); // Separar números (ej: las 4 reinas)

  // 1. Quitar ubicación pegada al final (ej: 'ensenada', 'puertovaras', 'chile')
  for (const loc of knownLocations) {
    if (term.endsWith(loc) && term.length > loc.length + 2) {
      term = term.substring(0, term.length - loc.length).trim();
      break;
    }
  }

  // 2. Tokenizar palabras conocidas
  let tokens = [];
  let remaining = term.replace(/\s+/g, '');
  
  while (remaining.length > 0) {
    let matched = false;
    for (const w of vocabulary) {
      if (remaining.startsWith(w)) {
        tokens.push(w);
        remaining = remaining.substring(w.length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Si no coincide con vocabulario, buscar hasta el siguiente match o avanzar 1 caracter
      let nextMatchIdx = -1;
      let nextMatchWord = null;
      for (let i = 1; i < remaining.length; i++) {
        const sub = remaining.substring(i);
        for (const w of vocabulary) {
          if (sub.startsWith(w)) {
            nextMatchIdx = i;
            nextMatchWord = w;
            break;
          }
        }
        if (nextMatchIdx !== -1) break;
      }

      if (nextMatchIdx !== -1) {
        tokens.push(remaining.substring(0, nextMatchIdx));
        remaining = remaining.substring(nextMatchIdx);
      } else {
        tokens.push(remaining);
        remaining = '';
      }
    }
  }

  return tokens
    .filter(t => t.length > 0)
    .map(t => t.charAt(0).toUpperCase() + t.slice(1))
    .join(' ');
}

const samples = [
  'campingsuyaiensenada',
  'refugio.mayapehue',
  'mundomodaconcept',
  'domosanulen',
  'casa_pumahue',
  'cantosdelchucao',
  'hotelgermania_puertovaras',
  'hotelibispuertomontt',
  'campingdonchucao',
  'las4reinas.cl',
  'tiendascosechadelmar',
  'festivaldelalluvia',
  'hospedajeycabanastoqui',
  'refugio_rio.blanco'
];

samples.forEach(s => {
  console.log(`${s.padEnd(26)} -> "${smartSplitBusiness(s)}"`);
});
