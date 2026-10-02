const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'css', 'style.css');
let css = fs.readFileSync(cssPath, 'utf8');

const headerFlexOrder = `
/* Flex Ordering para Header Móvil Limpio y Organizado */
@media (max-width: 900px) {
  .site-header {
    padding: 0.5rem 0 !important;
  }
  .header-container {
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 0.5rem 1rem !important;
    gap: 0.5rem !important;
  }
  .brand-wrapper {
    order: 1 !important;
    flex: 0 1 auto !important;
  }
  .header-weather-widget-slot {
    order: 2 !important;
    margin-left: auto !important;
  }
  #btn-header-route, .btn-route-toggle {
    order: 3 !important;
    flex-shrink: 0 !important;
  }
  .search-bar-wrapper {
    order: 4 !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0.2rem 0 !important;
  }
  .nav-links-wrapper {
    order: 5 !important;
    width: 100% !important;
    display: flex !important;
    overflow-x: auto !important;
    padding: 0.2rem 0 !important;
    gap: 0.5rem !important;
    scrollbar-width: none !important;
    -webkit-overflow-scrolling: touch !important;
  }
}
`;

if (!css.includes('Flex Ordering para Header Móvil Limpio')) {
  css += '\n' + headerFlexOrder;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('✅ Header mobile flex order added to css/style.css');
} else {
  console.log('Already present.');
}
