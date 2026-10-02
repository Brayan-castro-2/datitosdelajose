const fs = require('fs');
const path = require('path');

const files = ['index.html', 'quien-soy.html', 'promos.html', 'empresa.html'];

files.forEach(fileName => {
  const filePath = path.join(__dirname, '..', fileName);
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Clean out any misplaced btn-side-menu-toggle
  html = html.replace(/<button class="btn-side-menu-toggle"[\s\S]*?<\/button>/g, '');

  // 2. Put btn-side-menu-toggle right at the beginning of header-container
  const toggleBtnHtml = `<button class="btn-side-menu-toggle" id="btn-side-menu-toggle" onclick="window.toggleSideMenu()" title="Abrir menú" aria-label="Abrir menú de navegación">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <line x1="4" y1="6" x2="20" y2="6"></line>
          <line x1="4" y1="12" x2="20" y2="12"></line>
          <line x1="4" y1="18" x2="20" y2="18"></line>
        </svg>
      </button>`;

  html = html.replace(
    /(<div class="header-container">)/,
    `$1\n      ${toggleBtnHtml}`
  );

  // 3. Clean any emoji from Sorteos in nav pills
  html = html.replace('<span>🎁 Sorteos & Promos</span>', '<span>Sorteos & Promos</span>');
  html = html.replace('<span>🎁 Sorteos & Promociones</span>', '<span>Sorteos & Promos</span>');

  // 4. Update the bottom nav so item 4 is "Jose"
  const isQuienSoy = fileName === 'quien-soy.html';
  const isIndex = fileName === 'index.html';

  const oldSorteosNavRegex = /<a href="promos\.html" class="s-nav-item[^"]*" id="s-nav-promos">[\s\S]*?<\/a>/;
  const newJoseNav = `<a href="quien-soy.html" class="s-nav-item ${isQuienSoy ? 'active' : ''}" id="s-nav-jose">
      <svg class="s-nav-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
      <span class="s-nav-label">Jose</span>
    </a>`;

  if (oldSorteosNavRegex.test(html)) {
    html = html.replace(oldSorteosNavRegex, newJoseNav);
  }

  // 5. In promos.html, make sure active is not stuck
  if (fileName === 'promos.html') {
    html = html.replace('class="s-nav-item active" id="s-nav-promos"', 'class="s-nav-item" id="s-nav-promos"');
  }

  // 6. Bump cache busters in head
  html = html.replace(/css\/style\.css\?v=[^"']*/g, 'css/style.css?v=v4_mobile');
  html = html.replace(/js\/app\.js\?v=[^"']*/g, 'js/app.js?v=v4_mobile');
  html = html.replace(/js\/places-data\.js\?v=[^"']*/g, 'js/places-data.js?v=v4_mobile');

  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Successfully patched header and bottom nav in ' + fileName);
});
