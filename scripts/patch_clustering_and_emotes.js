const fs = require('fs');

let app = fs.readFileSync('js/app.js', 'utf8');

// Replace Leaflet map initialization to create MarkerClusterGroup if available
const oldInitMapMarker = `markersLayer = L.layerGroup().addTo(mapInstance);`;
const newInitMapMarker = `// Usar MarkerClusterGroup con emotes inteligentes para agrupar zonas concurridas
    if (typeof L.markerClusterGroup === 'function') {
      markersLayer = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 42,
        spiderfyOnMaxZoom: true,
        zoomToBoundsOnClick: true,
        iconCreateFunction: function(cluster) {
          const markers = cluster.getAllChildMarkers();
          const count = cluster.getChildCount();

          const catCounts = {};
          const emojiCounts = {};
          markers.forEach(m => {
            const cat = m.options.placeCategory || 'gastronomia';
            const em = m.options.placeEmoji || '📍';
            catCounts[cat] = (catCounts[cat] || 0) + 1;
            emojiCounts[em] = (emojiCounts[em] || 0) + 1;
          });

          // Determinar emote más repetido en la zona
          let dominantEmoji = '🍽️';
          let maxEmojiCount = 0;
          for (const [em, c] of Object.entries(emojiCounts)) {
            if (c > maxEmojiCount) {
              maxEmojiCount = c;
              dominantEmoji = em;
            }
          }

          let dominantCat = 'gastronomia';
          let maxCatCount = 0;
          for (const [cat, c] of Object.entries(catCounts)) {
            if (c > maxCatCount) {
              maxCatCount = c;
              dominantCat = cat;
            }
          }

          const color = CATEGORY_COLORS[dominantCat] || '#ea580c';

          return L.divIcon({
            className: 'custom-cluster-marker-wrap',
            html: \`
              <div class="custom-map-cluster-bubble" style="
                display: inline-flex;
                align-items: center;
                gap: 5px;
                background: #ffffff;
                border: 2.5px solid \${color};
                border-radius: 9999px;
                padding: 4px 10px 4px 8px;
                box-shadow: 0 6px 18px rgba(0,0,0,0.32);
                font-family: 'Plus Jakarta Sans', sans-serif;
                font-weight: 800;
                font-size: 13px;
                color: #191c1f;
                cursor: pointer;
                white-space: nowrap;
              ">
                <span style="font-size: 16px; line-height: 1;">\${dominantEmoji}</span>
                <span style="line-height: 1; color: \${color}; font-weight: 800;">\${count}</span>
              </div>
            \`,
            iconSize: [52, 34],
            iconAnchor: [26, 17]
          });
        }
      });
    } else {
      markersLayer = L.layerGroup();
    }
    markersLayer.addTo(mapInstance);`;

if (app.includes(oldInitMapMarker)) {
  app = app.replace(oldInitMapMarker, newInitMapMarker);
}

// Add CATEGORY_EMOJIS and getPlaceEmoji + update createCustomPinIcon
const oldPinSectionMarker = `  const CATEGORY_COLORS = {
    gastronomia: '#ea580c',
    hospedaje: '#2563eb',
    tiendas: '#7c3aed',
    turismo: '#059669',
    bienestar: '#db2777',
    lluvia: '#0284c7',
    despejado: '#d97706',
    tragos: '#dc2626'
  };

  function createCustomPinIcon(category, placeId) {`;

const newPinSection = `  const CATEGORY_COLORS = {
    gastronomia: '#ea580c',
    hospedaje: '#2563eb',
    tiendas: '#7c3aed',
    turismo: '#059669',
    bienestar: '#db2777',
    lluvia: '#0284c7',
    despejado: '#d97706',
    tragos: '#dc2626'
  };

  const CATEGORY_EMOJIS = {
    gastronomia: '🍽️',
    hospedaje: '🏡',
    turismo: '🌲',
    tiendas: '🛍️',
    bienestar: '🧖',
    lluvia: '☕',
    despejado: '☀️',
    tragos: '🍷'
  };

  // Helper para asignar el emote más específico a cada negocio
  function getPlaceEmoji(place) {
    const name = (place.name || '').toLowerCase();
    const tip = (place.personalTip || '').toLowerCase();
    const tags = (place.tags || []).join(' ').toLowerCase();
    const combined = name + ' ' + tip + ' ' + tags;

    if (combined.includes('café') || combined.includes('cafe') || combined.includes('küchen') || combined.includes('kuchen') || combined.includes('pasteler') || combined.includes('tostadur') || combined.includes('desayuno')) return '☕';
    if (combined.includes('pizza') || combined.includes('pizzeria')) return '🍕';
    if (combined.includes('cerveza') || combined.includes('bar') || combined.includes('pub') || combined.includes('cocktail') || combined.includes('trago') || combined.includes('vino')) return '🍷';
    if (combined.includes('hamburguesa') || combined.includes('burger')) return '🍔';
    if (combined.includes('helad')) return '🍦';
    if (combined.includes('sushi')) return '🍣';
    if (combined.includes('chocolate') || combined.includes('dulce')) return '🍫';
    if (combined.includes('cabaña') || combined.includes('lodge') || combined.includes('hotel') || combined.includes('refugio') || combined.includes('hostal') || combined.includes('camping') || combined.includes('airbnb')) return '🏡';
    if (combined.includes('tinaja') || combined.includes('spa') || combined.includes('masaje') || combined.includes('terma') || combined.includes('piscina')) return '🧖';
    if (combined.includes('mirador') || combined.includes('parque') || combined.includes('volcán') || combined.includes('lago') || combined.includes('salto') || combined.includes('playa') || combined.includes('kayak') || combined.includes('trekking')) return '🌲';
    if (combined.includes('tienda') || combined.includes('artesania') || combined.includes('librería') || combined.includes('souvenir') || combined.includes('queso') || combined.includes('mercado')) return '🛍️';

    return CATEGORY_EMOJIS[place.category] || '📍';
  }

  function createCustomPinIcon(place) {
    const category = place.category;
    const color = CATEGORY_COLORS[category] || '#ea580c';
    const emoji = getPlaceEmoji(place);

    return L.divIcon({
      className: 'custom-leaflet-marker-wrapper',
      html: \`
        <div class="custom-emote-pin" data-marker-id="\${place.id}" style="
          width: 38px;
          height: 38px;
          background: #ffffff;
          border: 2.5px solid \${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <span style="
            transform: rotate(45deg);
            font-size: 19px;
            line-height: 1;
            user-select: none;
            display: inline-block;
          ">\${emoji}</span>
        </div>
      \`,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38]
    });
  }`;

if (app.includes(oldPinSectionMarker)) {
  const pinIdx = app.indexOf(oldPinSectionMarker);
  const endPinIdx = app.indexOf('function renderMapMarkers', pinIdx);
  app = app.substring(0, pinIdx) + newPinSection + '\n\n  ' + app.substring(endPinIdx);
}

// Update renderMapMarkers to pass place and store placeCategory/placeEmoji options on marker
app = app.replace(
  `const customIcon = createCustomPinIcon(place.category, place.id);
      const marker = L.marker([place.coordinates.lat, place.coordinates.lng], { icon: customIcon });`,
  `const placeEmoji = getPlaceEmoji(place);
      const customIcon = createCustomPinIcon(place);
      const marker = L.marker([place.coordinates.lat, place.coordinates.lng], {
        icon: customIcon,
        placeCategory: place.category,
        placeEmoji: placeEmoji
      });`
);

// Update focusPlaceOnMap to use zoomToShowLayer
app = app.replace(
  `        const marker = markerMap.get(placeId);
        if (marker) {
          marker.openPopup();
        }`,
  `        const marker = markerMap.get(placeId);
        if (marker) {
          if (markersLayer && typeof markersLayer.zoomToShowLayer === 'function') {
            markersLayer.zoomToShowLayer(marker, () => {
              marker.openPopup();
            });
          } else {
            marker.openPopup();
          }
        }`
);

fs.writeFileSync('js/app.js', app, 'utf8');
console.log('js/app.js updated with emotes and clustering.');
