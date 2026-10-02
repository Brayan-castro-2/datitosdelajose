const fs = require('fs');

// 1. Patch promos.html header and bottom nav
if (fs.existsSync('promos.html')) {
  let html = fs.readFileSync('promos.html', 'utf8');

  // Fix extra closing div in header
  html = html.replace(
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

  // Update cache busters
  html = html.replace(/css\/style\.css\?v=[^"']+/g, 'css/style.css?v=v5_mobile');
  html = html.replace(/js\/app\.js\?v=[^"']+/g, 'js/app.js?v=v5_mobile');

  fs.writeFileSync('promos.html', html, 'utf8');
  console.log('promos.html patched successfully.');
}

// 2. Patch quien-soy.html scripts if missing
if (fs.existsSync('quien-soy.html')) {
  let html = fs.readFileSync('quien-soy.html', 'utf8');

  if (!html.includes('js/reels-showcase.js')) {
    const scriptsBlock = `
  <!-- Scripts del Prototipo con cache-busting -->
  <script src="js/places-data.js?v=top100"></script>
  <script src="js/curated-routes.js?v=top100"></script>
  <script src="js/reels-data.js?v=v5_mobile"></script>
  <script src="js/reels-showcase.js?v=v5_mobile"></script>
  <script src="js/route-builder.js?v=v5_mobile"></script>
  <script src="js/weather-service.js?v=v5_mobile"></script>
  <script src="js/search-engine.js?v=v5_mobile"></script>
`;
    html = html.replace('</body>', `${scriptsBlock}\n</body>`);
  }

  html = html.replace(/css\/style\.css\?v=[^"']+/g, 'css/style.css?v=v5_mobile');
  html = html.replace(/js\/app\.js\?v=[^"']+/g, 'js/app.js?v=v5_mobile');
  fs.writeFileSync('quien-soy.html', html, 'utf8');
  console.log('quien-soy.html patched successfully.');
}

// 3. Patch index.html & empresa.html cache busters
['index.html', 'empresa.html'].forEach(f => {
  if (fs.existsSync(f)) {
    let html = fs.readFileSync(f, 'utf8');
    html = html.replace(/css\/style\.css\?v=[^"']+/g, 'css/style.css?v=v5_mobile');
    html = html.replace(/js\/app\.js\?v=[^"']+/g, 'js/app.js?v=v5_mobile');
    fs.writeFileSync(f, html, 'utf8');
    console.log(f, 'cache busters updated.');
  }
});

// 4. Update js/app.js for real HTML5 video playback
if (fs.existsSync('js/app.js')) {
  let app = fs.readFileSync('js/app.js', 'utf8');

  // Replace video playback block inside openPostDetailModal
  const oldMediaBoxMarker = '// Reproductor de Video Directo o Iframe Embed Interactivo de Instagram';
  const newMediaBoxCode = `// Reproductor de Video Directo o Iframe Embed Interactivo de Instagram
  if (mediaBox) {
    const code = item.shortcode || item.shortCode;
    const directVideoUrl = item.videoUrl;
    const posterImg = item.image || item.poster || item.fallbackPoster || '';

    if (code) {
      mediaBox.innerHTML = \`
        <div style="position:relative; width:100%; display:flex; flex-direction:column; align-items:center; background:#000; border-radius:14px; overflow:hidden;">
          <video 
            src="/api/video-stream?code=\${code}" 
            controls 
            autoplay 
            playsinline 
            loop 
            poster="\${posterImg}"
            style="width:100%; max-height:70vh; object-fit:contain; background:#000;"
            onerror="this.onerror=null; this.parentElement.innerHTML = \\\`
              <iframe 
                src='https://www.instagram.com/reel/\${code}/embed/' 
                style='width:100%; height:490px; border:none; background:#fff;' 
                frameborder='0' 
                scrolling='no' 
                allowtransparency='true' 
                allow='autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share'>
              </iframe>
              <div style='padding:0.75rem 1rem; width:100%; background:#18181b; display:flex; align-items:center; justify-content:center; box-sizing:border-box;'>
                <a href='https://www.instagram.com/reel/\${code}/' target='_blank' rel='noopener' style='display:inline-flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:0.75rem 1.2rem; background:linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); color:#fff; font-weight:700; font-size:0.9rem; text-decoration:none; border-radius:9999px; box-shadow:0 4px 14px rgba(225,48,108,0.4); text-align:center;'>
                  <span>▶ Ver Reel en Instagram (@datitosdelajose)</span>
                </a>
              </div>
            \\\`;"
          >
          </video>
          <div style="padding:0.55rem 0.85rem; width:100%; background:#18181b; display:flex; align-items:center; justify-content:space-between; box-sizing:border-box; gap:8px;">
            <span style="color:#a1a1aa; font-size:0.8rem; font-weight:600; display:inline-flex; align-items:center; gap:6px;">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#22c55e;"></span> Reproduciendo video
            </span>
            <a href="https://www.instagram.com/reel/\${code}/" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:6px; padding:0.4rem 0.85rem; background:linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); color:#fff; font-weight:700; font-size:0.78rem; text-decoration:none; border-radius:9999px;">
              <span>Abrir en Instagram ↗</span>
            </a>
          </div>
        </div>
      \`;
    } else if (directVideoUrl) {
      mediaBox.innerHTML = \`
        <div style="position:relative; width:100%; min-height:420px; display:flex; align-items:center; justify-content:center; background:#000; border-radius:14px; overflow:hidden;">
          <video 
            src="\${directVideoUrl}" 
            controls 
            autoplay 
            playsinline 
            loop 
            poster="\${posterImg}"
            style="width:100%; max-height:70vh; object-fit:contain; background:#000;">
          </video>
        </div>
      \`;
    } else {
      mediaBox.innerHTML = \`
        <div style="position:relative; width:100%; min-height:420px; display:flex; align-items:center; justify-content:center; background:#111; border-radius:14px; overflow:hidden;">
          <img src="\${posterImg}" alt="\${item.name || ''}" style="width:100%; max-height:70vh; object-fit:contain;" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';">
        </div>
      \`;
    }
  }`;

  const mediaBoxRegex = /\/\/ Reproductor de Video Directo o Iframe Embed Interactivo de Instagram[\s\S]*?if \(mediaBox\) \{[\s\S]*?\}\s*\}\s*if \(postModal\) \{/m;
  if (mediaBoxRegex.test(app)) {
    app = app.replace(mediaBoxRegex, `${newMediaBoxCode}\n\n  if (postModal) {`);
  }

  // Add hash handling at DOMContentLoaded
  if (!app.includes('window.location.hash')) {
    app = app.replace(
      'initPlacesApp();',
      `initPlacesApp();
  // Manejo de navegación por hash (ej: desde otras pestañas)
  if (window.location.hash === '#mapa-section' || window.location.hash === '#mapa') {
    setTimeout(() => { if (typeof setMobileNav === 'function') setMobileNav('map'); }, 200);
  } else if (window.location.hash === '#explorar') {
    setTimeout(() => { if (typeof setMobileNav === 'function') setMobileNav('feed'); }, 200);
  }`
    );
  }

  fs.writeFileSync('js/app.js', app, 'utf8');
  console.log('js/app.js updated.');
}

// 5. Update js/reels-showcase.js for real HTML5 video playback in quien-soy.html
if (fs.existsSync('js/reels-showcase.js')) {
  let rs = fs.readFileSync('js/reels-showcase.js', 'utf8');
  const oldReelsMediaRegex = /\/\/ Inyectar Reproductor Nativo de Video o Iframe de Respaldo[\s\S]*?const mediaBox = document\.getElementById\('reelModalMediaBox'\);[\s\S]*?modal\.classList\.add\('active'\);/;
  
  const newReelsMediaCode = `// Inyectar Reproductor Nativo de Video o Iframe de Respaldo
  const mediaBox = document.getElementById('reelModalMediaBox');
  if (mediaBox) {
    const code = item.shortcode || item.shortCode;
    const directVideoUrl = item.videoUrl;
    const posterImg = item.poster || item.fallbackPoster || '';

    if (code) {
      mediaBox.innerHTML = \`
        <div style="position:relative; width:100%; display:flex; flex-direction:column; align-items:center; background:#000; border-radius:14px; overflow:hidden;">
          <video 
            src="/api/video-stream?code=\${code}" 
            controls 
            autoplay 
            playsinline 
            loop 
            poster="\${posterImg}"
            style="width:100%; max-height:70vh; object-fit:contain; background:#000;"
            onerror="this.onerror=null; this.parentElement.innerHTML = \\\`
              <iframe 
                src='https://www.instagram.com/reel/\${code}/embed/' 
                style='width:100%; height:540px; border:none; background:#fff;' 
                frameborder='0' 
                scrolling='no' 
                allowtransparency='true' 
                allow='autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share'>
              </iframe>
              <div style='padding:0.75rem 1rem; width:100%; background:#18181b; display:flex; align-items:center; justify-content:center; box-sizing:border-box;'>
                <a href='https://www.instagram.com/reel/\${code}/' target='_blank' rel='noopener' style='display:inline-flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:0.75rem 1.2rem; background:linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); color:#fff; font-weight:700; font-size:0.9rem; text-decoration:none; border-radius:9999px; box-shadow:0 4px 14px rgba(225,48,108,0.4); text-align:center;'>
                  <span>▶ Ver Reel en Instagram (@datitosdelajose)</span>
                </a>
              </div>
            \\\`;"
          >
          </video>
          <div style="padding:0.55rem 0.85rem; width:100%; background:#18181b; display:flex; align-items:center; justify-content:space-between; box-sizing:border-box; gap:8px;">
            <span style="color:#a1a1aa; font-size:0.8rem; font-weight:600; display:inline-flex; align-items:center; gap:6px;">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#22c55e;"></span> Reproduciendo video
            </span>
            <a href="https://www.instagram.com/reel/\${code}/" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:6px; padding:0.4rem 0.85rem; background:linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); color:#fff; font-weight:700; font-size:0.78rem; text-decoration:none; border-radius:9999px;">
              <span>Abrir en Instagram ↗</span>
            </a>
          </div>
        </div>
      \`;
    } else if (directVideoUrl) {
      mediaBox.innerHTML = \`
        <div class="reel-iframe-wrapper">
          <video 
            src="\${directVideoUrl}" 
            controls 
            autoplay 
            playsinline 
            loop 
            poster="\${posterImg}"
            style="width: 100%; height: 100%; max-height: 80vh; object-fit: contain; background: #000; border-radius: 8px;">
          </video>
        </div>
      \`;
    } else {
      mediaBox.innerHTML = \`
        <div class="reel-iframe-wrapper" style="display:flex; align-items:center; justify-content:center; background:#000;">
          <img src="\${posterImg}" style="width:100%; max-height:80vh; object-fit:contain; border-radius:8px;">
        </div>
      \`;
    }
  }

  modal.classList.add('active');`;

  if (oldReelsMediaRegex.test(rs)) {
    rs = rs.replace(oldReelsMediaRegex, newReelsMediaCode);
    fs.writeFileSync('js/reels-showcase.js', rs, 'utf8');
    console.log('js/reels-showcase.js updated.');
  }
}
