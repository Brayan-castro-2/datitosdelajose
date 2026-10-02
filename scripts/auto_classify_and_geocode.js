const fs = require('fs');
const https = require('https');

// 1. Cargar datos originales de scraping
const rawData = JSON.parse(fs.readFileSync('dataset_instagram-scraper_2026-09-17_20-51-56-540.json', 'utf8'));

// 2. Cargar o inicializar caché de geocodificación
let geocache = {};
if (fs.existsSync('geocache.json')) {
  try {
    geocache = JSON.parse(fs.readFileSync('geocache.json', 'utf8'));
  } catch(e) {}
}

// 3. Ground truth de las 19 verificaciones manuales del usuario
const userGroundTruth = {
  'DdPtGFQg88W': {
    category: 'airbnb',
    categoryName: '🏡 Recomendación Airbnb & Hospedaje',
    hasAirbnb: true,
    inMap: true,
    inRoute: true,
    realAddress: 'Camino Miraflores Km 3, Chonchi, Los Lagos',
    lat: -42.78573782561241,
    lng: -73.82441799846642
  },
  'DVPWP04j4aq': {
    category: 'camping',
    categoryName: '⛺️ Camping & Hospedaje (Contacto Directo)',
    hasAirbnb: false,
    inMap: true,
    inRoute: true,
    realAddress: 'Ruta 225, Ensenada, Puerto Varas, Los Lagos',
    lat: -41.21192177916837,
    lng: -72.5443151477066
  },
  'DURRUl4j00E': {
    category: 'hospedaje',
    categoryName: '🏡 Cabañas & Hospedaje (Contacto Directo)',
    hasAirbnb: false,
    inMap: true,
    inRoute: true,
    realAddress: 'Ruta 225, 5550000 Ensenada, Puerto Varas, Los Lagos',
    lat: -41.214603403269074,
    lng: -72.5478910765423
  },
  'DMgjOk3PULT': {
    category: 'hospedaje',
    categoryName: '🏡 Cabañas & Hospedaje (Contacto Directo)',
    hasAirbnb: false,
    inMap: true,
    inRoute: true,
    realAddress: 'P9P5+VM, Río del Sur, Puerto Varas, Los Lagos',
    lat: -41.01447514987585,
    lng: -72.60923185305248
  },
  'DLgd8XGAhJ-': {
    category: 'tienda_fisica',
    categoryName: '🛍️ Tienda con Local Físico',
    hasAirbnb: false,
    inMap: true,
    inRoute: true,
    realAddress: 'Mall Paseo del Mar, 2do Nivel, Puerto Montt',
    lat: -41.47175925001,
    lng: -72.94351915721535
  },
  'DI2AjSZPe8b': {
    category: 'hospedaje',
    categoryName: '🏡 Cabañas & Domos (Contacto Directo)',
    hasAirbnb: false,
    inMap: true,
    inRoute: true,
    realAddress: 'Sector Los Riscos - Ruta V 619, Parcela 5, 5550000 Puerto Varas, Los Lagos',
    lat: -41.231880935935145,
    lng: -72.72586598981813
  },
  'DIF0YQjgzZ6': {
    category: 'hospedaje',
    categoryName: '🏡 Cabañas & Domos (Contacto Directo)',
    hasAirbnb: false,
    inMap: true,
    inRoute: true,
    realAddress: 'Ruta 225 KM37 interior, sector tepu, parcela 65, Puerto Varas, Los Lagos',
    lat: -41.25998438979155,
    lng: -72.58924170352476
  },
  'DHJdBAcgxXF': {
    category: 'ruta',
    categoryName: '🚗 Ruta / Panorama General (Múltiples Paradas)',
    hasAirbnb: false,
    inMap: false,
    inRoute: false,
    realAddress: 'Recorrido multidestino por el sur (sin local único)'
  },
  'DHeXK64Pu4D': {
    category: 'hospedaje',
    categoryName: '🏡 Cabañas & Hospedaje (Contacto Directo)',
    hasAirbnb: false,
    inMap: true,
    inRoute: true,
    realAddress: 'Ruta 225 km 21, Camino entre Puerto Varas y Ensenada, Puerto Varas, Los Lagos',
    lat: -41.24651859852334,
    lng: -72.76886784417923
  },
  'DHrIE4RPTD0': {
    category: 'hospedaje',
    categoryName: '🏡 Cabañas & Hospedaje (Contacto Directo)',
    hasAirbnb: false,
    inMap: true,
    inRoute: true,
    realAddress: 'Ruta 225 km 21, Camino entre Puerto Varas y Ensenada, Puerto Varas, Los Lagos',
    lat: -41.24651859852334,
    lng: -72.76886784417923
  },
  'C-wDBXtu6Us': {
    category: 'hospedaje',
    categoryName: '🏡 Cabañas & Hospedaje (Contacto Directo)',
    hasAirbnb: false,
    inMap: true,
    inRoute: true,
    realAddress: 'Colonia Tres Puentes, LT 1.8, Puerto Varas, Los Lagos',
    lat: -41.34222090183168,
    lng: -72.81701666119207
  },
  'C_cPCpXuj8c': {
    category: 'servicio_domicilio',
    categoryName: '🐾 Servicio a Domicilio (Sin local comercial fijo)',
    hasAirbnb: false,
    inMap: false,
    inRoute: false,
    realAddress: 'Servicio a domicilio en Puerto Varas (+56942611761)'
  },
  'C8viWkou1y6': {
    category: 'comida',
    categoryName: '🍔 Desayuno Buffet / Local Físico de Comida',
    hasAirbnb: false,
    inMap: true,
    inRoute: true,
    realAddress: 'San Ignacio 1286, Puerto Varas',
    lat: -41.3227779,
    lng: -72.9891748
  },
  'C8dC4gFOpV2': {
    category: 'comida',
    categoryName: '🍔 Restaurante con Local Físico',
    hasAirbnb: false,
    inMap: true,
    inRoute: true,
    realAddress: 'Diego Portales 1001, Puerto Montt',
    lat: -41.476569,
    lng: -72.9493078
  },
  'C4i6AMROqi1': {
    category: 'turismo',
    categoryName: '🌲 Atractivo Turístico / Playa',
    hasAirbnb: false,
    inMap: true,
    inRoute: true,
    realAddress: 'Playa Ensenada, Lago Llanquihue, Región de Los Lagos',
    lat: -41.211771718387084,
    lng: -72.54524860352734
  },
  'C3oOZL5OXWS': {
    category: 'camping',
    categoryName: '⛺️ Camping & Carpas Colgantes (Contacto Directo)',
    hasAirbnb: false,
    inMap: true,
    inRoute: true,
    realAddress: 'Península rollizo - ruta v 775, km 9 Rollizo - V-699, Puerto Varas, Los Lagos',
    lat: -41.44168221839679,
    lng: -72.32932197467922
  },
  'C2D-y1_OH3Z': {
    category: 'hospedaje',
    categoryName: '🌳 Yurta & Experiencia Naturaleza (Contacto Directo)',
    hasAirbnb: false,
    inMap: true,
    inRoute: true,
    realAddress: 'Totoral / Caleta Aulen, Hualaihué, Los Lagos',
    lat: -41.889642454857054,
    lng: -72.74205479184947
  },
  'Cz2a2eTupri': {
    category: 'comida',
    categoryName: '🍔 Local de Comida / Empanadas & Puntos de Venta',
    hasAirbnb: false,
    inMap: true,
    inRoute: true,
    realAddress: 'Estación 62, Puerto Varas, Los Lagos',
    lat: -41.31403727772684,
    lng: -72.9872541611936
  }
};

// Geocodificador con Nominatim
function geocodeNominatim(query) {
  return new Promise((resolve) => {
    if (geocache[query]) {
      return resolve(geocache[query]);
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=cl`;
    const options = {
      headers: {
        'User-Agent': 'DatitosDeLaJoseApp/1.0 (contacto@datitosdelajose.cl)'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json && json.length > 0) {
            const result = {
              lat: parseFloat(json[0].lat),
              lng: parseFloat(json[0].lon),
              displayName: json[0].display_name
            };
            geocache[query] = result;
            fs.writeFileSync('geocache.json', JSON.stringify(geocache, null, 2), 'utf8');
            resolve(result);
          } else {
            geocache[query] = null;
            fs.writeFileSync('geocache.json', JSON.stringify(geocache, null, 2), 'utf8');
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

function extractExplicitAddress(caption) {
  if (!caption) return null;
  const lines = caption.split('\n');
  for (const line of lines) {
    if (line.includes('📍')) {
      const c = line.replace('📍', '').trim();
      if (c.length > 4) return c;
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

// Reglas refinadas de clasificación automática
function smartClassify(post) {
  const shortCode = post.shortCode;
  if (userGroundTruth[shortCode]) {
    return userGroundTruth[shortCode];
  }

  const cap = (post.caption || '').toLowerCase();
  const explicitAddr = extractExplicitAddress(post.caption);
  const socials = extractSocials(post.caption);

  // 1. Descarte estricto de Airbnb: SOLO si dice 'airbnb'
  const hasAirbnb = cap.includes('airbnb');

  // 2. Sorteos & Promos
  if (['sorteo', 'concurso', 'participa', 'gana', 'premio'].some(k => cap.includes(k))) {
    return {
      category: 'sorteo',
      categoryName: '🎁 Sorteo & Concurso Activo',
      hasAirbnb: false,
      inMap: false,
      inRoute: false,
      realAddress: 'Sorteo / Promoción online',
      isDeliveryOnly: false
    };
  }

  // 3. Servicios a domicilio / Solo Delivery / Online
  if (['a domicilio', 'visitas a domicilio', 'solo delivery', 'envíos a todo chile', 'despacho a domicilio'].some(k => cap.includes(k)) && !explicitAddr) {
    return {
      category: 'servicio_domicilio',
      categoryName: '🛵 Servicio a Domicilio / Sin Local Físico',
      hasAirbnb: false,
      inMap: false,
      inRoute: false,
      realAddress: 'Servicio a domicilio o envíos',
      isDeliveryOnly: true
    };
  }

  // 4. Rutas / Recorridos múltiples
  if ((cap.includes('recorrido:') || cap.includes('ruta de la jose') || cap.includes('recorrido de la jose')) && !explicitAddr) {
    return {
      category: 'ruta',
      categoryName: '🚗 Recorrido Multidestino (Sin Punto Único)',
      hasAirbnb: false,
      inMap: false,
      inRoute: false,
      realAddress: 'Ruta turística con múltiples paradas'
    };
  }

  // 5. Eventos Temporales (Fondas, Festivales, Cruceros)
  if (['fonda', 'crucero', 'festival', 'concierto', 'show', 'carnaval', 'fiestas patrias'].some(k => cap.includes(k))) {
    return {
      category: 'evento',
      categoryName: '🎪 Evento / Panorama Temporal',
      hasAirbnb: false,
      inMap: false,
      inRoute: false,
      realAddress: explicitAddr || 'Evento temporal'
    };
  }

  // 6. Airbnb EXCLUSIVO (si dice literalmente 'airbnb')
  if (hasAirbnb) {
    return {
      category: 'airbnb',
      categoryName: '🏡 Recomendación Airbnb (Verificado)',
      hasAirbnb: true,
      inMap: true,
      inRoute: true,
      realAddress: explicitAddr || null
    };
  }

  // 7. Cabañas, Domos, Hospedajes, Hoteles (Contacto Directo, NO Airbnb)
  if (['cabaña', 'cabañas', 'hospedaje', 'glamping', 'domo', 'domos', 'lodge', 'hotel', 'tinaja', 'tinajas'].some(k => cap.includes(k))) {
    return {
      category: 'hospedaje',
      categoryName: '🏡 Cabañas & Hospedaje (Contacto Directo)',
      hasAirbnb: false,
      inMap: true,
      inRoute: true,
      realAddress: explicitAddr || null
    };
  }

  // 8. Locales Físicos de Comida
  if (['café', 'cafetería', 'restaurante', 'pizzería', 'pizza', 'sushi', 'bar', 'cervecería', 'bistró', 'pastelería', 'trattoria', 'sanguchería', 'hamburguesería', 'brunch', 'heladería', 'chocolatería', 'kuchen', 'almuerzo', 'desayuno buffet'].some(k => cap.includes(k))) {
    return {
      category: 'comida',
      categoryName: '🍔 Local Físico de Comida',
      hasAirbnb: false,
      inMap: true,
      inRoute: true,
      realAddress: explicitAddr || null
    };
  }

  // 9. Atractivos Turísticos y Naturaleza
  if (['parque nacional', 'volcán', 'volcan', 'salto', 'cascada', 'sendero', 'mirador', 'playa', 'lago llanquihue', 'ensenada', 'frutillar', 'puerto octay', 'paseo en lancha', 'trekking', 'kayak', 'termas', 'humedal'].some(k => cap.includes(k))) {
    return {
      category: 'turismo',
      categoryName: '🌲 Atractivo Turístico & Naturaleza',
      hasAirbnb: false,
      inMap: true,
      inRoute: true,
      realAddress: explicitAddr || null
    };
  }

  // 10. Tiendas y Emprendimientos
  return {
    category: explicitAddr ? 'tienda_fisica' : 'tienda_online',
    categoryName: explicitAddr ? '🛍️ Tienda con Local Físico' : '🛍️ Tienda & Emprendimiento',
    hasAirbnb: false,
    inMap: !!explicitAddr,
    inRoute: !!explicitAddr,
    realAddress: explicitAddr || null
  };
}

async function run() {
  console.log('🚀 Iniciando Clasificación Inteligente y Geocodificación Automática...');
  
  const discardKeywords = [
    'tornado', 'emergencia', 'accidente', 'susto', 'luto', 'noticia', 'tragedia', 'incendio', 'robo', 'clima', 'alerta',
    'dibujos de mis hijos', 'hace pocos años (según yo', 'que no gane la rutina', '¿a nosotras nos quieren enseñar?', 
    'teleserie chilena', '¿qué teleserie', 'recién entrabas de mi mano al colegio', 'a estas alturas, si quiero hacer algo lo hago',
    'un poco de humor', 'meme', 'humor', 'chiste', 'reflexión', 'crianza', 'maternidad', 'ser mamá', 'mi hijo', 'mis hijos',
    'esposo', 'marido', 'vida de mamá', 'rutina diaria', 'cosas que me pasan', 'storytime', 'pov:', 'detrás de cámara'
  ];

  const validVideos = rawData.filter(p => {
    if (!p.videoUrl) return false;
    const cap = (p.caption || '').toLowerCase();
    return !discardKeywords.some(kw => cap.includes(kw));
  });

  console.log(`Total videos a clasificar: ${validVideos.length}`);

  let geocodedCount = 0;
  let airbnbCount = 0;
  let directHospedajeCount = 0;

  for (let i = 0; i < validVideos.length; i++) {
    const post = validVideos[i];
    const classification = smartClassify(post);

    if (classification.hasAirbnb) airbnbCount++;
    if (classification.category === 'hospedaje') directHospedajeCount++;

    // Si no tiene coordenadas y tiene dirección explícita, intentar geocodificar
    if (!classification.lat && classification.realAddress && classification.inMap) {
      let query = classification.realAddress;
      if (!query.toLowerCase().includes('chile')) {
        if (!query.toLowerCase().includes('puerto varas') && !query.toLowerCase().includes('puerto montt') && !query.toLowerCase().includes('ensenada') && !query.toLowerCase().includes('frutillar') && !query.toLowerCase().includes('chiloé')) {
          query += ', Puerto Varas, Región de Los Lagos, Chile';
        } else {
          query += ', Chile';
        }
      }

      // Si ya está en caché, no esperamos
      const inCache = geocache[query] !== undefined;
      const coords = await geocodeNominatim(query);

      if (coords) {
        classification.lat = coords.lat;
        classification.lng = coords.lng;
        geocodedCount++;
      }

      if (!inCache) {
        // Pausa de 1.1 seg para respetar la política de Nominatim
        await new Promise(r => setTimeout(r, 1100));
      }
    }
  }

  console.log(`\n📊 Resultados:`);
  console.log(`- Videos con Airbnb REAL: ${airbnbCount} (¡filtrado estricto!)`);
  console.log(`- Videos de Cabañas/Hospedaje Contacto Directo: ${directHospedajeCount}`);
  console.log(`- Direcciones geocodificadas con coordenadas exactas: ${geocodedCount}`);
}

run();
