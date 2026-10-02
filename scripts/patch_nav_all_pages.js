const fs = require('fs');
const path = require('path');

function patchPage(fileName, activeNavId) {
  const filePath = path.join(__dirname, '..', fileName);
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Clean emoji in header
  html = html.replace('<span>🎁 Sorteos & Promos</span>', '<span>Sorteos & Promos</span>');
  html = html.replace('<span>🎁 Sorteos & Promociones</span>', '<span>Sorteos & Promos</span>');

  // 2. Add btn-side-menu-toggle in header if missing
  if (!html.includes('id="btn-side-menu-toggle"')) {
    html = html.replace(
      '</header>',
      `      <!-- Botón Menú Lateral Chic en Header -->
      <button class="btn-side-menu-toggle" id="btn-side-menu-toggle" onclick="window.toggleSideMenu()" title="Abrir menú" aria-label="Abrir menú de navegación">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="2.5"></circle>
          <circle cx="19" cy="12" r="2.5"></circle>
          <circle cx="5" cy="12" r="2.5"></circle>
        </svg>
      </button>
    </div>
  </header>`
    );
  }

  // 3. Add side-menu-drawer and spotify-bottom-nav if missing
  if (!html.includes('id="spotify-bottom-nav"')) {
    const bottomSnippet = `
  <!-- ========================================================================
       MENÚ LATERAL CHIC (DRAWER OFF-CANVAS)
       ======================================================================== -->
  <div class="side-menu-overlay" id="side-menu-overlay" onclick="window.toggleSideMenu()"></div>
  
  <aside class="side-menu-drawer" id="side-menu-drawer" aria-label="Menú principal de navegación">
    <div class="side-menu-header">
      <div class="side-menu-profile">
        <img src="thumbs/logo_insta.jpg" alt="María José" class="side-avatar">
        <div>
          <div class="side-name">Datitos de la Jose</div>
          <div class="side-handle">@datitosdelajose</div>
        </div>
      </div>
      <button class="side-close-btn" onclick="window.toggleSideMenu()" aria-label="Cerrar menú">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>

    <div class="side-menu-body">
      <div class="side-menu-section-title">Secciones de la Guía</div>
      <nav class="side-menu-nav">
        <a href="index.html#explorar" class="side-nav-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          <div class="side-nav-text">
            <strong>Explorar Feed</strong>
            <span>100 lugares curados en Puerto Varas</span>
          </div>
        </a>

        <a href="index.html#mapa-section" class="side-nav-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/></svg>
          <div class="side-nav-text">
            <strong>Mapa Interactivo</strong>
            <span>Pines con coordenadas exactas y rutas</span>
          </div>
        </a>

        <a href="promos.html" class="side-nav-link featured-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.65-.5-.65C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76V8h2v.76L15.38 12 17 10.83 14.92 8H20v6z"/></svg>
          <div class="side-nav-text">
            <strong>Sorteos & Promociones</strong>
            <span class="badge-promo-pill">Concursos activos</span>
          </div>
        </a>

        <a href="empresa.html" class="side-nav-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>
          <div class="side-nav-text">
            <strong>Empresas & Negocios</strong>
            <span>Publicidad, UGC y convenios</span>
          </div>
        </a>

        <a href="quien-soy.html" class="side-nav-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          <div class="side-nav-text">
            <strong>Quién es María José</strong>
            <span>Historia y estilo de vida</span>
          </div>
        </a>
      </nav>

      <div class="side-menu-socials">
        <a href="https://www.instagram.com/datitosdelajose/" target="_blank" rel="noopener" class="side-social-btn ig">
          <span>Instagram @datitosdelajose</span>
        </a>
        <a href="https://wa.me/56968507827?text=Hola%20Jose!%20Te%20contacto%20desde%20la%20web" target="_blank" rel="noopener" class="side-social-btn wa">
          <span>WhatsApp Directo</span>
        </a>
      </div>
    </div>
  </aside>

  <!-- ========================================================================
       BARRA DE NAVEGACIÓN INFERIOR MÓVIL ESTILO SPOTIFY (ONE-THUMB)
       ======================================================================== -->
  <nav class="spotify-bottom-nav" id="spotify-bottom-nav" aria-label="Navegación móvil rápida">
    <a href="index.html#explorar" class="s-nav-item ${activeNavId === 'feed' ? 'active' : ''}" id="s-nav-feed">
      <svg class="s-nav-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
      <span class="s-nav-label">Explorar</span>
    </a>

    <a href="index.html#mapa-section" class="s-nav-item ${activeNavId === 'map' ? 'active' : ''}" id="s-nav-map">
      <svg class="s-nav-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
      </svg>
      <span class="s-nav-label">Mapa</span>
    </a>

    <button type="button" class="s-nav-item ${activeNavId === 'route' ? 'active' : ''}" id="s-nav-route" onclick="if(window.routeManager) window.routeManager.openDrawer(); else document.getElementById('btn-header-route').click();">
      <div class="s-nav-icon-wrapper">
        <svg class="s-nav-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <span class="s-route-badge" id="s-route-badge" style="display:none;">0</span>
      </div>
      <span class="s-nav-label">Mi Ruta</span>
    </button>

    <a href="promos.html" class="s-nav-item ${activeNavId === 'promos' ? 'active' : ''}" id="s-nav-promos">
      <svg class="s-nav-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.65-.5-.65C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76V8h2v.76L15.38 12 17 10.83 14.92 8H20v6z"/>
      </svg>
      <span class="s-nav-label">Sorteos</span>
    </a>

    <button type="button" class="s-nav-item" id="s-nav-more" onclick="window.toggleSideMenu()">
      <svg class="s-nav-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <circle cx="12" cy="12" r="2.5"></circle>
        <circle cx="19" cy="12" r="2.5"></circle>
        <circle cx="5" cy="12" r="2.5"></circle>
      </svg>
      <span class="s-nav-label">Más</span>
    </button>
  </nav>

  <script>
    function toggleSideMenu() {
      const drawer = document.getElementById('side-menu-drawer');
      const overlay = document.getElementById('side-menu-overlay');
      if (!drawer || !overlay) return;
      const isOpen = drawer.classList.contains('is-open');
      if (isOpen) {
        drawer.classList.remove('is-open');
        overlay.classList.remove('is-open');
        document.body.classList.remove('drawer-open-lock');
      } else {
        drawer.classList.add('is-open');
        overlay.classList.add('is-open');
        document.body.classList.add('drawer-open-lock');
      }
    }
    window.toggleSideMenu = toggleSideMenu;
  </script>
`;
    html = html.replace('</body>', bottomSnippet + '\n</body>');
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Patched ' + fileName);
}

patchPage('promos.html', 'promos');
patchPage('empresa.html', '');
