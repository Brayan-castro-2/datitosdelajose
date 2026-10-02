const fs = require('fs');
const {
  rawData,
  userGroundTruth,
  smartSplitBusiness,
  detectZone,
  extractExplicitStreetAddress,
  extractSocials,
  geocodeNominatim,
  classifySmart,
  geocache
} = require('./business_resolver_engine.js');

const discardKeywords = [
  'tornado', 'emergencia', 'accidente', 'susto', 'luto', 'noticia', 'tragedia', 'incendio', 'robo', 'clima', 'alerta',
  'dibujos de mis hijos', 'hace pocos años (según yo', 'que no gane la rutina', '¿a nosotras nos quieren enseñar?', 
  'teleserie chilena', '¿qué teleserie', 'recién entrabas de mi mano al colegio', 'a estas alturas, si quiero hacer algo lo hago',
  'un poco de humor', 'meme', 'humor', 'chiste', 'reflexión', 'crianza', 'maternidad', 'ser mamá', 'mi hijo', 'mis hijos',
  'esposo', 'marido', 'vida de mamá', 'rutina diaria', 'cosas que me pasan', 'storytime', 'pov:', 'detrás de cámara'
];

async function runPipeline() {
  console.log('🚀 Iniciando pipeline de clasificación automática y geocodificación...');

  const validVideos = rawData.filter(p => {
    if (!p.videoUrl) return false;
    const cap = (p.caption || '').toLowerCase();
    return !discardKeywords.some(kw => cap.includes(kw));
  });

  console.log(`Total videos válidos a procesar: ${validVideos.length}`);

  const processedItems = [];
  let airbnbCount = 0;
  let directHospedajeCount = 0;
  let foodCount = 0;
  let geocodedCount = 0;

  for (let i = 0; i < validVideos.length; i++) {
    const post = validVideos[i];
    const socials = extractSocials(post.caption);
    const classification = classifySmart(post);
    const title = (post.caption || '').split('\n')[0].replace(/[#*`_]/g, '').trim().substring(0, 85) || 'Recomendación de Jose';
    const bizName = classification.bizName || (socials.instagram ? smartSplitBusiness(socials.instagram) : 'Local Recomendado');
    const zone = classification.zone || detectZone(post.caption);

    let lat = classification.lat || null;
    let lng = classification.lng || null;
    let finalAddress = classification.realAddress || null;
    let verified = classification.verified || false;

    // Si ya está en caché geocodificado
    const cacheKey = `${bizName}, ${zone}, Chile`;
    if (!lat && geocache[cacheKey]) {
      lat = geocache[cacheKey].lat;
      lng = geocache[cacheKey].lng;
      finalAddress = geocache[cacheKey].address;
      geocodedCount++;
    }

    if (classification.hasAirbnb) airbnbCount++;
    else if (classification.categoryName.includes('Cabañas') || classification.categoryName.includes('Hospedaje') || classification.categoryName.includes('Camping') || classification.categoryName.includes('Domos') || classification.categoryName.includes('Yurta')) directHospedajeCount++;
    else if (classification.categoryName.includes('Comida') || classification.categoryName.includes('Desayuno') || classification.categoryName.includes('Restaurante')) foodCount++;

    const gmapsQuery = encodeURIComponent(`${bizName}, ${zone}, Chile`);
    const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${gmapsQuery}`;

    processedItems.push({
      idx: i + 1,
      id: post.id,
      shortcode: post.shortCode,
      url: post.url || `https://www.instagram.com/p/${post.shortCode}/`,
      title: title,
      bizName: bizName,
      zone: zone,
      socials: socials,
      categoryName: classification.categoryName,
      inMap: classification.inMap,
      hasAirbnb: classification.hasAirbnb ? '✅ Sí (Botón Airbnb activo)' : '❌ No (Contacto directo / Sin Airbnb)',
      inRoute: classification.inRoute,
      detectedAddress: finalAddress || `Sector ${zone}`,
      lat: lat,
      lng: lng,
      gmapsUrl: gmapsUrl,
      verified: verified,
      caption: post.caption || ''
    });

    if ((i + 1) % 100 === 0 || i === validVideos.length - 1) {
      console.log(`  Progreso: ${i + 1}/${validVideos.length} procesados...`);
    }
  }

  console.log('\n📊 Resumen de Clasificación con Heurísticas:');
  console.log(`- Airbnb Reales (palabra estricta 'airbnb'): ${airbnbCount}`);
  console.log(`- Cabañas & Hospedajes Contacto Directo: ${directHospedajeCount}`);
  console.log(`- Locales de Comida / Restaurantes / Cafés: ${foodCount}`);
  console.log(`- Lugares con Coordenadas Exactas: ${geocodedCount}`);

  // Generar CATALOGO_VIDEOS.md
  let md = `# Catálogo de Videos y Clasificación Granular · Datitos de la Jose

Este documento contiene la lista completa de los **${processedItems.length} videos reales** con nombres de locales limpios (palabras separadas), filtro estricto de Airbnb, enlaces directos a Instagram/WhatsApp y búsqueda en Google Maps.

---

## 📋 Resumen por Filtros Granulares
- **🏡 1. Alojamientos Airbnb Exclusivos:** ${airbnbCount} videos (Solo los que mencionan explícitamente "airbnb" en la descripción)
- **⛺️ 2. Cabañas, Domos, Yurta & Camping Directo:** ${directHospedajeCount} videos (Sin Airbnb, arriendo directo por WhatsApp / Instagram)
- **🍔 3. Locales Físicos de Comida & Cafés:** ${foodCount} videos
- **🌲 4. Atractivos Turísticos, Playas, Tiendas & Rutas:** ${processedItems.length - airbnbCount - directHospedajeCount - foodCount} videos

---

> [!TIP]
> **Heurística Oficial Aplicada (Ground Truth del Usuario):**
> 1. **Búsqueda por Local con Palabras Separadas:** No se usa el texto informal de la descripción (ej: *📍 Km 42 frente a Copec*), sino el **nombre limpio del local** con sus palabras separadas (ej: \`Camping Suyai, Ensenada\`, \`Hotel Germania, Puerto Varas\`, \`Domos Anulen, Los Riscos\`), lo cual arroja el resultado 100% exacto en Mapas.
> 2. **Filtro Estricto de Airbnb:** Solo se asigna el botón de Airbnb si la palabra *"airbnb"* aparece textualmente en la publicación. Todo el resto de cabañas y domos tienen **contacto directo por WhatsApp e Instagram**.
> 3. **Servicios a Domicilio y Rutas:** Los servicios móviles (ej: veterinaria a domicilio) y recorridos de múltiples paradas se marcan como sin chincheta física única.
> 4. **Los 19 videos ya verificados por el usuario** están integrados con sus coordenadas definitivas.

---

`;

  processedItems.forEach(item => {
    let igMd = '➖ No especificado';
    if (item.socials.allInstagrams.length > 0) {
      igMd = item.socials.allInstagrams
        .map(h => `[@${h}](https://www.instagram.com/${h}/)`)
        .join(' · ');
    }

    let waMd = '➖ No especificado en la descripción';
    if (item.socials.whatsapp) {
      waMd = `[Contactar por WhatsApp (${item.socials.waDisplay})](https://wa.me/${item.socials.whatsapp})`;
    }

    let ubiMd = '';
    if (item.lat && item.lng) {
      ubiMd = `${item.verified ? '✅ **VERIFICADO POR USUARIO:** ' : '📍 **COORDENADAS EXACTAS:** '}\`${item.detectedAddress}\` | Coordenadas: \`[${item.lat}, ${item.lng}]\``;
    } else {
      ubiMd = `\`${item.detectedAddress}\` (Comuna: ${item.zone})`;
    }

    md += `### [${item.idx}] ${item.title}\n`;
    md += `- **Nombre del Local (Palabras Separadas):** **${item.bizName}**\n`;
    md += `- **Link del Video Original:** [Ver Video en Instagram](${item.url})\n`;
    md += `- **Instagram del Local:** ${igMd}\n`;
    md += `- **WhatsApp Directo:** ${waMd}\n`;
    md += `- **Buscar en Google Maps:** [🔍 Abrir ${item.bizName} en Google Maps](${item.gmapsUrl})\n`;
    md += `- **Filtro Asignado:** \`${item.categoryName}\`\n`;
    md += `- **¿Cumple para el Mapa?:** ${item.inMap}\n`;
    md += `- **¿Tiene Botón Airbnb?:** ${item.hasAirbnb}\n`;
    md += `- **¿Añadir a Mi Ruta?:** ${item.inRoute}\n`;
    md += `- **Ubicación & Coordenadas:** ${ubiMd}\n`;
    md += `- **Descripción Original:**\n`;
    
    const quote = item.caption
      .split('\n')
      .map(l => `> ${l}`)
      .join('\n');
    md += `${quote}\n\n`;
    md += `---\n\n`;
  });

  fs.writeFileSync('CATALOGO_VIDEOS.md', md, 'utf8');
  console.log(`✅ CATALOGO_VIDEOS.md generado exitosamente con ${processedItems.length} videos.`);
}

runPipeline();
