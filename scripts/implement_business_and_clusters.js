const fs = require('fs');

// ============================================================================
// 1. PATCH css/style.css: Ensure .nav-links-wrapper is NEVER visible on mobile (<900px)
// ============================================================================
let css = fs.readFileSync('css/style.css', 'utf8');

// Replace .nav-links-wrapper display: flex in mobile media queries
css = css.replace(
  /\.nav-links-wrapper\s*\{\s*display:\s*flex;\s*overflow-x:\s*auto;[\s\S]*?\.nav-link-pill\s*\{[\s\S]*?\}/,
  `.nav-links-wrapper {
    display: none !important;
  }`
);

// Add custom cluster and emote pin animations if not already present
if (!css.includes('.custom-emote-pin')) {
  css += `

/* ==========================================================================
   ESTILOS MAPA: PINES CON EMOTES Y CLUSTERING INTELIGENTE
   ========================================================================== */
.custom-emote-pin {
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
  user-select: none;
}

.custom-emote-pin:hover,
.custom-emote-pin:active {
  transform: rotate(-45deg) scale(1.2) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4) !important;
  z-index: 1000 !important;
}

.custom-map-cluster-bubble {
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
  user-select: none;
}

.custom-map-cluster-bubble:hover,
.custom-map-cluster-bubble:active {
  transform: scale(1.15) !important;
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.42) !important;
}
`;
}

fs.writeFileSync('css/style.css', css, 'utf8');
console.log('css/style.css updated successfully.');

// ============================================================================
// 2. PATCH empresa.html: Fix header tag, cache buster, and ensure clean layout
// ============================================================================
let empresa = fs.readFileSync('empresa.html', 'utf8');
empresa = empresa.replace(/href="css\/style\.css(\?v=[^"]+)?"/g, 'href="css/style.css?v=v6_mobile"');

// Fix closing div in header
empresa = empresa.replace(
  /<button class="btn-route-toggle" id="btn-header-route" title="Ver mi itinerario del día">[\s\S]*?<\/button>\s*<\/div>\s*<!-- Botón Menú Lateral Chic en Header -->\s*<\/div>\s*<\/header>/,
  `<button class="btn-route-toggle" id="btn-header-route" title="Ver mi itinerario del día">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <span>Mi Ruta</span>
        <span class="route-count-badge" style="display: none;">0</span>
      </button>
    </div>
  </header>`
);

fs.writeFileSync('empresa.html', empresa, 'utf8');
console.log('empresa.html updated successfully.');

// ============================================================================
// 3. PATCH index.html: Include Leaflet.markercluster CSS & JS + cache buster
// ============================================================================
let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml.replace(/href="css\/style\.css(\?v=[^"]+)?"/g, 'href="css/style.css?v=v6_mobile"');
indexHtml = indexHtml.replace(/src="js\/app\.js(\?v=[^"]+)?"/g, 'src="js/app.js?v=v6_mobile"');

if (!indexHtml.includes('leaflet.markercluster.js')) {
  // Add CSS in head
  indexHtml = indexHtml.replace(
    '<!-- Estilos Custom -->',
    `<!-- Leaflet MarkerCluster CSS -->\n  <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />\n  <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />\n\n  <!-- Estilos Custom -->`
  );

  // Add JS after Leaflet JS
  indexHtml = indexHtml.replace(
    '<!-- Scripts del Prototipo con cache-busting -->',
    `<!-- Leaflet MarkerCluster JS -->\n  <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>\n\n  <!-- Scripts del Prototipo con cache-busting -->`
  );
}

fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log('index.html updated with MarkerCluster assets.');

// ============================================================================
// 4. Update promos.html & quien-soy.html cache busters
// ============================================================================
['promos.html', 'quien-soy.html'].forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/href="css\/style\.css(\?v=[^"]+)?"/g, 'href="css/style.css?v=v6_mobile"');
    content = content.replace(/src="js\/app\.js(\?v=[^"]+)?"/g, 'src="js/app.js?v=v6_mobile"');
    fs.writeFileSync(f, content, 'utf8');
    console.log(f, 'cache busters updated.');
  }
});
