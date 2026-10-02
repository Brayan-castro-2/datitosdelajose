const fs = require('fs');

const data = JSON.parse(fs.readFileSync('dataset_instagram-scraper_2026-09-17_20-51-56-540.json', 'utf8'));

// Descarte de emergencias, accidentes, y cotidiano puro (humor, maternidad sin recomendación)
const discardKeywords = [
  'tornado', 'emergencia', 'accidente', 'susto', 'luto', 'noticia', 'tragedia', 'incendio', 'robo', 'clima', 'alerta',
  'dibujos de mis hijos', 'hace pocos años (según yo', 'que no gane la rutina', '¿a nosotras nos quieren enseñar?', 
  'teleserie chilena', '¿qué teleserie', 'recién entrabas de mi mano al colegio', 'a estas alturas, si quiero hacer algo lo hago',
  'un poco de humor', 'meme', 'humor', 'chiste', 'reflexión', 'crianza', 'maternidad', 'ser mamá', 'mi hijo', 'mis hijos',
  'esposo', 'marido', 'vida de mamá', 'rutina diaria', 'cosas que me pasan', 'storytime', 'pov:', 'detrás de cámara'
];

// 1. Filtrar solo videos con videoUrl y sin palabras de descarte
const validVideos = data.filter(p => {
  if (!p.videoUrl) return false;
  const cap = (p.caption || '').toLowerCase();
  return !discardKeywords.some(kw => cap.includes(kw));
});

// Criterios de clasificación
const promoKeywords = ['sorteo', 'concurso', 'participa', 'gana', 'premio'];

const eventKeywords = [
  'fonda', 'crucero', 'festival', 'concierto', 'show', 'desfile', 'feria costumbrista', 
  'programación', 'preventa entradas', 'toliv', 'passline', '18 de septiembre', 
  'fiestas patrias', 'celebración', 'carnaval', 'navigación', 'maratón', 'carrera'
];

const airbnbKeywords = [
  'airbnb', 'cabaña', 'cabañas', 'hospedaje', 'glamping', 'domo', 'domos', 'lodge', 
  'hotel', 'tinaja', 'tinajas', 'arriendo por día'
];

const foodPlaceKeywords = [
  'café', 'cafetería', 'restaurante', 'pizzería', 'pizza', 'sushi', 'bar', 'cervecería', 
  'bistró', 'pastelería', 'trattoria', 'sanguchería', 'hamburguesería', 'brunch', 'heladería', 
  'chocolatería', 'kuchen', 'küchen', 'comida casera', 'almuerzo', 'desayuno buffet'
];

const foodProductKeywords = [
  'supermercado', 'líder', 'lider', 'todo a mil', 'caja vienen', 'gr. c/u', 'suplementos', 
  'envasado', 'congelado', 'puntos de venta', 'si quieres ser punto de venta', 'hamburguesas de salmón',
  'tienda de', 'envíos a todo chile'
];

const tourismKeywords = [
  'parque nacional', 'volcán', 'volcan', 'salto', 'cascada', 'sendero', 'mirador', 
  'playa', 'lago llanquihue', 'ensenada', 'frutillar', 'puerto octay', 'paseo en lancha', 
  'trekking', 'kayak', 'termas', 'rincón', 'rincon', 'humedal', 'pasaje ricke', 'mercado'
];

const shopKeywords = [
  'tienda', 'emprendimiento', 'producto', 'ropa', 'comprar', 'boutique', 'decoración', 
  'descuento', 'regalo', 'artesanía', 'joyas', 'feria', 'mall', 'bazar', 'farmacia', 'calzado', 'zapatos'
];

function extractAddress(caption) {
  if (!caption) return 'Ubicación por confirmar (Puerto Varas / Alrededores)';
  const lines = caption.split('\n');
  for (const line of lines) {
    if (line.includes('📍')) {
      return line.replace('📍', '').trim();
    }
    if (line.toLowerCase().includes('dirección:') || line.toLowerCase().includes('ubicación:')) {
      return line.trim();
    }
    if (line.toLowerCase().includes('km ') || line.toLowerCase().includes('ruta 225')) {
      return line.trim();
    }
  }
  return 'Ubicación por confirmar (Puerto Varas / Alrededores)';
}

function extractSocials(caption) {
  if (!caption) return { instagram: null, allInstagrams: [], whatsapp: null, waDisplay: null };

  // Detectar menciones @usuario excluyendo la cuenta principal
  const mentions = caption.match(/@([a-zA-Z0-9._]+)/g) || [];
  const bizMentions = mentions
    .map(m => m.replace('@', '').replace(/[.,;:!?]+$/, '').trim())
    .filter(m => m.toLowerCase() !== 'datitosdelajose' && m.length > 1);

  const instagram = bizMentions.length > 0 ? bizMentions[0] : null;

  // Detectar WhatsApp / Celulares chilenos (+569... o 9...)
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
    } else if (raw.length === 8) {
      whatsapp = '569' + raw;
      waDisplay = `+56 9 ${raw}`;
    } else if (raw.length === 7) {
      whatsapp = '569' + raw;
      waDisplay = `+56 9 ${raw}`;
    }
  }

  return { instagram, allInstagrams: bizMentions, whatsapp, waDisplay };
}

function classifyPost(post) {
  const cap = (post.caption || '').toLowerCase();

  // 1. Sorteo
  if (promoKeywords.some(kw => cap.includes(kw))) {
    return {
      categoryKey: 'sorteos',
      categoryName: '🎁 Sorteo & Concurso Activo',
      inMap: false,
      inRoute: false,
      hasAirbnb: false
    };
  }

  // 2. Evento Temporal / Sin ubicación física tradicional
  if (eventKeywords.some(kw => cap.includes(kw))) {
    return {
      categoryKey: 'eventos',
      categoryName: '🎪 Evento / Panorama Temporal',
      inMap: false,
      inRoute: false,
      hasAirbnb: false
    };
  }

  // 3. Locales Físicos de Comida
  const isFoodPlace = foodPlaceKeywords.some(kw => cap.includes(kw));
  const isFoodProduct = foodProductKeywords.some(kw => cap.includes(kw));

  if (isFoodPlace && !isFoodProduct && !eventKeywords.some(kw => cap.includes(kw))) {
    return {
      categoryKey: 'comida',
      categoryName: '🍔 Local Físico de Comida',
      inMap: true,
      inRoute: true,
      hasAirbnb: false
    };
  }

  // 4. Recomendación Airbnb / Hospedaje Exclusivo
  if (airbnbKeywords.some(kw => cap.includes(kw)) && !eventKeywords.some(kw => cap.includes(kw))) {
    return {
      categoryKey: 'airbnb',
      categoryName: '🏡 Recomendación Airbnb & Hospedaje',
      inMap: true,
      inRoute: true,
      hasAirbnb: true
    };
  }

  // 5. Atractivos Turísticos y Naturaleza
  if (tourismKeywords.some(kw => cap.includes(kw))) {
    return {
      categoryKey: 'turismo',
      categoryName: '🌲 Atractivo Turístico & Naturaleza',
      inMap: true,
      inRoute: true,
      hasAirbnb: false
    };
  }

  // 6. Tiendas, Productos & Emprendimientos
  if (shopKeywords.some(kw => cap.includes(kw)) || isFoodProduct) {
    return {
      categoryKey: 'tiendas',
      categoryName: '🛍️ Tiendas, Productos & Emprendimientos',
      inMap: false,
      inRoute: false,
      hasAirbnb: false
    };
  }

  // 7. Otros Rincones Locales
  return {
    categoryKey: 'otros',
    categoryName: '📍 Otros Rincones & Recomendaciones Locales',
    inMap: true,
    inRoute: true,
    hasAirbnb: false
  };
}

// Agrupar los videos
const groups = {
  airbnb: { title: '🏡 1. Cabañas & Alojamientos Airbnb (Exclusivos)', items: [] },
  comida: { title: '🍔 2. Locales Físicos de Comida (Restaurantes, Cafés, Pizzerías con mesas)', items: [] },
  turismo: { title: '🌲 3. Atractivos Turísticos, Lagos & Naturaleza', items: [] },
  eventos: { title: '🎪 4. Eventos & Panoramas Temporales (Fondas, cruceros, festivales)', items: [] },
  tiendas: { title: '🛍️ 5. Tiendas, Productos & Emprendimientos Locales', items: [] },
  sorteos: { title: '🎁 6. Sorteos & Concursos', items: [] },
  otros: { title: '📍 7. Otros Rincones & Recomendaciones por Confirmar', items: [] }
};

// Mapa con las correcciones manuales ya verificadas por el usuario
const verifiedUserEdits = {
  'DdPtGFQg88W': {
    realAddress: 'Camino Miraflores Km 3, Chonchi, Los Lagos',
    coordinates: '[-42.78573782561241, -73.82441799846642]',
    verified: true
  },
  'DVPWP04j4aq': {
    realAddress: 'Ruta 225, Ensenada, Puerto Varas, Los Lagos',
    coordinates: '[-41.21192177916837, -72.5443151477066]',
    verified: true
  }
};

validVideos.forEach((v, index) => {
  const cl = classifyPost(v);
  const detectedAddress = extractAddress(v.caption);
  const socials = extractSocials(v.caption);
  const title = (v.caption || '').split('\n')[0].replace(/[#*`_]/g, '').trim().substring(0, 90) || 'Recomendación de Jose';
  
  // Revisar si ya fue verificado por el usuario
  const userEdit = verifiedUserEdits[v.shortCode] || null;

  groups[cl.categoryKey].items.push({
    num: index + 1,
    id: v.id,
    shortcode: v.shortCode,
    url: v.url || `https://www.instagram.com/p/${v.shortCode}/`,
    videoUrl: v.videoUrl,
    title: title,
    detectedAddress: detectedAddress,
    userEdit: userEdit,
    socials: socials,
    categoryName: cl.categoryName,
    inMap: cl.inMap ? '✅ Sí (Aparece en Mapa)' : '❌ No (Es evento/promo sin local fijo)',
    inRoute: cl.inRoute ? '✅ Sí' : '❌ No',
    hasAirbnb: cl.hasAirbnb ? '✅ Sí (Botón Airbnb activo)' : '❌ No',
    likesCount: v.likesCount || 0,
    caption: v.caption || ''
  });
});

let md = `# Catálogo de Videos y Clasificación Granular · Datitos de la Jose

Este documento contiene la lista completa de los **${validVideos.length} videos reales** filtrados (habiendo descartado noticias, accidentes y videos cotidianos de humor/maternidad).

---

## 📋 Resumen por Categorías
- **🏡 1. Cabañas & Alojamientos Airbnb:** ${groups.airbnb.items.length} videos
- **🍔 2. Locales Físicos de Comida:** ${groups.comida.items.length} videos
- **🌲 3. Atractivos Turísticos & Naturaleza:** ${groups.turismo.items.length} videos
- **🎪 4. Eventos & Panoramas Temporales:** ${groups.eventos.items.length} videos
- **🛍️ 5. Tiendas & Productos:** ${groups.tiendas.items.length} videos
- **🎁 6. Sorteos & Concursos:** ${groups.sorteos.items.length} videos
- **📍 7. Otros Rincones por Confirmar:** ${groups.otros.items.length} videos

---

> [!TIP]
> **Instrucciones para el usuario:**
> - Cada video ahora incluye enlaces directos al **Instagram de la Empresa/Local** y a su **WhatsApp**, además del link al video original de la Jose.
> - Puedes seguir editando directamente este archivo Markdown.
> - Si ves un video cuya clasificación esté mal, cambia el valor de **Filtro Asignado**.
> - En **Ubicación Real / Coordenadas**, puedes pegar la dirección física exacta o coordenadas [lat, lng].
> - Los videos **[1]** y **[2]** ya están marcados como ✅ **Verificados** con tus coordenadas.

---
`;

for (const [key, grp] of Object.entries(groups)) {
  md += `\n\n## ${grp.title} (${grp.items.length} videos)\n\n`;

  grp.items.forEach((item, idx) => {
    // Formatear Instagrams
    let igMd = '➖ No especificado';
    if (item.socials.allInstagrams.length > 0) {
      igMd = item.socials.allInstagrams
        .map(h => `[@${h}](https://www.instagram.com/${h}/)`)
        .join(' · ');
    }

    // Formatear WhatsApp
    let waMd = '➖ No especificado en la descripción';
    if (item.socials.whatsapp) {
      waMd = `[Contactar por WhatsApp (${item.socials.waDisplay})](https://wa.me/${item.socials.whatsapp})`;
    }

    // Formatear Ubicación Real del usuario
    let ubiReal = '';
    if (item.userEdit && item.userEdit.verified) {
      ubiReal = `✅ **VERIFICADO:** \`${item.userEdit.realAddress}\` | Coordenadas: \`${item.userEdit.coordinates}\``;
    }

    md += `### [${idx + 1}] ${item.title}\n`;
    md += `- **Link del Video:** [Ver Video en Instagram](${item.url})\n`;
    md += `- **Instagram del Local:** ${igMd}\n`;
    md += `- **WhatsApp Directo:** ${waMd}\n`;
    md += `- **Filtro Asignado:** \`${item.categoryName}\`\n`;
    md += `- **¿Cumple para el Mapa?:** ${item.inMap}\n`;
    md += `- **¿Tiene Botón Airbnb?:** ${item.hasAirbnb}\n`;
    md += `- **¿Añadir a Mi Ruta?:** ${item.inRoute}\n`;
    md += `- **Ubicación Detectada:** \`${item.detectedAddress}\`\n`;
    md += `- **Ubicación Real / Coordenadas (Para Editar):** ${ubiReal}\n`;
    md += `- **Descripción Original:**\n`;
    
    // Formatear caption como blockquote
    const quote = item.caption
      .split('\n')
      .map(l => `> ${l}`)
      .join('\n');
    md += `${quote}\n\n`;
    md += `---\n\n`;
  });
}

fs.writeFileSync('CATALOGO_VIDEOS.md', md, 'utf8');
console.log(`✅ Archivo CATALOGO_VIDEOS.md generado exitosamente con ${validVideos.length} videos enriquecidos con Instagram y WhatsApp.`);
