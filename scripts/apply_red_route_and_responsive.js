const fs = require('fs');
const path = require('path');

console.log('--- Aplicando caminito rojo y mejoras responsive ---');

// 1. MODIFICAR js/app.js
console.log('1. Modificando js/app.js...');
let appJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');

// Agregar capas de ruta al mapa y la función updateRouteOnMap
const routeCodeToAdd = `
  // Capas Leaflet dedicadas al Caminito Rojo Interactivo de la Ruta
  let routeLineLayer = null;
  let routeSequenceMarkersLayer = null;

  function initRouteLayers() {
    if (!mapInstance) return;
    if (!routeLineLayer) routeLineLayer = L.layerGroup().addTo(mapInstance);
    if (!routeSequenceMarkersLayer) routeSequenceMarkersLayer = L.layerGroup().addTo(mapInstance);
  }

  function updateRouteSummaryBadge(stopsCount, km, time) {
    let badgeEl = document.getElementById('map-route-summary-floating-badge');
    const mapWrap = document.querySelector('.map-sticky-wrapper');
    if (!mapWrap) return;

    if (stopsCount < 2) {
      if (badgeEl) badgeEl.style.display = 'none';
      return;
    }

    if (!badgeEl) {
      badgeEl = document.createElement('div');
      badgeEl.id = 'map-route-summary-floating-badge';
      badgeEl.className = 'map-floating-route-summary';
      mapWrap.appendChild(badgeEl);
    }

    badgeEl.style.display = 'flex';
    const infoText = km ? \`<strong>\${km} km</strong> (\${time})\` : \`calculando curvas...\`;
    badgeEl.innerHTML = \`
      <div class="route-summary-left">
        <span class="route-pulse-icon">📍</span>
        <span><strong>\${stopsCount} paradas</strong> · \${infoText}</span>
      </div>
      <button type="button" onclick="window.fitMapToRoute()" class="btn-fit-route" title="Ver todo el recorrido">
        🔍 Ver ruta
      </button>
    \`;
  }

  // Caminito Rojo Interactivo: Conecta las paradas añadidas y sigue carreteras con OSRM
  window.updateRouteOnMap = function(fitBounds = false) {
    if (!mapInstance) return;
    initRouteLayers();

    routeLineLayer.clearLayers();
    routeSequenceMarkersLayer.clearLayers();

    if (!window.routeManager) return;
    const board = window.routeManager.getActiveBoard();
    if (!board || !board.stops || board.stops.length === 0) {
      updateRouteSummaryBadge(0, 0, 0);
      return;
    }

    const validStops = board.stops.filter(s => s.coordinates && s.coordinates.lat && s.coordinates.lng);
    if (validStops.length === 0) {
      updateRouteSummaryBadge(0, 0, 0);
      return;
    }

    // Agregar pines numerados ①, ②, ③ con aro brillante para cada parada
    validStops.forEach((stop, index) => {
      const numIcon = L.divIcon({
        className: 'route-sequence-marker-container',
        html: \`
          <div class="route-number-badge" data-route-stop-id="\${stop.id}">
            <span class="route-badge-num">\${index + 1}</span>
          </div>
        \`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([stop.coordinates.lat, stop.coordinates.lng], {
        icon: numIcon,
        zIndexOffset: 1200 + index
      });

      marker.bindPopup(\`
        <div class="popup-card-content" style="min-width:210px;">
          <div style="font-size:0.75rem; font-weight:800; color:#E60023; display:flex; align-items:center; gap:4px;">
            <span>📍 Parada \${index + 1} de tu Ruta</span>
          </div>
          <h4 style="font-size:0.95rem; font-weight:800; margin:0.25rem 0;">\${stop.name}</h4>
          <div style="font-size:0.78rem; color:#555; margin-bottom:0.45rem;">\${stop.address || stop.zone}</div>
          <div style="font-size:0.75rem; color:#b45309; font-style:italic; margin-bottom:0.5rem;">"\${stop.personalTip || ''}"</div>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" class="btn-uber-mini" onclick="window.openPostDetailModal('\${stop.id}')" style="padding:4px 8px; font-size:0.75rem; background:#E60023; color:white; border:none;">👁️ Ver detalle</button>
            <button type="button" class="btn-uber-mini" onclick="window.routeManager.removePlace('\${stop.id}')" style="padding:4px 8px; font-size:0.75rem; background:#f3f4f6; color:#333;">Quitar parada</button>
          </div>
        </div>
      \`);

      marker.addTo(routeSequenceMarkersLayer);
    });

    if (validStops.length >= 2) {
      const coords = validStops.map(s => [s.coordinates.lat, s.coordinates.lng]);

      // Trazado instantáneo: Caminito rojo con resplandor y línea animada
      L.polyline(coords, {
        color: '#E60023',
        weight: 9,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(routeLineLayer);

      L.polyline(coords, {
        color: '#E60023',
        weight: 4.5,
        opacity: 0.95,
        dashArray: '10, 12',
        className: 'animated-route-polyline'
      }).addTo(routeLineLayer);

      updateRouteSummaryBadge(validStops.length, null, null);

      // Consulta OSRM para seguir las curvas exactas de calles y carreteras del lago
      const osrmCoords = validStops.map(s => \`\${s.coordinates.lng},\${s.coordinates.lat}\`).join(';');
      fetch(\`https://router.project-osrm.org/route/v1/driving/\${osrmCoords}?overview=full&geometries=geojson\`)
        .then(res => res.json())
        .then(data => {
          if (data.code === 'Ok' && data.routes && data.routes[0]) {
            const r = data.routes[0];
            const roadPoints = r.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

            routeLineLayer.clearLayers();
            L.polyline(roadPoints, {
              color: '#E60023',
              weight: 9,
              opacity: 0.35,
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(routeLineLayer);

            L.polyline(roadPoints, {
              color: '#E60023',
              weight: 4.5,
              opacity: 0.95,
              dashArray: '10, 12',
              className: 'animated-route-polyline'
            }).addTo(routeLineLayer);

            const km = (r.distance / 1000).toFixed(1);
            const min = Math.round(r.duration / 60);
            const timeStr = min >= 60 ? \`\${Math.floor(min/60)}h \${min%60}m\` : \`\${min} min\`;
            updateRouteSummaryBadge(validStops.length, km, timeStr);
          }
        })
        .catch(() => {
          // Si falla o no hay conexión, se mantiene el trazo directo suave
        });

      if (fitBounds) {
        mapInstance.fitBounds(L.latLngBounds(coords).pad(0.2));
      }
    } else {
      updateRouteSummaryBadge(validStops.length, 0, 0);
    }
  };

  window.fitMapToRoute = function() {
    if (!mapInstance || !window.routeManager) return;
    const board = window.routeManager.getActiveBoard();
    if (!board || !board.stops) return;
    const valid = board.stops.filter(s => s.coordinates && s.coordinates.lat && s.coordinates.lng);
    if (valid.length > 0) {
      const coords = valid.map(s => [s.coordinates.lat, s.coordinates.lng]);
      mapInstance.fitBounds(L.latLngBounds(coords).pad(0.25));
    }
  };
`;

// Insertar al final de initLeafletMap o donde se inicializa el mapa
if (!appJs.includes('window.updateRouteOnMap')) {
  appJs = appJs.replace(
    'renderMapMarkers(false);',
    `renderMapMarkers(false);\n    initRouteLayers();\n    window.updateRouteOnMap(false);`
  );
  // Añadir las funciones antes del cierre de initPlacesApp
  appJs = appJs.replace(
    'initLeafletMap();',
    `${routeCodeToAdd}\n  initLeafletMap();`
  );
}

// Mobile View Toggle Logic
if (!appJs.includes('window.toggleMobileView')) {
  const mobileToggleCode = `
  // Control de vista móvil: Alternar entre Lista de Tarjetas y Mapa
  window.toggleMobileView = function() {
    const layout = document.getElementById('main-content-layout');
    const btn = document.getElementById('mobile-view-toggle-btn');
    const icon = btn ? btn.querySelector('.mobile-toggle-icon') : null;
    const text = btn ? btn.querySelector('.mobile-toggle-text') : null;

    if (!layout) return;

    if (layout.classList.contains('mobile-view-map')) {
      // Volver a Lista
      layout.classList.remove('mobile-view-map');
      if (icon) icon.textContent = '🗺️';
      if (text) text.textContent = 'Ver Mapa';
      const exploreSec = document.getElementById('explorar');
      if (exploreSec) exploreSec.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Ir a Mapa
      layout.classList.add('mobile-view-map');
      if (icon) icon.textContent = '📋';
      if (text) text.textContent = 'Ver Lista';
      if (mapInstance) {
        setTimeout(() => {
          mapInstance.invalidateSize();
          window.fitMapToRoute();
        }, 200);
      }
      const mapSec = document.getElementById('leaflet-map');
      if (mapSec) mapSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  `;
  appJs += `\n${mobileToggleCode}\n`;
}

fs.writeFileSync(path.join(__dirname, '..', 'js', 'app.js'), appJs, 'utf8');
console.log('✅ js/app.js actualizado con soporte para caminito rojo y vista móvil');

// 2. CONECTAR NOTIFICADOR DE ROUTE-BUILDER A UPDATE ROUTE ON MAP
console.log('2. Conectando js/route-builder.js con el caminito del mapa...');
let routeJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'route-builder.js'), 'utf8');

if (!routeJs.includes('window.updateRouteOnMap();')) {
  routeJs = routeJs.replace(
    'this.renderDrawerContent();',
    `this.renderDrawerContent();\n    if (typeof window.updateRouteOnMap === 'function') window.updateRouteOnMap();`
  );
  fs.writeFileSync(path.join(__dirname, '..', 'js', 'route-builder.js'), routeJs, 'utf8');
  console.log('✅ js/route-builder.js enlazado');
}

// 3. ACTUALIZAR css/style.css CON ESTILOS DEL CAMINITO ROJO Y OVERHAUL RESPONSIVE
console.log('3. Actualizando css/style.css con diseño responsive y estilos del camino rojo...');
let css = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');

const newResponsiveAndRouteStyles = `
/* ==========================================================================
   CAMINITO ROJO INTERACTIVO EN EL MAPA & PINES NUMERADOS (Wanderlog Style)
   ========================================================================== */
@keyframes flowRouteDash {
  to {
    stroke-dashoffset: -44;
  }
}

.animated-route-polyline {
  stroke-linecap: round;
  stroke-linejoin: round;
  animation: flowRouteDash 1.2s linear infinite;
  filter: drop-shadow(0 2px 6px rgba(230, 0, 35, 0.4));
}

.route-sequence-marker-container {
  background: transparent;
  border: none;
}

.route-number-badge {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #E60023 0%, #B8001B 100%);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.95rem;
  font-family: var(--font-display, sans-serif);
  box-shadow: 0 4px 14px rgba(230, 0, 35, 0.5), 0 0 0 3px #ffffff;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.route-number-badge:hover {
  transform: scale(1.18);
}

.route-number-badge::after {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 50%;
  border: 2px solid #E60023;
  animation: pulseRouteRing 2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
  pointer-events: none;
}

@keyframes pulseRouteRing {
  0% { transform: scale(1); opacity: 0.9; }
  60% { transform: scale(1.6); opacity: 0; }
  100% { transform: scale(1.6); opacity: 0; }
}

.map-floating-route-summary {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 800;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1.5px solid #E60023;
  border-radius: 9999px;
  padding: 0.5rem 1rem;
  box-shadow: 0 10px 25px rgba(230, 0, 35, 0.2);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.84rem;
  color: #191c1f;
  animation: slideDownSummary 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
}

@keyframes slideDownSummary {
  from { opacity: 0; transform: translate(-50%, -12px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

.btn-fit-route {
  background: #E60023;
  color: white;
  border: none;
  border-radius: 9999px;
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;
}

.btn-fit-route:hover {
  background: #b8001b;
  transform: scale(1.04);
}

/* Botón flotante móvil para alternar Vista Lista / Mapa */
.mobile-map-view-toggle {
  display: none;
}

/* ==========================================================================
   OVERHAUL COMPLETO DE MODO RESPONSIVE (MÓVIL & TABLET)
   ========================================================================== */
@media (max-width: 900px) {
  .site-header {
    padding: 0.5rem 0;
  }
  
  .header-container {
    flex-direction: column;
    align-items: stretch;
    gap: 0.6rem;
    padding: 0.5rem 1rem;
  }

  .header-top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 0.5rem;
  }

  .brand-wrapper {
    gap: 0.5rem;
  }

  .brand-icon {
    width: 38px;
    height: 38px;
  }

  .brand-title {
    font-size: 1.05rem;
  }

  .brand-subtitle {
    font-size: 0.72rem;
  }

  .header-right-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .search-bar-wrapper {
    width: 100%;
    max-width: 100%;
    margin: 0;
  }

  .search-input-box {
    height: 42px;
    font-size: 0.88rem;
    padding-left: 2.6rem;
  }

  .nav-links-wrapper {
    display: flex;
    overflow-x: auto;
    width: 100%;
    padding: 0.2rem 0;
    gap: 0.5rem;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .nav-links-wrapper::-webkit-scrollbar {
    display: none;
  }

  .nav-link-pill {
    padding: 0.4rem 0.85rem;
    font-size: 0.82rem;
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* Carrusel Hero en Tablet/Móvil */
  .hero-section {
    padding: 0.5rem 1rem 1rem;
  }

  .hero-carousel-container {
    height: 380px;
    border-radius: 20px;
  }

  .hero-content {
    padding: 1.5rem 1.25rem;
  }

  .hero-tag {
    font-size: 0.75rem;
    padding: 0.25rem 0.65rem;
    margin-bottom: 0.6rem;
  }

  .hero-title {
    font-size: 1.5rem;
    line-height: 1.25;
    margin-bottom: 0.5rem;
  }

  .hero-subtitle {
    font-size: 0.88rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 1.2rem;
  }

  .hero-cta-group {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .btn-hero-primary, .btn-hero-secondary {
    justify-content: center;
    padding: 0.75rem 1.2rem;
    font-size: 0.88rem;
    width: 100%;
  }

  /* Sección de Filtros */
  .filter-section {
    padding: 1rem 1rem 0.5rem;
  }

  .filter-section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .view-switcher-group {
    display: none; /* En móvil se controla con el botón flotante */
  }

  .mood-pills-scroller {
    padding: 0.3rem 0 0.8rem;
    gap: 0.45rem;
    scrollbar-width: none;
  }

  .mood-pills-scroller::-webkit-scrollbar {
    display: none;
  }

  .mood-pill-btn {
    padding: 0.45rem 0.85rem;
    font-size: 0.82rem;
    white-space: nowrap;
    border-radius: 9999px;
  }

  /* Grilla Pinterest en Móvil */
  .layout-split {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0 1rem;
    margin-bottom: 5rem;
  }

  .cards-pinterest-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.2rem;
  }

  .card-img {
    height: 220px;
  }

  .card-body {
    padding: 1rem;
  }

  .card-title {
    font-size: 1.15rem;
  }

  /* Mapa Sticky en Móvil */
  .map-sticky-wrapper {
    position: relative;
    top: 0;
    height: 380px;
    border-radius: 20px;
    margin-top: 1rem;
    order: 2;
  }

  /* Alternar vista con clase .mobile-view-map */
  .main-content-layout.mobile-view-map .cards-pinterest-grid {
    display: none !important;
  }

  .main-content-layout.mobile-view-map .map-sticky-wrapper {
    height: 75vh;
    margin-top: 0;
    position: sticky;
    top: 90px;
  }

  /* Botón Flotante para cambiar entre Mapa y Lista en Celular */
  .mobile-map-view-toggle {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 990;
    background: #191c1f;
    color: #ffffff;
    border: none;
    border-radius: 9999px;
    padding: 0.8rem 1.6rem;
    font-size: 0.95rem;
    font-weight: 800;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15);
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease;
  }

  .mobile-map-view-toggle:active {
    transform: translateX(-50%) scale(0.95);
  }

  /* Drawer Mi Ruta a ancho completo en móviles */
  .route-drawer {
    width: 100vw;
    max-width: 100vw;
  }

  .drawer-footer {
    position: sticky;
    bottom: 0;
    background: #ffffff;
    box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.08);
  }
}

@media (max-width: 540px) {
  .cards-pinterest-grid {
    grid-template-columns: 1fr;
    max-width: 440px;
    margin: 0 auto;
  }
  
  .card-img {
    height: 200px;
  }

  .header-weather-widget-slot {
    display: none; /* Mantener limpio en pantallas muy estrechas */
  }

  .site-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .brand-title {
    font-size: 0.98rem;
  }

  .btn-route-toggle {
    padding: 0.45rem 0.85rem;
    font-size: 0.8rem;
  }
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'css', 'style.css'), css + '\n' + newResponsiveAndRouteStyles, 'utf8');
console.log('✅ css/style.css actualizado');

// 4. INYECTAR BOTÓN FLOTANTE MÓVIL EN index.html
console.log('4. Inyectando botón flotante móvil en index.html...');
let indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

if (!indexHtml.includes('mobile-map-view-toggle')) {
  const toggleBtnHtml = `
  <!-- Botón Flotante Inteligente para Móvil: Alternar Feed / Mapa -->
  <button type="button" class="mobile-map-view-toggle" id="mobile-view-toggle-btn" onclick="window.toggleMobileView()">
    <span class="mobile-toggle-icon">🗺️</span>
    <span class="mobile-toggle-text">Ver Mapa</span>
  </button>
  `;
  indexHtml = indexHtml.replace('</body>', `${toggleBtnHtml}\n</body>`);
  fs.writeFileSync(path.join(__dirname, '..', 'index.html'), indexHtml, 'utf8');
  console.log('✅ Botón flotante móvil inyectado en index.html');
}

console.log('--- ¡Todo aplicado con éxito! ---');
