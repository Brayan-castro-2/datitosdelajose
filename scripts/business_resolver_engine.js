const fs = require('fs');
const https = require('https');

// 1. Cargar datos de scraping
const rawData = JSON.parse(fs.readFileSync('dataset_instagram-scraper_2026-09-17_20-51-56-540.json', 'utf8'));

// 2. Cargar caché de geocodificación persistente
let geocache = {};
if (fs.existsSync('geocache.json')) {
  try {
    geocache = JSON.parse(fs.readFileSync('geocache.json', 'utf8'));
  } catch(e) {}
}

function saveGeocache() {
  try {
    fs.writeFileSync('geocache.json', JSON.stringify(geocache, null, 2), 'utf8');
  } catch(e) {}
}

// 3. Ground Truth Oficial (Las 19 correcciones del usuario en CATALOGO_VIDEOS_2.md)
const userGroundTruth = {
  'DdPtGFQg88W': {
    categoryName: '🏡 Recomendación Airbnb & Hospedaje',
    hasAirbnb: true,
    inMap: '✅ Sí (Aparece en Mapa)',
    inRoute: '✅ Sí',
    realAddress: 'Camino Miraflores Km 3, Chonchi, Los Lagos',
    lat: -42.78573782561241,
    lng: -73.82441799846642,
    bizName: 'Refugio Mayapehue',
    zone: 'Chonchi, Chiloé',
    verified: true
  },
  'DVPWP04j4aq': {
    categoryName: '⛺️ Camping & Hospedaje (Contacto Directo)',
    hasAirbnb: false, // Corrección usuario: este NO tiene airbnb
    inMap: '✅ Sí (Aparece en Mapa)',
    inRoute: '✅ Sí',
    realAddress: 'Ruta 225, Ensenada, Puerto Varas, Los Lagos',
    lat: -41.21192177916837,
    lng: -72.5443151477066,
    bizName: 'Camping Suyai',
    zone: 'Ensenada',
    verified: true
  },
  'DURRUl4j00E': {
    categoryName: '🏡 Cabañas & Hospedaje (Contacto Directo)',
    hasAirbnb: false,
    inMap: '✅ Sí (Aparece en Mapa)',
    inRoute: '✅ Sí',
    realAddress: 'Ruta 225, 5550000 Ensenada, Puerto Varas, Los Lagos',
    lat: -41.214603403269074,
    lng: -72.5478910765423,
    bizName: 'Hospedaje Y Cabañas Toqui',
    zone: 'Ensenada',
    verified: true
  },
  'DMgjOk3PULT': {
    categoryName: '🏡 Cabañas & Hospedaje (Contacto Directo)',
    hasAirbnb: false,
    inMap: '✅ Sí (Aparece en Mapa)',
    inRoute: '✅ Sí',
    realAddress: 'P9P5+VM, Río del Sur, Puerto Varas, Los Lagos',
    lat: -41.01447514987585,
    lng: -72.60923185305248,
    bizName: 'Refugio Rio Blanco',
    zone: 'Puerto Varas',
    verified: true
  },
  'DLgd8XGAhJ-': {
    categoryName: '🛍️ Tienda con Local Físico',
    hasAirbnb: false,
    inMap: '✅ Sí (Aparece en Mapa)',
    inRoute: '✅ Sí',
    realAddress: 'Mall Paseo del Mar, 2do Nivel, Puerto Montt',
    lat: -41.47175925001,
    lng: -72.94351915721535,
    bizName: 'Mundo Moda Concept',
    zone: 'Puerto Montt',
    verified: true
  },
  'DI2AjSZPe8b': {
    categoryName: '🏡 Cabañas & Domos (Contacto Directo)',
    hasAirbnb: false,
    inMap: '✅ Sí (Aparece en Mapa)',
    inRoute: '✅ Sí',
    realAddress: 'Sector Los Riscos - Ruta V 619, Parcela 5, 5550000 Puerto Varas, Los Lagos',
    lat: -41.231880935935145,
    lng: -72.72586598981813,
    bizName: 'Domos Anulen',
    zone: 'Los Riscos, Puerto Varas',
    verified: true
  },
  'DIF0YQjgzZ6': {
    categoryName: '🏡 Cabañas & Domos (Contacto Directo)',
    hasAirbnb: false,
    inMap: '✅ Sí (Aparece en Mapa)',
    inRoute: '✅ Sí',
    realAddress: 'Ruta 225 KM37 interior, sector tepu, parcela 65, Puerto Varas, Los Lagos',
    lat: -41.25998438979155,
    lng: -72.58924170352476,
    bizName: 'Casa Pumahue',
    zone: 'Ensenada',
    verified: true
  },
  'DHJdBAcgxXF': {
    categoryName: '🚗 Recorrido Multidestino (Sin Punto Único)',
    hasAirbnb: false,
    inMap: '❌ No (Es ruta con múltiples paradas)',
    inRoute: '❌ No',
    realAddress: 'Recorrido multidestino por el sur (sin local único)',
    bizName: 'Recorrido De La Jose',
    zone: 'Región de Los Lagos',
    verified: true
  },
  'DHeXK64Pu4D': {
    categoryName: '🏡 Cabañas & Hospedaje (Contacto Directo)',
    hasAirbnb: false,
    inMap: '✅ Sí (Aparece en Mapa)',
    inRoute: '✅ Sí',
    realAddress: 'Ruta 225 km 21, Camino entre Puerto Varas y Ensenada, Puerto Varas, Los Lagos',
    lat: -41.24651859852334,
    lng: -72.76886784417923,
    bizName: 'Cabañas Bahía Celeste',
    zone: 'Puerto Varas',
    verified: true
  },
  'DHrIE4RPTD0': {
    categoryName: '🏡 Cabañas & Hospedaje (Contacto Directo)',
    hasAirbnb: false,
    inMap: '✅ Sí (Aparece en Mapa)',
    inRoute: '✅ Sí',
    realAddress: 'Ruta 225 km 21, Camino entre Puerto Varas y Ensenada, Puerto Varas, Los Lagos',
    lat: -41.24651859852334,
    lng: -72.76886784417923,
    bizName: 'Cabañas Bahía Celeste',
    zone: 'Puerto Varas',
    verified: true
  },
  'C-wDBXtu6Us': {
    categoryName: '🏡 Cabañas & Hospedaje (Contacto Directo)',
    hasAirbnb: false,
    inMap: '✅ Sí (Aparece en Mapa)',
    inRoute: '✅ Sí',
    realAddress: 'Colonia Tres Puentes, LT 1.8, Puerto Varas, Los Lagos',
    lat: -41.34222090183168,
    lng: -72.81701666119207,
    bizName: 'Cantos Del Chucao',
    zone: 'Puerto Varas',
    verified: true
  },
  'C_cPCpXuj8c': {
    categoryName: '🐾 Servicio a Domicilio (Sin Local Físico)',
    hasAirbnb: false,
    inMap: '❌ No (Servicio a domicilio sin local comercial)',
    inRoute: '❌ No',
    realAddress: 'Servicio a domicilio en Puerto Varas (+56942611761)',
    bizName: 'Animal Pet',
    zone: 'Puerto Varas',
    verified: true
  },
  'C8viWkou1y6': {
    categoryName: '🍔 Desayuno Buffet / Local Físico de Comida',
    hasAirbnb: false,
    inMap: '✅ Sí (Aparece en Mapa)',
    inRoute: '✅ Sí',
    realAddress: 'San Ignacio 1286, Puerto Varas',
    lat: -41.3227779,
    lng: -72.9891748,
    bizName: 'Hotel Germania',
    zone: 'Puerto Varas',
    verified: true
  },
  'C8dC4gFOpV2': {
    categoryName: '🍔 Restaurante con Local Físico',
    hasAirbnb: false,
    inMap: '✅ Sí (Aparece en Mapa)',
    inRoute: '✅ Sí',
    realAddress: 'Diego Portales 1001, Puerto Montt',
    lat: -41.476569,
    lng: -72.9493078,
    bizName: 'Hotel Ibis',
    zone: 'Puerto Montt',
    verified: true
  },
  'C4i6AMROqi1': {
    categoryName: '🌲 Atractivo Turístico / Playa',
    hasAirbnb: false,
    inMap: '✅ Sí (Aparece en Mapa)',
    inRoute: '✅ Sí',
    realAddress: 'Playa Ensenada, Lago Llanquihue, Región de Los Lagos',
    lat: -41.211771718387084,
    lng: -72.54524860352734,
    bizName: 'Playa Ensenada',
    zone: 'Ensenada',
    verified: true
  },
  'C3oOZL5OXWS': {
    categoryName: '⛺️ Camping & Carpas Colgantes (Contacto Directo)',
    hasAirbnb: false,
    inMap: '✅ Sí (Aparece en Mapa)',
    inRoute: '✅ Sí',
    realAddress: 'Península rollizo - ruta v 775, km 9 Rollizo - V-699, Puerto Varas, Los Lagos',
    lat: -41.44168221839679,
    lng: -72.32932197467922,
    bizName: 'Camping Don Chucao',
    zone: 'Rollizo',
    verified: true
  },
  'C2D-y1_OH3Z': {
    categoryName: '🌳 Yurta & Experiencia Naturaleza (Contacto Directo)',
    hasAirbnb: false,
    inMap: '✅ Sí (Aparece en Mapa)',
    inRoute: '✅ Sí',
    realAddress: 'Totoral / Caleta Aulen, Hualaihué, Los Lagos',
    lat: -41.889642454857054,
    lng: -72.74205479184947,
    bizName: 'Origen Patagonia Verde',
    zone: 'Totoral / Hualaihué',
    verified: true
  },
  'Cz2a2eTupri': {
    categoryName: '🍔 Local de Comida / Empanadas & Puntos de Venta',
    hasAirbnb: false,
    inMap: '✅ Sí (Aparece en Mapa)',
    inRoute: '✅ Sí',
    realAddress: 'Estación 62, Puerto Varas, Los Lagos',
    lat: -41.31403727772684,
    lng: -72.9872541611936,
    bizName: 'Las 4 Reinas',
    zone: 'Puerto Varas',
    verified: true
  }
};

const knownLocations = [
  'puertovaras', 'puertomontt', 'ensenada', 'frutillar', 'llanquihue', 
  'puertooctay', 'chonchi', 'castro', 'ancud', 'chiloe', 'chiloé', 
  'chile', 'sur', 'rollizo', 'hualaihue', 'loslagos', 'pv', 'pm'
];

const vocabulary = [
  // Categorías y tipos de lugar
  'hospedaje', 'cabañas', 'cabaña', 'cabanas', 'cabana', 'camping', 'refugio', 'domos', 'domo', 
  'hotel', 'hostal', 'lodge', 'tinajas', 'tinaja', 'termas', 'glamping', 'yurta',
  'restaurante', 'restaurant', 'cafeteria', 'café', 'cafe', 'pasteleria', 'pizzeria', 'pizza', 
  'sushi', 'bar', 'cerveceria', 'bistro', 'sangucheria', 'hamburgueseria', 'heladeria', 'helados',
  'tiendas', 'tienda', 'boutique', 'taller', 'casa', 'galeria', 'mercadito', 'mercado',
  // Conectores y artículos
  'del', 'de', 'la', 'las', 'el', 'los', 'y',
  // Palabras específicas de nombres locales
  'cosecha', 'mar', 'festival', 'lluvia', 'secreto', 'japones', 'mundo', 'moda', 'concept',
  'cantos', 'chucao', 'anulen', 'pumahue', 'celeste', 'bahia', 'toqui', 'suyai', 'mayapehue',
  'germania', 'ibis', 'reinas', 'reina', 'blanco', 'rio', 'verde', 'origen', 'don', 'dona', 'ines',
  'duck', 'house', 'menaje', 'festin', 'producciones', 'rustico', 'creaciones', 'delantales', 'maderas',
  'patagonia', 'pet', 'animal', 'skorpios', 'quintupeu', 'folks', 'pudu'
];

// Ordenar por longitud descendente para máxima precisión
vocabulary.sort((a,b) => b.length - a.length);

function smartSplitBusiness(handle) {
  if (!handle) return '';
  let term = handle.replace(/^@/, '').replace(/\.(?:cl|com|org|net)$/i, '').toLowerCase();
  term = term.replace(/[._-]+/g, ' ');
  term = term.replace(/(\d+)/g, ' $1 '); // Separar dígitos como '4'

  // 1. Quitar sufijo de ubicación si está pegado
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
      let nextMatchIdx = -1;
      for (let i = 1; i < remaining.length; i++) {
        const sub = remaining.substring(i);
        for (const w of vocabulary) {
          if (sub.startsWith(w)) {
            nextMatchIdx = i;
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

// Detectar Comuna o Zona
function detectZone(caption) {
  const cap = (caption || '').toLowerCase();
  if (cap.includes('ensenada')) return 'Ensenada';
  if (cap.includes('puerto montt')) return 'Puerto Montt';
  if (cap.includes('frutillar')) return 'Frutillar';
  if (cap.includes('puerto octay')) return 'Puerto Octay';
  if (cap.includes('llanquihue')) return 'Llanquihue';
  if (cap.includes('chonchi')) return 'Chonchi, Chiloé';
  if (cap.includes('castro')) return 'Castro, Chiloé';
  if (cap.includes('ancud')) return 'Ancud, Chiloé';
  if (cap.includes('chiloé') || cap.includes('chiloe')) return 'Chiloé';
  if (cap.includes('fresia')) return 'Fresia';
  if (cap.includes('calbuco')) return 'Calbuco';
  if (cap.includes('hualaihué') || cap.includes('hualaihue') || cap.includes('rollizo')) return 'Hualaihué';
  if (cap.includes('osorno')) return 'Osorno';
  return 'Puerto Varas';
}

function extractExplicitStreetAddress(caption) {
  if (!caption) return null;
  const lines = caption.split('\n');
  for (const line of lines) {
    if (line.includes('📍')) {
      const c = line.replace('📍', '').trim();
      if (c.length > 4 && !c.toLowerCase().includes('waze en biografía')) return c;
    }
    if (/^(?:dirección|ubicación):/i.test(line.trim())) {
      const c = line.replace(/^(?:dirección|ubicación):/i, '').trim();
      if (c.length > 4) return c;
    }
  }
  return null;
}

function extractSocials(caption) {
  if (!caption) return { instagram: null, allInstagrams: [], whatsapp: null, waDisplay: null, whatsappUrl: null };

  const mentions = caption.match(/@([a-zA-Z0-9._]+)/g) || [];
  const bizMentions = mentions
    .map(m => m.replace('@', '').replace(/[.,;:!?]+$/, '').trim())
    .filter(m => m.toLowerCase() !== 'datitosdelajose' && m.length > 1);

  const instagram = bizMentions.length > 0 ? bizMentions[0] : null;

  let whatsapp = null;
  let waDisplay = null;
  const waRegex = /(?:whatsapp|wsp|ws|fono|teléfono|contacto|reservas|al)?[\s.:]*(\+?56\s?9\s?\d{4}\s?\d{3,4}|\+?56\s?9\s?\d{7,8}|\b9\s?\d{4}\s?\d{4}\b|\b9\d{8}\b)/i;
  const waMatch = caption.match(waRegex);

  if (waMatch) {
    const raw = waMatch[1].replace(/\D/g, '');
    if (raw.startsWith('569') && (raw.length === 11 || raw.length === 10)) {
      whatsapp = raw;
      waDisplay = `+${raw}`;
    } else if (raw.startsWith('9') && raw.length === 9) {
      whatsapp = '56' + raw;
      waDisplay = `+56 ${raw}`;
    } else if (raw.length === 8 || raw.length === 7) {
      whatsapp = '569' + raw;
      waDisplay = `+56 9 ${raw}`;
    }
  }

  return {
    instagram,
    instagramUrl: instagram ? `https://www.instagram.com/${instagram}/` : null,
    allInstagrams: bizMentions,
    whatsapp,
    waDisplay,
    whatsappUrl: whatsapp ? `https://wa.me/${whatsapp}` : null
  };
}

function geocodeNominatim(query) {
  return new Promise((resolve) => {
    if (geocache[query] !== undefined) {
      return resolve(geocache[query]);
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=cl`;
    https.get(url, { headers: { 'User-Agent': 'DatitosApp/1.0 (contacto@datitosdelajose.cl)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json && json.length > 0) {
            const r = {
              lat: parseFloat(json[0].lat),
              lng: parseFloat(json[0].lon),
              address: json[0].display_name
            };
            geocache[query] = r;
            saveGeocache();
            resolve(r);
          } else {
            geocache[query] = null;
            saveGeocache();
            resolve(null);
          }
        } catch(e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

function classifySmart(post) {
  const shortCode = post.shortCode;
  if (userGroundTruth[shortCode]) {
    return userGroundTruth[shortCode];
  }

  const cap = (post.caption || '').toLowerCase();
  const explicitAddr = extractExplicitStreetAddress(post.caption);
  const socials = extractSocials(post.caption);
  const bizName = socials.instagram ? smartSplitBusiness(socials.instagram) : '';
  const zone = detectZone(post.caption);

  // Regla 1: Solo es Airbnb si la palabra 'airbnb' aparece literalmente en el texto
  const hasAirbnb = cap.includes('airbnb');

  // Regla 2: Sorteos y concursos
  if (['sorteo', 'concurso', 'participa', 'gana', 'premio'].some(k => cap.includes(k))) {
    return {
      categoryName: '🎁 Sorteo & Concurso Activo',
      hasAirbnb: false,
      inMap: '❌ No (Es sorteo / concurso)',
      inRoute: '❌ No',
      realAddress: 'Sorteo / Concurso online',
      bizName,
      zone
    };
  }

  // Regla 3: Servicios a domicilio / delivery exclusivo (ej. veterinaria a domicilio)
  if (['a domicilio', 'visitas a domicilio', 'solo delivery', 'envíos a todo chile', 'despacho a domicilio'].some(k => cap.includes(k)) && !explicitAddr) {
    return {
      categoryName: '🛵 Servicio a Domicilio (Sin Local Comercial Fijo)',
      hasAirbnb: false,
      inMap: '❌ No (Servicio a domicilio)',
      inRoute: '❌ No',
      realAddress: `Servicio a domicilio en ${zone}`,
      bizName,
      zone
    };
  }

  // Regla 4: Rutas o panoramas de múltiples paradas
  if ((cap.includes('recorrido:') || cap.includes('recorrido de la jose') || cap.includes('ruta de')) && !explicitAddr) {
    return {
      categoryName: '🚗 Recorrido Multidestino (Sin Punto Único)',
      hasAirbnb: false,
      inMap: '❌ No (Ruta multidestino)',
      inRoute: '❌ No',
      realAddress: `Ruta turística por ${zone}`,
      bizName,
      zone
    };
  }

  // Regla 5: Eventos temporales (fondas, ferias, festivales, desfiles)
  if (['fonda', 'crucero', 'festival', 'concierto', 'show', 'carnaval', 'fiestas patrias'].some(k => cap.includes(k))) {
    return {
      categoryName: '🎪 Evento / Panorama Temporal',
      hasAirbnb: false,
      inMap: '❌ No (Evento temporal sin local permanente)',
      inRoute: '❌ No',
      realAddress: explicitAddr || `Evento temporal en ${zone}`,
      bizName,
      zone
    };
  }

  // Regla 6: Airbnb Exclusivo (solo si la descripción dice literalmente 'airbnb')
  if (hasAirbnb) {
    return {
      categoryName: '🏡 Recomendación Airbnb (Verificado)',
      hasAirbnb: true,
      inMap: '✅ Sí (Aparece en Mapa)',
      inRoute: '✅ Sí',
      realAddress: explicitAddr,
      bizName,
      zone
    };
  }

  // Regla 7: Cabañas, domos, camping, tinajas (Hospedaje directo, NO Airbnb)
  if (['cabaña', 'cabañas', 'hospedaje', 'glamping', 'domo', 'domos', 'lodge', 'hotel', 'tinaja', 'tinajas', 'camping', 'carpa', 'yurta'].some(k => cap.includes(k))) {
    const isCamping = cap.includes('camping') || cap.includes('carpa');
    return {
      categoryName: isCamping ? '⛺️ Camping & Hospedaje (Contacto Directo)' : '🏡 Cabañas & Hospedaje (Contacto Directo)',
      hasAirbnb: false,
      inMap: '✅ Sí (Aparece en Mapa)',
      inRoute: '✅ Sí',
      realAddress: explicitAddr,
      bizName,
      zone
    };
  }

  // Regla 8: Locales Físicos de Comida & Cafeterías
  if (['café', 'cafetería', 'restaurante', 'restaurant', 'pizzería', 'pizza', 'sushi', 'bar', 'cervecería', 'bistró', 'pastelería', 'trattoria', 'sanguchería', 'hamburguesería', 'brunch', 'heladería', 'chocolatería', 'kuchen', 'almuerzo', 'desayuno buffet', 'empanadas'].some(k => cap.includes(k))) {
    return {
      categoryName: '🍔 Local Físico de Comida',
      hasAirbnb: false,
      inMap: '✅ Sí (Aparece en Mapa)',
      inRoute: '✅ Sí',
      realAddress: explicitAddr,
      bizName,
      zone
    };
  }

  // Regla 9: Atractivos Turísticos y Naturaleza
  if (['parque nacional', 'volcán', 'volcan', 'salto', 'cascada', 'sendero', 'mirador', 'playa', 'lago llanquihue', 'ensenada', 'frutillar', 'puerto octay', 'paseo en lancha', 'trekking', 'kayak', 'termas', 'humedal'].some(k => cap.includes(k))) {
    return {
      categoryName: '🌲 Atractivo Turístico & Naturaleza',
      hasAirbnb: false,
      inMap: '✅ Sí (Aparece en Mapa)',
      inRoute: '✅ Sí',
      realAddress: explicitAddr || `Sector ${zone}`,
      bizName,
      zone
    };
  }

  // Regla 10: Tiendas y emprendimientos
  return {
    categoryName: explicitAddr ? '🛍️ Tienda con Local Físico' : '🛍️ Tienda & Emprendimiento',
    hasAirbnb: false,
    inMap: explicitAddr ? '✅ Sí (Aparece en Mapa)' : '❌ No (Sin local comercial)',
    inRoute: explicitAddr ? '✅ Sí' : '❌ No',
    realAddress: explicitAddr,
    bizName,
    zone
  };
}

module.exports = {
  rawData,
  userGroundTruth,
  smartSplitBusiness,
  detectZone,
  extractExplicitStreetAddress,
  extractSocials,
  geocodeNominatim,
  classifySmart,
  geocache
};
